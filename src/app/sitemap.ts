import { MetadataRoute } from 'next';
import { cities } from '@/data/cities';
import { regions } from '@/data/regions';
import { getAllListings } from '@/lib/utils';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://canadianheatpumphub.ca';

  const guides = [
    'heat-pump-vs-boiler-bc',
    'air-to-water-heat-pumps-bc',
    'hybrid-heat-pump-boiler-systems',
    'cost-heat-pump-installation-bc',
    'boiler-replacement-cost-bc',
  ];

  const staticPages = [
    { url: baseUrl, priority: 1.0 },
    { url: `${baseUrl}/guides`, priority: 0.9 },
    { url: `${baseUrl}/bc`, priority: 0.9 },
    { url: `${baseUrl}/directory`, priority: 0.8 },
  ];

  const guidePages = guides.map(slug => ({
    url: `${baseUrl}/guides/${slug}`,
    priority: 0.8,
  }));

  const regionPages = regions.map(region => ({
    url: `${baseUrl}/bc/${region.slug}`,
    priority: 0.7,
  }));

  const cityPages = cities.map(city => ({
    url: `${baseUrl}/bc/${city.regionSlug}/${city.slug}`,
    priority: 0.7,
  }));

  const listings = getAllListings();
  const companyPages = listings.map(listing => ({
    url: `${baseUrl}/directory/${listing.slug}`,
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...guidePages,
    ...regionPages,
    ...cityPages,
    ...companyPages,
  ].map(page => ({
    url: page.url,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: page.priority,
  }));
}
