import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllListings, getListingsByCity } from '@/lib/utils';
import { regions } from '@/data/regions';
import { getCitiesByRegion } from '@/data/cities';
import DirectoryFilters from '@/components/DirectoryFilters';
import { BreadcrumbJsonLd } from '@/components/JsonLd';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ audience?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const audience = params.audience;

  if (audience === 'residential') {
    return {
      title: 'Residential Heat Pump Installers in BC',
      description: 'Find qualified heat pump and boiler installers for your home in British Columbia. Browse contractors serving homeowners with emergency service, verified licenses, and local expertise.',
    };
  }

  if (audience === 'commercial') {
    return {
      title: 'Commercial Heat Pump Contractors in BC',
      description: 'Find qualified commercial HVAC contractors in British Columbia. Browse licensed professionals with commercial capacity, TSBC verification, and expertise in large-scale heat pump and boiler systems.',
    };
  }

  // Default metadata
  return {
    title: 'BC Heat Pump & Boiler Installer Directory',
    description: 'Browse heat pump and boiler replacement installers across British Columbia. Filter by city and service type.',
  };
}

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ audience?: string }>;
}) {
  const params = await searchParams;
  const listings = getAllListings();
  const selectedAudience = params.audience;

  // Pre-compute city counts for the regional hub (server-rendered)
  const regionData = regions.map(region => {
    const regionCities = getCitiesByRegion(region.slug);
    const citiesWithCounts = regionCities
      .map(city => ({ city, count: getListingsByCity(city.name).length }))
      .filter(c => c.count > 0)
      .sort((a, b) => b.count - a.count);
    const totalCount = citiesWithCounts.reduce((sum, c) => sum + c.count, 0);
    return { region, citiesWithCounts, totalCount };
  });

  const breadcrumbItems = [
    { name: 'Home', url: 'https://canadianheatpumphub.ca' },
    { name: 'Directory', url: 'https://canadianheatpumphub.ca/directory' },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary-600">Home</Link>
          <span className="mx-2">/</span>
          <span>Directory</span>
        </nav>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              BC Installer Directory
            </h1>
            <p className="text-xl text-gray-600">
              Find heat pump and boiler replacement installers serving British Columbia.
            </p>
          </div>
          <Link
            href="/directory/submit"
            className="whitespace-nowrap bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all transform hover:scale-105"
          >
            Add Your Company →
          </Link>
        </div>

        {/* Regional Hub Navigation */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Browse by Region</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {regionData.map(({ region, citiesWithCounts, totalCount }) => (
              <div
                key={region.slug}
                className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col"
              >
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-gray-900">{region.name}</h3>
                  <p className="text-sm text-primary-600 font-medium">{totalCount} installers</p>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 mb-4 flex-1">
                  {citiesWithCounts.map(({ city, count }) => (
                    <Link
                      key={city.slug}
                      href={`/bc/${region.slug}/${city.slug}`}
                      className="text-sm text-gray-700 hover:text-primary-600 hover:underline"
                    >
                      {city.name}
                      <span className="text-gray-400 ml-0.5">({count})</span>
                    </Link>
                  ))}
                </div>
                <Link
                  href={`/bc/${region.slug}`}
                  className="text-sm font-semibold text-primary-600 hover:text-primary-700 mt-auto"
                >
                  View all {region.name} installers →
                </Link>
              </div>
            ))}
          </div>
        </div>

        <DirectoryFilters listings={listings} initialAudience={selectedAudience} />

        {/* CTA for Contractors */}
        <div className="mt-12 bg-gradient-to-br from-primary-50 to-blue-50 border-2 border-primary-200 rounded-xl p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Are you a heat pump installer?
              </h2>
              <p className="text-gray-700">
                Get found by homeowners searching for qualified contractors. Free basic listing.
              </p>
            </div>
            <Link
              href="/directory/submit"
              className="whitespace-nowrap bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg font-bold text-lg shadow-lg transition-all transform hover:scale-105"
            >
              Submit Your Company
            </Link>
          </div>
        </div>

        <div className="disclaimer mt-12">
          <p className="font-semibold mb-2">Disclaimer</p>
          <p>
            This directory is provided for informational purposes only. Listings do not constitute
            endorsements or recommendations. Always verify contractor licensing, insurance, and suitability
            for your specific project. Request multiple quotes and check references before hiring.
          </p>
        </div>
      </div>
    </>
  );
}
