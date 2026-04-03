import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getCityBySlug, getCitiesByRegion } from '@/data/cities';
import { getListingsByCity } from '@/lib/utils';
import CompanyCard from '@/components/CompanyCard';
import { BreadcrumbJsonLd } from '@/components/JsonLd';

/** Parse "$X,XXX-$Y,YYY" → midpoint as integer, or null */
function parseMidpoint(range: string): number | null {
  const nums = range.replace(/\$|,/g, '').split('-').map(Number);
  if (nums.length !== 2 || nums.some(isNaN)) return null;
  return Math.round((nums[0] + nums[1]) / 2);
}

/** Estimated annual savings vs. electric baseboard, formatted as "$X,XXX–$Y,YYY/yr" */
function estimatedSavings(heatPump: string, baseboard: string): string | null {
  const hp = parseMidpoint(heatPump);
  const bb = parseMidpoint(baseboard);
  if (!hp || !bb) return null;
  const saving = bb - hp;
  // Express as a range ±15% around the midpoint
  const lo = Math.round(saving * 0.85 / 100) * 100;
  const hi = Math.round(saving * 1.15 / 100) * 100;
  return `$${lo.toLocaleString()}–$${hi.toLocaleString()}/yr`;
}

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
      canonical: `https://heatpumplocator.com/canada/bc/${city.regionSlug}/${city.slug}`,
    },
    openGraph: {
      title: `${city.name} Heat Pump Installers`,
      description: `Find heat pump and boiler replacement installers in ${city.name}, ${city.region}, BC.`,
      url: `https://heatpumplocator.com/canada/bc/${city.regionSlug}/${city.slug}`,
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
  const siblingCities = getCitiesByRegion(city.regionSlug)
    .filter(c => c.slug !== city.slug)
    .slice(0, 8);

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `How much does heat pump installation cost in ${city.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Heat pump installation in ${city.name} typically costs between $3,500 and $8,000 CAD depending on system size, home size, and whether ductwork modifications are needed. Cold climate models suitable for BC winters are at the higher end of this range.`,
        },
      },
      {
        '@type': 'Question',
        name: `Are there rebates available for heat pumps in ${city.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes. BC residents can access rebates through BC Hydro and FortisBC depending on their utility provider, plus federal programs through Natural Resources Canada. Combined rebates can reach $4,000 or more for qualifying systems.`,
        },
      },
      {
        '@type': 'Question',
        name: `What size heat pump do I need for my ${city.name} home?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Sizing depends on your home's square footage, insulation level, and local climate. Most contractors in ${city.name} perform a Manual J load calculation before recommending a system. A typical 2,000 sq ft home in BC requires a 2–3 ton unit.`,
        },
      },
      {
        '@type': 'Question',
        name: `How do I find a licensed heat pump installer in ${city.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Look for contractors licensed with the BC Safety Authority (BCSA) and holding a valid Gas/HVAC contractor licence. HeatPumpLocator.com lists verified contractors serving ${city.name} and surrounding areas.`,
        },
      },
    ],
  };

  const breadcrumbItems = [
    { name: 'Home', url: 'https://heatpumplocator.com' },
    { name: 'BC', url: 'https://heatpumplocator.com/bc' },
    { name: city.region, url: `https://heatpumplocator.com/canada/bc/${city.regionSlug}` },
    { name: city.name, url: `https://heatpumplocator.com/canada/bc/${city.regionSlug}/${city.slug}` },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary-600">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/canada/bc" className="hover:text-primary-600">BC</Link>
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

        <div className="bg-blue-50 border-l-4 border-primary-500 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Climate Notes for {city.name}</h2>
          <p className="text-gray-700">{city.climateNotes}</p>
        </div>

        {/* City Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {city.designTemp !== undefined && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-primary-600">{city.designTemp}°C</p>
              <p className="text-xs text-gray-500 mt-1">Design Temperature</p>
            </div>
          )}
          {city.heatingDegreeDays && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-primary-600">{city.heatingDegreeDays.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Heating Degree Days</p>
            </div>
          )}
          {city.operatingCosts && (() => {
            const savings = estimatedSavings(city.operatingCosts.heatPump, city.operatingCosts.electricBaseboard);
            return savings ? (
              <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <p className="text-xl font-bold text-green-600">{savings}</p>
                <p className="text-xs text-gray-500 mt-1">Est. Savings vs. Baseboard</p>
              </div>
            ) : null;
          })()}
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-primary-600">{listings.length}</p>
            <p className="text-xs text-gray-500 mt-1">Verified Contractors</p>
          </div>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                      Varies by eligibility
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Ducted Heat Pump
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {city.installCosts.ducted}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                      Varies by eligibility
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Air-to-Water
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {city.installCosts.airToWater}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                      Varies by eligibility
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Rebates: Income-qualified households may receive up to $16,000 via CleanBC. Oil/propane homes may qualify for $10,000 via OHPA. Most standard-income programs have ended. See our{' '}
              <Link href="/canada/rebates" className="text-primary-600 hover:text-primary-700 font-medium">
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
                      Est. 40-65% savings
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
                      Est. 35-60% savings
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
              href="/canada/directory"
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
            href="/canada/guides/heat-pump-vs-boiler-bc"
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
            href="/canada/guides/air-to-water-heat-pumps-bc"
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
            href="/canada/guides/cost-heat-pump-installation-bc"
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

        {/* Neighborhood / Area Signals */}
        {city.neighborhoods && city.neighborhoods.length > 0 && (
          <p className="text-sm text-gray-500 mb-8">
            Serving {city.name} including {city.neighborhoods.join(', ')}
          </p>
        )}

        {/* Sibling City Links */}
        {siblingCities.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Other Cities in {city.region}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {siblingCities.map(sibling => (
                <Link
                  key={sibling.slug}
                  href={`/canada/bc/${city.regionSlug}/${sibling.slug}`}
                  className="bg-white border border-gray-200 rounded-lg p-4 text-sm text-primary-600 hover:shadow-md transition-shadow font-medium"
                >
                  {sibling.name} heat pump installers
                </Link>
              ))}
            </div>
            <Link
              href={`/canada/bc/${city.regionSlug}`}
              className="text-primary-600 hover:text-primary-700 font-medium text-sm"
            >
              All {city.region} heat pump contractors →
            </Link>
          </div>
        )}

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
