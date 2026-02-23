import Link from 'next/link';
import type { Metadata } from 'next';
import { supplyHouses, getUniqueCities, DISTRIBUTOR_TYPE_LABEL, type DistributorType } from '@/data/supply-houses';
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

const TYPE_BADGE: Record<DistributorType, { label: string; className: string }> = {
  wholesale: { label: 'Wholesale Counter', className: 'bg-green-50 text-green-700' },
  direct: { label: 'Direct to Contractor', className: 'bg-blue-50 text-blue-700' },
  commercial_rep: { label: 'Commercial Rep', className: 'bg-purple-50 text-purple-700' },
  limited: { label: 'Limited HP Stock', className: 'bg-gray-100 text-gray-600' },
};

export default function SupplyHousesPage() {
  const wholesaleHouses = supplyHouses.filter(s => s.distributorType === 'wholesale');
  const directHouses = supplyHouses.filter(s => s.distributorType === 'direct');
  const commRepHouses = supplyHouses.filter(s => s.distributorType === 'commercial_rep');
  const limitedHouses = supplyHouses.filter(s => s.distributorType === 'limited');

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
            Wholesale distributors, manufacturer reps, and direct channels that stock heat pumps,
            mini-splits, parts, and accessories across British Columbia.
          </p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-white border border-gray-200 rounded-lg p-5 text-center">
            <div className="text-3xl font-bold text-primary-600">{supplyHouses.length}</div>
            <div className="text-sm text-gray-500 mt-1">Distributors listed</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-5 text-center">
            <div className="text-3xl font-bold text-primary-600">
              {supplyHouses.reduce((sum, s) => sum + s.locations.length, 0)}
            </div>
            <div className="text-sm text-gray-500 mt-1">BC locations</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-5 text-center">
            <div className="text-3xl font-bold text-primary-600">
              {[...new Set(supplyHouses.flatMap(s => s.brands))].length}
            </div>
            <div className="text-sm text-gray-500 mt-1">Brands distributed</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-5 text-center">
            <div className="text-3xl font-bold text-primary-600">3</div>
            <div className="text-sm text-gray-500 mt-1">BC regions served</div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mb-10">
          {(Object.entries(TYPE_BADGE) as [DistributorType, typeof TYPE_BADGE[DistributorType]][]).map(([type, badge]) => (
            <span key={type} className={`inline-block text-xs font-medium px-3 py-1 rounded-full ${badge.className}`}>
              {badge.label}
            </span>
          ))}
        </div>

        {/* Wholesale counters */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Wholesale Counters</h2>
          <p className="text-gray-600 mb-6 text-sm">Walk-in supply counters that sell to licensed contractors.</p>
          <SupplyHouseCardGrid houses={wholesaleHouses} />
        </section>

        {/* Direct to contractor */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Manufacturer Direct Channels</h2>
          <p className="text-gray-600 mb-6 text-sm">Factory-owned distribution — no third-party middleman between manufacturer and installing contractor.</p>
          <SupplyHouseCardGrid houses={directHouses} />
        </section>

        {/* Commercial reps */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Commercial &amp; Applied Representatives</h2>
          <p className="text-gray-600 mb-6 text-sm">Equipment reps for commercial and applied projects. Contact them directly for project-specific pricing — not walk-in counters.</p>
          <SupplyHouseCardGrid houses={commRepHouses} />
        </section>

        {/* Limited stock */}
        {limitedHouses.length > 0 && (
          <section className="mb-14">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Other Supply Sources</h2>
            <p className="text-gray-600 mb-6 text-sm">Primarily serve other trades but may carry limited heat pump equipment — confirm by branch before sourcing.</p>
            <SupplyHouseCardGrid houses={limitedHouses} />
          </section>
        )}

        {/* For installers callout */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Are you an HVAC installer?</h2>
          <p className="text-gray-700 text-sm mb-3">
            Supply houses are wholesale-only. If you are a homeowner looking for someone to
            install a heat pump, use our installer directory.
          </p>
          <Link href="/directory" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
            Find a BC heat pump installer →
          </Link>
        </div>
      </div>
    </>
  );
}

function SupplyHouseCardGrid({ houses }: { houses: typeof supplyHouses }) {
  return (
    <div className="space-y-6">
      {houses.map(house => {
        const cities = getUniqueCities(house);
        const regionCounts = (['Lower Mainland', 'Vancouver Island', 'Interior', 'Northern BC'] as const).reduce<Record<string, number>>((acc, r) => {
          const count = house.locations.filter(l => l.region === r).length;
          if (count > 0) acc[r] = count;
          return acc;
        }, {});
        const badge = TYPE_BADGE[house.distributorType];

        return (
          <div key={house.slug} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-gray-900">
                    <Link href={`/supply-houses/${house.slug}`} className="hover:text-primary-600">
                      {house.name}
                      {house.shortName && house.shortName !== house.name && (
                        <span className="ml-2 text-base font-normal text-gray-500">({house.shortName})</span>
                      )}
                    </Link>
                  </h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge.className}`}>
                    {badge.label}
                  </span>
                </div>
                <p className="text-gray-600 text-sm max-w-2xl">{house.description}</p>
              </div>
              <Link
                href={`/supply-houses/${house.slug}`}
                className="shrink-0 text-primary-600 hover:text-primary-700 font-medium text-sm whitespace-nowrap"
              >
                Details →
              </Link>
            </div>

            {Object.keys(regionCounts).length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {Object.entries(regionCounts).map(([region, count]) => (
                  <span key={region} className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full font-medium">
                    {region}: {count} {count === 1 ? 'branch' : 'branches'}
                  </span>
                ))}
              </div>
            )}

            {house.brands.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-gray-600">Brands:</span>
                {house.brands.map(brand => (
                  <Link
                    key={brand}
                    href={`/brands/${brand.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-xs bg-gray-100 hover:bg-primary-50 hover:text-primary-700 text-gray-700 px-2 py-1 rounded transition-colors"
                  >
                    {brand}
                  </Link>
                ))}
              </div>
            )}

            {house.brands.length === 0 && (
              <p className="text-xs text-gray-400 italic">Brand stock varies — call to confirm availability.</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
