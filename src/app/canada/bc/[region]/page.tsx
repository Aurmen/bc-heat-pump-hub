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
    alternates: { canonical: `https://heatpumplocator.com/canada/bc/${regionSlug}` },
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
    { name: 'Home', url: 'https://heatpumplocator.com' },
    { name: 'BC', url: 'https://heatpumplocator.com/bc' },
    { name: region.name, url: `https://heatpumplocator.com/canada/bc/${region.slug}` },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary-600">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/canada/bc" className="hover:text-primary-600">BC</Link>
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
          {region.slug === 'lower-mainland' && (
            <>
              <Link
                href="/canada/guides/vancouver-strata-heat-pump-guide"
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Vancouver Strata Heat Pump Guide
                </h3>
                <p className="text-gray-600 text-sm">
                  EPR deadline, strata approval process, and Duty to Accommodate rights.
                </p>
              </Link>
              <Link
                href="/canada/guides/100-amp-panel-heat-pump-vancouver"
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  100 Amp Panel Solutions (Surrey & Vancouver)
                </h3>
                <p className="text-gray-600 text-sm">
                  BC Hydro upgrade vs. EMS load controllers — the numbers compared.
                </p>
              </Link>
              <Link
                href="/canada/guides/how-to-claim-heat-pump-rebate-bc"
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Rebate Navigator
                </h3>
                <p className="text-gray-600 text-sm">
                  Stack CleanBC, BC Hydro Condo Program, and Greener Homes Loan in the correct order.
                </p>
              </Link>
              <Link
                href="/canada/guides/lower-mainland"
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Metro Vancouver Resource Center
                </h3>
                <p className="text-gray-600 text-sm">
                  All Lower Mainland guides, tools, and compliance information in one place.
                </p>
              </Link>
            </>
          )}
          {region.slug === 'interior' && (
            <>
              <Link
                href="/canada/guides/dual-fuel-vs-all-electric-interior-bc"
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Dual-Fuel vs. All-Electric for Interior BC
                </h3>
                <p className="text-gray-600 text-sm">
                  Balance point physics and system recommendations for -22°C design temperatures.
                </p>
              </Link>
              <Link
                href="/canada/guides/best-cold-climate-heat-pump-bc-2026"
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Best Cold Climate Heat Pumps (2026)
                </h3>
                <p className="text-gray-600 text-sm">
                  Ranked guide to equipment that maintains capacity at -15°C and below.
                </p>
              </Link>
              <Link
                href="/canada/guides/heat-pump-sizing-guide-bc"
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Heat Pump Sizing Guide
                </h3>
                <p className="text-gray-600 text-sm">
                  Manual J calculations and design temperatures for Interior BC climates.
                </p>
              </Link>
              <Link
                href="/canada/guides/interior-bc"
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Interior BC Resource Center
                </h3>
                <p className="text-gray-600 text-sm">
                  All Interior guides, cold-climate tools, and regional information in one place.
                </p>
              </Link>
            </>
          )}
          {region.slug === 'vancouver-island' && (
            <>
              <Link
                href="/canada/guides/heat-pump-condo-strata-bc"
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Heat Pumps in BC Condos & Strata
                </h3>
                <p className="text-gray-600 text-sm">
                  Strata Property Act rights, approval process, and sample application language.
                </p>
              </Link>
              <Link
                href="/canada/guides/how-to-claim-heat-pump-rebate-bc"
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  How to Claim Heat Pump Rebates in BC
                </h3>
                <p className="text-gray-600 text-sm">
                  Stacking CleanBC, Canada Greener Homes, and BC Hydro programs — in the right order.
                </p>
              </Link>
              <Link
                href="/canada/guides/heat-pump-vs-boiler-bc"
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Heat Pumps vs. Boilers in BC
                </h3>
                <p className="text-gray-600 text-sm">
                  Compare efficiency and costs for Vancouver Island's mild, wet climate.
                </p>
              </Link>
              <Link
                href="/canada/guides/cost-heat-pump-installation-bc"
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Heat Pump Installation Costs
                </h3>
                <p className="text-gray-600 text-sm">
                  Typical cost ranges and available rebates across BC.
                </p>
              </Link>
            </>
          )}
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
