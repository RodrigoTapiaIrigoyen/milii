import { MetadataRoute } from 'next';
import { connectDB } from '@/lib/db';
import { Profile } from '@/models/Profile';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://placerlux.lat';

  // Páginas estáticas
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: appUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${appUrl}/perfiles`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${appUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${appUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${appUrl}/legal/terminos`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${appUrl}/legal/privacidad`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${appUrl}/legal/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  // Páginas dinámicas: un perfil por URL
  let profilePages: MetadataRoute.Sitemap = [];
  try {
    await connectDB();
    const profiles = await Profile.find({
      isPublished: true,
      approvalStatus: 'approved',
    })
      .select('_id updatedAt location')
      .lean();

    profilePages = profiles.map((profile: any) => ({
      url: `${appUrl}/perfiles/${profile._id}`,
      lastModified: profile.updatedAt ?? new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch {
    // Si falla la DB, devolver solo las páginas estáticas
  }

  return [...staticPages, ...profilePages];
}
