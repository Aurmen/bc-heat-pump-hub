import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { regions } from '@/data/regions';
import { getCitiesByRegion } from '@/data/cities';
import { getListingsByCity } from '@/lib/utils';
import { BreadcrumbJsonLd } from '@/components/JsonLd';

export async function generateStaticParams() {
  return regions.map(region => ({ region: region.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ region: string }> }): Promise<Metadata> {
  const { region: regionSlug } = await params;
  const region = regions.find(r => r.slug === regionSlug);

  if (!region) return { title: 'Region Not Found' };

  return {
    title: `${region.name} Heat Pump Installers`,
    description: `Heat pump and boiler replacement installers in ${region.name}, BC. ${region.description}`,
    alternates: { canonical: `https://canadianheatpumphub.ca/bc/${regionSlug}` },
  };
}

export default async function RegionPage({ params }: { params: Promise<{ region: string }> }) {
  const { region: regionSlug } = await params;
  const region = regions.find(r => r.slug === regionSlug);

  if (!region) {
    notFound();
  }

  const regionCities = getCitiesByRegion(region.slug);

  const breadcrumbItems = [
    { name: 'Home', url: 'https://canadianheatpumphub.ca' },
    { name: 'BC', url: 'https://canadianheatpumphub.ca/bc' },
    { name: region.name, url: `https://canadianheatpumphub.ca/bc/${region.slug}` },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary-600">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/bc" className="hover:text-primary-600">BC</Link>
          <span className="mx-2">/</span>
          <span>{region.name}</span>
        </nav>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {region.name} Heat Pump & Boiler Installers
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          {region.description}
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Cities in {region.name}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
          {regionCities.map(city => {
            const count = getListingsByCity(city.name).length;
            return (
              <Link
                key={city.slug}
                href={`/bc/${region.slug}/${city.slug}`}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-gray-900 text-lg">{city.name}</h3>
                {city.population && (
                  <p className="text-sm text-gray-500 mt-1">Pop. {city.population}</p>
                )}
                <p className="text-sm text-primary-600 font-medium mt-1">
                  {count} installer{count !== 1 ? 's' : ''}
                </p>
                <span className="inline-block mt-2 text-primary-600 text-sm font-medium">
                  View Details →
                </span>
              </Link>
            );
          })}
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Guides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/guides/heat-pump-vs-boiler-bc"
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Heat Pumps vs. Boilers in BC
            </h3>
            <p className="text-gray-600 text-sm">
              Compare efficiency and costs for {region.name}'s climate.
            </p>
          </Link>

          <Link
            href="/guides/cost-heat-pump-installation-bc"
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Heat Pump Installation Costs
            </h3>
            <p className="text-gray-600 text-sm">
              Typical cost ranges and available rebates in BC.
            </p>
          </Link>
        </div>

        <div className="disclaimer mt-12">
          <p className="font-semibold mb-2">Disclaimer</p>
          <p>
            This information is for educational purposes only. Always verify contractor licensing
            and consult qualified HVAC professionals for system recommendations specific to your home.
          </p>
        </div>
      </div>
    </>
  );
}
