import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  supplyHouses,
  getSupplyHouseBySlug,
  getUniqueCities,
  DISTRIBUTOR_TYPE_LABEL,
  type DistributorType,
} from '@/data/supply-houses';
import { BreadcrumbJsonLd } from '@/components/JsonLd';
import OutboundLink from '@/components/OutboundLink';

export async function generateStaticParams() {
  return supplyHouses.map(s => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const house = getSupplyHouseBySlug(slug);
  if (!house) return { title: 'Not Found' };

  const cities = getUniqueCities(house);

  return {
    title: `${house.name} – HVAC Supply in BC | ${cities.slice(0, 3).join(', ')}`,
    description: `${house.name} operates ${house.locations.length} BC location${house.locations.length !== 1 ? 's' : ''} stocking ${house.brands.slice(0, 4).join(', ')}${house.brands.length > 4 ? ' and more' : ''}. Find branch locations and contact details for wholesale HVAC and heat pump supplies.`,
    alternates: {
      canonical: `https://canadianheatpumphub.ca/supply-houses/${house.slug}`,
    },
  };
}

const REGION_ORDER = ['Lower Mainland', 'Vancouver Island', 'Interior', 'Northern BC'] as const;

const TYPE_BADGE: Record<DistributorType, { label: string; className: string; bgClassName: string }> = {
  wholesale: {
    label: 'Wholesale Counter',
    className: 'bg-green-50 text-green-700 border border-green-200',
    bgClassName: 'bg-green-50 border-green-200',
  },
  direct: {
    label: 'Direct to Contractor',
    className: 'bg-blue-50 text-blue-700 border border-blue-200',
    bgClassName: 'bg-blue-50 border-blue-200',
  },
  commercial_rep: {
    label: 'Commercial Representative',
    className: 'bg-purple-50 text-purple-700 border border-purple-200',
    bgClassName: 'bg-purple-50 border-purple-200',
  },
  limited: {
    label: 'Limited HP Stock',
    className: 'bg-gray-100 text-gray-600 border border-gray-200',
    bgClassName: 'bg-gray-50 border-gray-200',
  },
};

export default async function SupplyHousePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const house = getSupplyHouseBySlug(slug);

  if (!house) notFound();

  const breadcrumbItems = [
    { name: 'Home', url: 'https://canadianheatpumphub.ca' },
    { name: 'Supply Houses', url: 'https://canadianheatpumphub.ca/supply-houses' },
    {
      name: house.shortName ?? house.name,
      url: `https://canadianheatpumphub.ca/supply-houses/${house.slug}`,
    },
  ];

  // Group locations by region
  const byRegion: Record<string, typeof house.locations> = {};
  for (const loc of house.locations) {
    if (!byRegion[loc.region]) byRegion[loc.region] = [];
    byRegion[loc.region].push(loc);
  }

  const cities = getUniqueCities(house);
  const badge = TYPE_BADGE[house.distributorType];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary-600">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/supply-houses" className="hover:text-primary-600">Supply Houses</Link>
          <span className="mx-2">/</span>
          <span>{house.shortName ?? house.name}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <h1 className="text-4xl font-bold text-gray-900">
              {house.name}
              {house.shortName && house.shortName !== house.name && (
                <span className="ml-3 text-2xl font-normal text-gray-500">({house.shortName})</span>
              )}
            </h1>
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${badge.className}`}>
              {badge.label}
            </span>
          </div>
          <p className="text-xl text-gray-600 mb-4">{house.description}</p>
          <OutboundLink
            href={house.website}
            company={house.name}
            city="supply-house"
            eventName="supply_house_website_click"
            className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium"
          >
            Visit {house.shortName ?? house.name} website →
          </OutboundLink>
        </div>

        {/* Distributor type note */}
        {house.typeNote && (
          <div className={`border rounded-lg p-4 mb-8 ${badge.bgClassName}`}>
            <p className="text-sm text-gray-700">{house.typeNote}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="bg-white border border-gray-200 rounded-lg p-5 text-center">
            <div className="text-3xl font-bold text-primary-600">{house.locations.length}</div>
            <div className="text-sm text-gray-500 mt-1">BC locations</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-5 text-center">
            <div className="text-3xl font-bold text-primary-600">{cities.length}</div>
            <div className="text-sm text-gray-500 mt-1">Cities served</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-5 text-center">
            <div className="text-3xl font-bold text-primary-600">{house.brands.length || '—'}</div>
            <div className="text-sm text-gray-500 mt-1">
              {house.brands.length > 0 ? 'Brands distributed' : 'Call to confirm'}
            </div>
          </div>
        </div>

        {/* Brands carried */}
        {house.brands.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Brands Distributed</h2>
            <div className="flex flex-wrap gap-2">
              {house.brands.map(brand => (
                <Link
                  key={brand}
                  href={`/brands/${brand.toLowerCase().replace(/\s+/g, '-')}`}
                  className="inline-block bg-primary-50 hover:bg-primary-100 text-primary-700 px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                >
                  {brand}
                </Link>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Click a brand to see certified installers and dealer info in BC.
            </p>
          </div>
        )}

        {/* Locations by region */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">BC Locations</h2>

          {REGION_ORDER.filter(r => byRegion[r]?.length > 0).map(region => (
            <div key={region} className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">
                {region}
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({byRegion[region].length} {byRegion[region].length === 1 ? 'location' : 'locations'})
                </span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {byRegion[region].map((loc, i) => (
                  <div
                    key={i}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="font-semibold text-gray-900 mb-1">
                      {loc.label ?? loc.city}
                    </div>
                    {loc.label && loc.label !== loc.city && (
                      <div className="text-xs text-gray-500 mb-1">{loc.city}</div>
                    )}
                    {loc.address && (
                      <div className="text-sm text-gray-600 mb-2">{loc.address}</div>
                    )}
                    {loc.phone && (
                      <a
                        href={`tel:${loc.phone.replace(/\D/g, '')}`}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        {loc.phone}
                      </a>
                    )}
                    {!loc.address && !loc.phone && (
                      <p className="text-xs text-gray-400">See website for hours and contact.</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Cities covered */}
        {cities.length > 1 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Cities Covered</h2>
            <div className="flex flex-wrap gap-2">
              {cities.map(city => (
                <span
                  key={city}
                  className="inline-block bg-white border border-gray-200 text-gray-700 text-sm px-3 py-1 rounded-full"
                >
                  {city}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Note for homeowners */}
        <div className="bg-blue-50 border-l-4 border-primary-500 p-5 mb-8">
          <p className="text-sm text-gray-700">
            <strong>Note for homeowners:</strong> Supply houses and manufacturer reps sell to
            licensed contractors only. To purchase and install heat pump equipment, you need a
            qualified HVAC contractor.{' '}
            <Link href="/directory" className="text-primary-600 hover:text-primary-700 font-medium">
              Find a BC installer in our directory →
            </Link>
          </p>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 flex flex-wrap gap-4">
          <Link href="/supply-houses" className="text-primary-600 hover:text-primary-700 font-medium">
            ← All supply houses
          </Link>
          <Link href="/brands" className="text-primary-600 hover:text-primary-700 font-medium">
            Browse heat pump brands →
          </Link>
        </div>
      </div>
    </>
  );
}
