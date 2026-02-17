import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getCityBySlug } from '@/data/cities';
import { getListingsByCity } from '@/lib/utils';
import CompanyCard from '@/components/CompanyCard';
import { BreadcrumbJsonLd } from '@/components/JsonLd';

export async function generateStaticParams() {
  const { cities } = await import('@/data/cities');
  return cities.map(city => ({
    region: city.regionSlug,
    city: city.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ region: string; city: string }> }): Promise<Metadata> {
  const { city: citySlug } = await params;
  const city = getCityBySlug(citySlug);

  if (!city) return { title: 'City Not Found' };

  return {
    title: `${city.name} Heat Pump Installers`,
    description: `Find heat pump and boiler replacement installers in ${city.name}, ${city.region}, BC. ${city.climateNotes}`,
  };
}

export default async function CityPage({ params }: { params: Promise<{ region: string; city: string }> }) {
  const { city: citySlug } = await params;
  const city = getCityBySlug(citySlug);

  if (!city) {
    notFound();
  }

  const listings = getListingsByCity(city.name);

  const breadcrumbItems = [
    { name: 'Home', url: 'https://canadianheatpumphub.ca' },
    { name: 'BC', url: 'https://canadianheatpumphub.ca/bc' },
    { name: city.region, url: `https://canadianheatpumphub.ca/bc/${city.regionSlug}` },
    { name: city.name, url: `https://canadianheatpumphub.ca/bc/${city.regionSlug}/${city.slug}` },
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
          <Link href={`/bc/${city.regionSlug}`} className="hover:text-primary-600">
            {city.region}
          </Link>
          <span className="mx-2">/</span>
          <span>{city.name}</span>
        </nav>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {city.name} Heat Pump & Boiler Installers
        </h1>

        <div className="bg-blue-50 border-l-4 border-primary-500 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Climate Notes for {city.name}</h2>
          <p className="text-gray-700">{city.climateNotes}</p>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Installers in {city.name}
        </h2>

        {listings.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center mb-12">
            <p className="text-gray-600 mb-4">
              No installers currently listed for {city.name}.
            </p>
            <Link
              href="/directory"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Browse All Installers →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {listings.map(listing => (
              <CompanyCard key={listing.slug} listing={listing} />
            ))}
          </div>
        )}

        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Recommended Reading for {city.name} Homeowners
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/guides/heat-pump-vs-boiler-bc"
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Heat Pumps vs. Boilers
            </h3>
            <p className="text-gray-600 text-sm">
              Which system is right for {city.name}'s climate?
            </p>
          </Link>

          <Link
            href="/guides/air-to-water-heat-pumps-bc"
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Air-to-Water Heat Pumps
            </h3>
            <p className="text-gray-600 text-sm">
              Hydronic heating solutions for BC homes.
            </p>
          </Link>

          <Link
            href="/guides/cost-heat-pump-installation-bc"
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Installation Costs
            </h3>
            <p className="text-gray-600 text-sm">
              What to expect when budgeting for a new system.
            </p>
          </Link>
        </div>

        <div className="disclaimer mt-12">
          <p className="font-semibold mb-2">Disclaimer</p>
          <p>
            Installer listings are for informational purposes only and do not constitute endorsements.
            Always verify licensing, insurance, and suitability for your specific heating needs.
            Consult qualified HVAC professionals for system design and installation.
          </p>
        </div>
      </div>
    </>
  );
}
