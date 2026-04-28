import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/db';
import { Profile } from '@/models/Profile';
import PerfilClientPage from './PerfilClientPage';

interface Props {
  params: { id: string };
}

// =============================================
// Metadata dinámica para SEO / Open Graph
// =============================================
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    await connectDB();
    const profile = await Profile.findOne({
      _id: params.id,
      isPublished: true,
    }).lean();

    if (!profile) {
      return { title: 'Perfil no encontrado — PlacerLux' };
    }

    const name = (profile as any).name as string;
    const state = (profile as any).location?.state || '';
    const city = (profile as any).location?.city || '';
    const services: string[] = (profile as any).services || [];
    const rawDescription: string = (profile as any).description || '';
    const photo: string | undefined = (profile as any).photos?.[0];
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://placerlux.lat';

    const servicesSummary = services.slice(0, 3).join(', ');
    const locationSummary = [city, state].filter(Boolean).join(', ');
    const title = `${name}${servicesSummary ? ` — ${servicesSummary}` : ''}${locationSummary ? ` en ${locationSummary}` : ''} | PlacerLux`;
    const description =
      rawDescription.slice(0, 155) ||
      `Perfil de ${name} en PlacerLux.${servicesSummary ? ` ${servicesSummary}.` : ''}${locationSummary ? ` ${locationSummary}.` : ''}`;

    return {
      title,
      description,
      openGraph: {
        title: `${name} | PlacerLux`,
        description,
        images: photo ? [{ url: photo, width: 800, height: 600, alt: name }] : [],
        url: `${appUrl}/perfiles/${params.id}`,
        type: 'profile',
        siteName: 'PlacerLux',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${name} | PlacerLux`,
        description,
        images: photo ? [photo] : [],
      },
      alternates: {
        canonical: `${appUrl}/perfiles/${params.id}`,
      },
    };
  } catch {
    return { title: 'PlacerLux — Perfiles Profesionales' };
  }
}

// =============================================
// Server Component — renderiza con datos pre-cargados
// =============================================
export default async function PerfilPublicoPage({ params }: Props) {
  await connectDB();

  let profile;
  try {
    profile = await Profile.findOne({
      _id: params.id,
      isPublished: true,
    }).lean();
  } catch {
    notFound();
  }

  if (!profile) {
    notFound();
  }

  // Serializar el documento Mongoose (ObjectIds → strings)
  const serialized = JSON.parse(JSON.stringify(profile));

  return <PerfilClientPage initialProfile={serialized} />;
}
