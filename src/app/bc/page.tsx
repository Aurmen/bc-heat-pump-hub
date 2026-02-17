import Link from 'next/link';
import type { Metadata } from 'next';
import { regions } from '@/data/regions';
import { getCitiesByRegion } from '@/data/cities';
import { BreadcrumbJsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'British Columbia Heat Pump Installers by City',
  description: 'Find heat pump and boiler replacement installers across BC regions: Lower Mainland, Vancouver Island, and Interior.',
};

export default function BCPage() {
  const breadcrumbItems = [
    { name: 'Home', url: 'https://canadianheatpumphub.ca' },
    { name: 'BC', url: 'https://canadianheatpumphub.ca/bc' },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary-600">Home</Link>
          <span className="mx-2">/</span>
          <span>BC</span>
        </nav>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          British Columbia Heat Pump & Boiler Installers
        </h1>
        <p className="text-xl text-gray-600 mb-12">
          Find installers and climate-specific information for your BC region and city.
        </p>

        <div className="space-y-12">
          {regions.map(region => {
            const regionCities = getCitiesByRegion(region.slug);

            return (
              <div key={region.slug}>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    <Link
                      href={`/bc/${region.slug}`}
                      className="hover:text-primary-600"
                    >
                      {region.name}
                    </Link>
                  </h2>
                  <p className="text-gray-600 mb-4">{region.description}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {regionCities.map(city => (
                    <Link
                      key={city.slug}
                      href={`/bc/${region.slug}/${city.slug}`}
                      className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:shadow-md transition-shadow"
                    >
                      <div className="font-semibold text-gray-900">{city.name}</div>
                      {city.population && (
                        <div className="text-xs text-gray-500 mt-1">{city.population}</div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="disclaimer mt-12">
          <p className="font-semibold mb-2">Disclaimer</p>
          <p>
            Installer listings are for informational purposes only. Always verify licensing, insurance,
            and suitability for your specific project. This is not an endorsement or recommendation.
          </p>
        </div>
      </div>
    </>
  );
}
