import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://mlbb-market.vercel.app';

  // Get all active listings
  const listings = await prisma.listing.findMany({
    where: { status: 'ACTIVE' },
    select: { slug: true, createdAt: true },
  });

  const listingUrls = listings.map((listing) => ({
    url: `${baseUrl}/listings/${listing.slug}`,
    lastModified: listing.createdAt,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/listings`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/listings?type=SKIN_GIFT`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/listings?type=ACCOUNT_SALE`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    ...listingUrls,
  ];
}
