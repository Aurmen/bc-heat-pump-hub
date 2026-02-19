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
    alternates: {
      canonical: `https://canadianheatpumphub.ca/bc/${city.regionSlug}/${city.slug}`,
    },
    openGraph: {
      title: `${city.name} Heat Pump Installers`,
      description: `Find heat pump and boiler replacement installers in ${city.name}, ${city.region}, BC.`,
      url: `https://canadianheatpumphub.ca/bc/${city.regionSlug}/${city.slug}`,
    },
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

        {/* Climate Data */}
        {city.designTemp && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Climate Data for {city.name}
            </h2>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Metric
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      What It Means
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Design Temperature
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {city.designTemp}°C ({Math.round(city.designTemp * 9/5 + 32)}°F)
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      Coldest expected temperature for system sizing
                    </td>
                  </tr>
                  {city.avgWinterLow && (
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Average Winter Low
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {city.avgWinterLow}°C ({Math.round(city.avgWinterLow * 9/5 + 32)}°F)
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        Typical overnight winter temperature
                      </td>
                    </tr>
                  )}
                  {city.heatingDegreeDays && (
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Heating Degree Days
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {city.heatingDegreeDays.toLocaleString()} HDD
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        Annual heating requirement metric (higher = more heating needed)
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Installation Costs */}
        {city.installCosts && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Installation Costs in {city.name}
            </h2>
            <p className="text-gray-600 mb-4">
              Typical installation costs for a 2,000 sq ft home. Actual costs vary by home size, insulation, and complexity.
            </p>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      System Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cost Range
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      After Rebates
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Ductless Mini-Split
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {city.installCosts.ductless}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-success-600 font-medium">
                      As low as $3,000-9,000
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Ducted Heat Pump
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {city.installCosts.ducted}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-success-600 font-medium">
                      As low as $5,000-12,000
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Air-to-Water
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {city.installCosts.airToWater}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-success-600 font-medium">
                      As low as $8,000-19,000
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Rebates: Provincial and federal programs offer up to $11,000 in combined rebates. See our{' '}
              <Link href="/rebates" className="text-primary-600 hover:text-primary-700 font-medium">
                2026 Rebates Guide
              </Link>{' '}
              for details.
            </p>
          </div>
        )}

        {/* Operating Costs */}
        {city.operatingCosts && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Annual Operating Costs in {city.name}
            </h2>
            <p className="text-gray-600 mb-4">
              Estimated annual heating costs for a 2,000 sq ft home based on {city.name}'s climate.
            </p>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Heating System
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Annual Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      vs. Electric Baseboard
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr className="bg-success-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Heat Pump
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">
                      {city.operatingCosts.heatPump}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-success-600 font-bold">
                      Save 60-70%
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Gas Boiler
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {city.operatingCosts.gasBoiler}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-success-600">
                      Save 55-65%
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Electric Baseboard
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {city.operatingCosts.electricBaseboard}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Baseline (most expensive)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Costs based on BC Hydro rates ($0.12/kWh) and FortisBC natural gas rates (~$1.50/GJ).
              Actual costs vary by usage patterns and home characteristics.
            </p>
          </div>
        )}

        {/* Recommended Systems */}
        {city.recommendedSystems && city.recommendedSystems.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Recommended Systems for {city.name}
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {city.recommendedSystems.map((system, index) => (
                <div
                  key={index}
                  className="bg-white border-l-4 border-primary-500 p-5 rounded-r-lg shadow-sm"
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-gray-800">{system}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
