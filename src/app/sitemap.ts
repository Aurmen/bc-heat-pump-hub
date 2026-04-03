import { MetadataRoute } from 'next';
import { cities } from '@/data/cities';
import { regions } from '@/data/regions';
import { getAllListings } from '@/lib/utils';
import { brands } from '@/data/brands';
import { supplyHouses } from '@/data/supply-houses';
import { repairCities } from '@/data/repair-cities';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://heatpumplocator.com';
  const canadaBase = `${baseUrl}/canada`;

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
    '100-amp-panel-heat-pump-bc',
    '100-amp-panel-heat-pump-vancouver',
    'vancouver-strata-heat-pump-guide',
    'dual-fuel-vs-all-electric-interior-bc',
    'heat-pump-onboarding-checklist',
    'bc-heat-pump-rebate-calculator',
    'heat-pump-roi-calculator',
    'bc-step-code-summary',
    'bc-step-code-city-tracker',
    'heat-pump-bc-2026',
  ];

  const caseStudies = [
    'kettle-valley-ghost',
  ];

  // Pages that are NOT redirected — served directly at root
  const staticPages = [
    { url: baseUrl, priority: 1.0 },
    { url: `${baseUrl}/auditor`, priority: 0.90 },
    { url: `${baseUrl}/privacy`, priority: 0.3 },
    { url: `${baseUrl}/directory/submit`, priority: 0.7 },
  ];

  // Pages that live under /canada/ on the live site
  const canadaStaticPages = [
    { url: `${canadaBase}/guides`, priority: 0.9 },
    { url: `${canadaBase}/case-studies`, priority: 0.85 },
    { url: `${canadaBase}/bc`, priority: 0.9 },
    { url: `${canadaBase}/directory`, priority: 0.8 },
    { url: `${canadaBase}/brands`, priority: 0.85 },
    { url: `${canadaBase}/supply-houses`, priority: 0.8 },
    { url: `${canadaBase}/rebates`, priority: 0.9 },
    { url: `${canadaBase}/calculator`, priority: 0.8 },
    { url: `${canadaBase}/faq`, priority: 0.7 },
    { url: `${canadaBase}/repair`, priority: 0.90 },
    { url: `${canadaBase}/service`, priority: 0.85 },
  ];

  const repairPages = repairCities.map(city => ({
    url: `${canadaBase}/repair/${city.slug}`,
    priority: 0.85,
  }));

  const guidePages = guides.map(slug => ({
    url: `${canadaBase}/guides/${slug}`,
    priority: 0.8,
  }));

  const regionPages = regions.map(region => ({
    url: `${canadaBase}/bc/${region.slug}`,
    priority: 0.7,
  }));

  const cityPages = cities.map(city => ({
    url: `${canadaBase}/bc/${city.regionSlug}/${city.slug}`,
    priority: 0.7,
  }));

  const brandPages = brands.map(brand => ({
    url: `${canadaBase}/brands/${brand.slug}`,
    priority: 0.75,
  }));

  const supplyHousePages = supplyHouses.map(house => ({
    url: `${canadaBase}/supply-houses/${house.slug}`,
    priority: 0.7,
  }));

  const caseStudyPages = caseStudies.map(slug => ({
    url: `${canadaBase}/case-studies/${slug}`,
    priority: 0.85,
  }));

  const listings = getAllListings();
  const companyPages = listings.map(listing => ({
    url: `${canadaBase}/directory/${listing.slug}`,
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...canadaStaticPages,
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
