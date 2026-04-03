import type { Metadata } from 'next';
import Link from 'next/link';
import { getListingsByCity } from '@/lib/utils';
import { regions } from '@/data/regions';
import { getCitiesByRegion } from '@/data/cities';
import { BreadcrumbJsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'BC Heat Pump & Boiler Installer Directory',
  description: 'Browse heat pump and boiler replacement installers across British Columbia. Find licensed contractors by city and region.',
  alternates: {
    canonical: 'https://heatpumplocator.com/canada/directory',
  },
};

export default function DirectoryPage() {
  // Pre-compute city counts (server-rendered)
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
    { name: 'Home', url: 'https://heatpumplocator.com' },
    { name: 'Directory', url: 'https://heatpumplocator.com/canada/directory' },
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

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              BC Installer Directory
            </h1>
            <p className="text-xl text-gray-600">
              Find heat pump and boiler replacement installers serving British Columbia. Select your region and city below.
            </p>
          </div>
          <Link
            href="/directory/submit"
            className="whitespace-nowrap bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all transform hover:scale-105"
          >
            Add Your Company →
          </Link>
        </div>

        {/* Regional Hub */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {regionData.map(({ region, citiesWithCounts, totalCount }) => (
            <div
              key={region.slug}
              className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col"
            >
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900">{region.name}</h2>
                <p className="text-sm text-primary-600 font-medium mt-0.5">{totalCount} installers</p>
              </div>
              <ul className="flex-1 space-y-1 mb-5">
                {citiesWithCounts.map(({ city, count }) => (
                  <li key={city.slug}>
                    <Link
                      href={`/bc/${region.slug}/${city.slug}`}
                      className="flex justify-between items-center text-sm text-gray-700 hover:text-primary-600 hover:underline py-0.5"
                    >
                      <span>{city.name}</span>
                      <span className="text-gray-400 text-xs">{count} installers</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href={`/bc/${region.slug}`}
                className="text-sm font-semibold text-primary-600 hover:text-primary-700 border-t border-gray-100 pt-4 mt-auto"
              >
                View all {region.name} →
              </Link>
            </div>
          ))}
        </div>

        {/* CTA for Contractors */}
        <div className="bg-gradient-to-br from-primary-50 to-blue-50 border-2 border-primary-200 rounded-xl p-8 mb-12">
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

        <div className="disclaimer">
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
