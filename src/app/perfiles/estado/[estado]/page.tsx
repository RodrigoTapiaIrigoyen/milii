import { Metadata } from 'next';
import { connectDB } from '@/lib/db';
import { Profile } from '@/models/Profile';
import PerfilClientPage from '../[id]/PerfilClientPage';

interface Props {
  params: { estado: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const estado = decodeURIComponent(params.estado);
  const title = `Escorts en ${estado} | PlacerLux`;
  const description = `Directorio de escorts, scorts y acompañantes en ${estado}, México. Perfiles premium verificados, fotos reales y contacto directo.`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://placerlux.lat';
  return {
    title,
    description,
    alternates: {
      canonical: `${appUrl}/perfiles/estado/${params.estado}`,
    },
    openGraph: {
      title,
      description,
      url: `${appUrl}/perfiles/estado/${params.estado}`,
      type: 'website',
      siteName: 'PlacerLux',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function PerfilesEstadoPage({ params }: Props) {
  await connectDB();
  const estado = decodeURIComponent(params.estado);
  const profiles = await Profile.find({
    isPublished: true,
    'location.state': estado,
  })
    .select('name age gender description location services photos verification')
    .lean();

  // JSON-LD ItemList para SEO
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://placerlux.lat';
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'name': `Escorts en ${estado}`,
    'itemListElement': profiles.map((p: any, i: number) => ({
      '@type': 'ListItem',
      'position': i + 1,
      'url': `${appUrl}/perfiles/${p._id}`,
      'name': p.name,
      'image': p.photos?.[0] || undefined,
      'description': p.description?.slice(0, 120) || undefined,
      'address': {
        '@type': 'PostalAddress',
        'addressRegion': estado,
        'addressCountry': 'MX',
      },
    })),
  };

  return (
    <>
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />
      <h1 className="text-3xl font-bold mb-6">Escorts en {estado}</h1>
      {profiles.length === 0 ? (
        <p>No hay perfiles publicados en este estado aún.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {profiles.map((profile: any) => (
            <PerfilClientPage key={profile._id} initialProfile={profile} />
          ))}
        </div>
      )}
    </>
  );
}
