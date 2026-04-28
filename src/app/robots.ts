import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://placerlux.lat';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/perfiles', '/perfiles/'],
        disallow: [
          '/dashboard',
          '/admin',
          '/api/',
          '/auth/',
          '/payments/',
        ],
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
