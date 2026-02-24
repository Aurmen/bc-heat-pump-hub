import { MetadataRoute } from 'next';
import { cities } from '@/data/cities';
import { regions } from '@/data/regions';
import { getAllListings } from '@/lib/utils';
import { brands } from '@/data/brands';
import { supplyHouses } from '@/data/supply-houses';
import { repairCities } from '@/data/repair-cities';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://canadianheatpumphub.ca';

  const guides = [
    'types-of-heat-pumps-bc',
    'how-heat-pumps-work',
    'heat-pump-installation-process-bc',
    'heat-pump-vs-boiler-bc',
    'air-to-water-heat-pumps-bc',
    'hybrid-heat-pump-boiler-systems',
    'cost-heat-pump-installation-bc',
    'boiler-replacement-cost-bc',
    'heat-pump-sizing-guide-bc',
    'ductless-vs-central-heat-pumps-bc',
    'understanding-heat-pump-ratings',
    'mitsubishi-vs-daikin-bc',
    'fujitsu-vs-mitsubishi-cold-climate',
    'best-cold-climate-heat-pump-bc-2026',
    'how-to-claim-heat-pump-rebate-bc',
    'heat-pump-vs-electric-baseboard-bc',
    'oil-furnace-heat-pump-conversion-bc',
    'heat-pump-condo-strata-bc',
    'heat-pump-home-assessment-checklist-bc',
  ];

  const caseStudies = [
    'kettle-valley-ghost',
  ];

  const staticPages = [
    { url: baseUrl, priority: 1.0 },
    { url: `${baseUrl}/guides`, priority: 0.9 },
    { url: `${baseUrl}/case-studies`, priority: 0.85 },
    { url: `${baseUrl}/bc`, priority: 0.9 },
    { url: `${baseUrl}/directory`, priority: 0.8 },
    { url: `${baseUrl}/brands`, priority: 0.85 },
    { url: `${baseUrl}/supply-houses`, priority: 0.8 },
    { url: `${baseUrl}/rebates`, priority: 0.9 },
    { url: `${baseUrl}/calculator`, priority: 0.8 },
    { url: `${baseUrl}/faq`, priority: 0.7 },
    { url: `${baseUrl}/contact`, priority: 0.7 },
    { url: `${baseUrl}/directory/submit`, priority: 0.7 },
    { url: `${baseUrl}/bc-heat-pump-installers`, priority: 0.95 },
    { url: `${baseUrl}/heat-pump-cost-bc`, priority: 0.95 },
    { url: `${baseUrl}/cold-climate-heat-pump-bc`, priority: 0.90 },
    { url: `${baseUrl}/repair`, priority: 0.90 },
  ];

  const repairPages = repairCities.map(city => ({
    url: `${baseUrl}/repair/${city.slug}`,
    priority: 0.85,
  }));

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

  const brandPages = brands.map(brand => ({
    url: `${baseUrl}/brands/${brand.slug}`,
    priority: 0.75,
  }));

  const supplyHousePages = supplyHouses.map(house => ({
    url: `${baseUrl}/supply-houses/${house.slug}`,
    priority: 0.7,
  }));

  const caseStudyPages = caseStudies.map(slug => ({
    url: `${baseUrl}/case-studies/${slug}`,
    priority: 0.85,
  }));

  const listings = getAllListings();
  const companyPages = listings.map(listing => ({
    url: `${baseUrl}/directory/${listing.slug}`,
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...guidePages,
    ...caseStudyPages,
    ...repairPages,
    ...regionPages,
    ...cityPages,
    ...brandPages,
    ...supplyHousePages,
    ...companyPages,
  ].map(page => ({
    url: page.url,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: page.priority,
  }));
}
