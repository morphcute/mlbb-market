import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/account/', '/seller/'],
    },
    sitemap: 'https://mlbb-market.vercel.app/sitemap.xml',
  };
}
