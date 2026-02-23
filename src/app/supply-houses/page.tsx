import Link from 'next/link';
import type { Metadata } from 'next';
import { supplyHouses, getUniqueCities } from '@/data/supply-houses';
import { BreadcrumbJsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'HVAC Supply Houses in BC | Wholesale Heat Pump Distributors',
  description:
    'Find wholesale HVAC and heat pump supply houses in British Columbia. Compare distributors by brand, location, and region — Lower Mainland, Vancouver Island, and BC Interior.',
  alternates: {
    canonical: 'https://canadianheatpumphub.ca/supply-houses',
  },
};

const breadcrumbItems = [
  { name: 'Home', url: 'https://canadianheatpumphub.ca' },
  { name: 'Supply Houses', url: 'https://canadianheatpumphub.ca/supply-houses' },
];

const REGION_ORDER = ['Lower Mainland', 'Vancouver Island', 'Interior', 'Northern BC'] as const;

export default function SupplyHousesPage() {
  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary-600">Home</Link>
          <span className="mx-2">/</span>
          <span>Supply Houses</span>
        </nav>

        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            HVAC &amp; Heat Pump Supply Houses in BC
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl">
            Wholesale distributors that stock heat pumps, mini-splits, parts, and refrigerants
            across British Columbia. Use these resources to find authorized product sources
            and confirm part availability with your installer.
          </p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
          <div className="bg-white border border-gray-200 rounded-lg p-5 text-center">
            <div className="text-3xl font-bold text-primary-600">{supplyHouses.length}</div>
            <div className="text-sm text-gray-500 mt-1">Distributors listed</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-5 text-center">
            <div className="text-3xl font-bold text-primary-600">
              {supplyHouses.reduce((sum, s) => sum + s.locations.length, 0)}
            </div>
            <div className="text-sm text-gray-500 mt-1">BC branch locations</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-5 text-center">
            <div className="text-3xl font-bold text-primary-600">
              {[...new Set(supplyHouses.flatMap(s => s.brands))].length}
            </div>
            <div className="text-sm text-gray-500 mt-1">Brands distributed</div>
          </div>
        </div>

        {/* Supply house cards */}
        <div className="space-y-8 mb-16">
          {supplyHouses.map(house => {
            const cities = getUniqueCities(house);
            const regionCounts = REGION_ORDER.reduce<Record<string, number>>((acc, r) => {
              const count = house.locations.filter(l => l.region === r).length;
              if (count > 0) acc[r] = count;
              return acc;
            }, {});

            return (
              <div
                key={house.slug}
                className="bg-white border border-gray-200 rounded-lg p-8 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      <Link
                        href={`/supply-houses/${house.slug}`}
                        className="hover:text-primary-600"
                      >
                        {house.name}
                        {house.shortName && house.shortName !== house.name && (
                          <span className="ml-2 text-lg font-normal text-gray-500">
                            ({house.shortName})
                          </span>
                        )}
                      </Link>
                    </h2>
                    <p className="text-gray-600 mt-2 max-w-2xl">{house.description}</p>
                  </div>
                  <Link
                    href={`/supply-houses/${house.slug}`}
                    className="shrink-0 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-lg font-medium text-sm transition-colors"
                  >
                    View All Locations →
                  </Link>
                </div>

                {/* Region coverage */}
                <div className="flex flex-wrap gap-3 mb-4">
                  {Object.entries(regionCounts).map(([region, count]) => (
                    <span
                      key={region}
                      className="inline-block bg-primary-50 text-primary-700 text-sm px-3 py-1 rounded-full font-medium"
                    >
                      {region}: {count} {count === 1 ? 'branch' : 'branches'}
                    </span>
                  ))}
                </div>

                {/* Brands */}
                {house.brands.length > 0 && (
                  <div className="mb-4">
                    <span className="text-sm font-semibold text-gray-700 mr-2">Brands:</span>
                    <div className="inline-flex flex-wrap gap-2 mt-1">
                      {house.brands.map(brand => (
                        <Link
                          key={brand}
                          href={`/brands/${brand.toLowerCase().replace(/\s+/g, '-')}`}
                          className="inline-block bg-gray-100 hover:bg-primary-50 hover:text-primary-700 text-gray-700 text-xs px-2 py-1 rounded transition-colors"
                        >
                          {brand}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cities preview */}
                <div className="text-sm text-gray-500">
                  <span className="font-medium text-gray-700">{house.locations.length} locations</span> in{' '}
                  {cities.slice(0, 6).join(', ')}
                  {cities.length > 6 && ` +${cities.length - 6} more`}
                </div>
              </div>
            );
          })}
        </div>

        {/* For installers callout */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-10">
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            Are you an HVAC installer?
          </h2>
          <p className="text-gray-700 text-sm mb-3">
            Supply houses are wholesale-only — they sell to licensed contractors, not directly
            to homeowners. If you are looking for someone to install a heat pump for you,
            use our installer directory.
          </p>
          <Link href="/directory" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
            Find a BC heat pump installer →
          </Link>
        </div>

        {/* Browse by brand callout */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            Looking for a specific brand?
          </h2>
          <p className="text-gray-700 text-sm mb-3">
            Browse our brand pages to see which distributors carry your preferred equipment
            and find authorized dealers in your area.
          </p>
          <Link href="/brands" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
            Browse all heat pump brands →
          </Link>
        </div>
      </div>
    </>
  );
}
