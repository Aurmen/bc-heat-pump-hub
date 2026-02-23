import Link from 'next/link';
import type { Metadata } from 'next';
import { BreadcrumbJsonLd } from '@/components/JsonLd';
import { repairCities } from '@/data/repair-cities';
import { getAllListings } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Heat Pump Repair & Emergency Service in BC | Canadian Heat Pump Hub',
  description: 'Find heat pump repair and emergency HVAC service across British Columbia. Pre-call checklists, repair cost tables, and local contractor listings for Vancouver, Surrey, Burnaby, Kelowna, and more.',
  alternates: { canonical: 'https://canadianheatpumphub.ca/repair' },
};

const lowerMainlandCities = repairCities.filter(c => c.region === 'Lower Mainland');
const islandCities = repairCities.filter(c => c.region === 'Vancouver Island');
const interiorCities = repairCities.filter(c => c.region === 'Interior');

export default function RepairHubPage() {
  const allListings = getAllListings();

  function cityCount(cityName: string) {
    return allListings.filter(l => l.city.toLowerCase() === cityName.toLowerCase()).length;
  }

  const breadcrumbItems = [
    { name: 'Home', url: 'https://canadianheatpumphub.ca' },
    { name: 'Heat Pump Repair', url: 'https://canadianheatpumphub.ca/repair' },
  ];

  const regionGroups = [
    { label: 'Lower Mainland', cities: lowerMainlandCities },
    { label: 'Vancouver Island', cities: islandCities },
    { label: 'Interior BC', cities: interiorCities },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary-600">Home</Link>
          <span className="mx-2">/</span>
          <span>Heat Pump Repair</span>
        </nav>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Heat Pump Repair & Emergency Service in BC
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl">
          Repair searches are urgent. Use the pre-call checklist to rule out simple fixes, then find a licensed technician in your city. Repair cost tables and BC-specific troubleshooting guidance for every major city.
        </p>

        {/* Emergency banner */}
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-5 mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <p className="font-bold text-red-900 text-lg">Need emergency service right now?</p>
              <p className="text-red-800 text-sm mt-1">
                Before calling — try the pre-call checklist on your city page. A tripped breaker, clogged filter, or thermostat setting resolves about 20% of "emergency" calls.
              </p>
            </div>
            <Link
              href="/directory"
              className="shrink-0 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold text-sm transition-colors"
            >
              Find a Technician →
            </Link>
          </div>
        </div>

        {/* What's on each city page */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          {[
            { icon: '✓', label: 'Pre-call emergency checklist' },
            { icon: '✓', label: 'Symptom → cause guide' },
            { icon: '✓', label: 'Local repair cost tables' },
            { icon: '✓', label: 'Technicians in your city' },
          ].map(item => (
            <div key={item.label} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-3">
              <span className="text-primary-600 font-bold text-lg">{item.icon}</span>
              <span className="text-sm text-gray-700 font-medium">{item.label}</span>
            </div>
          ))}
        </div>

        {/* City grid by region */}
        {regionGroups.map(({ label, cities }) => (
          <div key={label} className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-5 pb-2 border-b border-gray-200">
              {label}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cities.map(city => {
                const count = cityCount(city.name);
                return (
                  <Link
                    key={city.slug}
                    href={`/repair/${city.slug}`}
                    className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-primary-300 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-700">
                        {city.name}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ml-2 shrink-0 ${
                        city.climateType === 'interior-cold'
                          ? 'bg-blue-100 text-blue-800'
                          : city.climateType === 'coastal-mild'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {city.designTemp}°C design
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {city.climateHeadline}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {count > 0 ? `${count} contractor${count !== 1 ? 's' : ''} listed` : 'Directory expanding'}
                      </span>
                      <span className="text-primary-600 font-medium text-sm group-hover:text-primary-700">
                        View repair guide →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Repair cost preview */}
        <div className="bg-white border border-gray-200 rounded-xl p-8 mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">What Does Heat Pump Repair Cost in BC?</h2>
          <p className="text-gray-600 mb-6 text-sm">
            Typical ranges in 2026. Lower Mainland and Island labour rates run 10–15% above Interior BC. Emergency/after-hours calls add $150–$250 to any service call.
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Repair</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Lower Mainland</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Interior BC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { repair: 'Diagnostic visit', lm: '$100–$200', interior: '$85–$175' },
                  { repair: 'Capacitor replacement', lm: '$250–$450', interior: '$220–$400' },
                  { repair: 'Fan motor replacement', lm: '$700–$1,200', interior: '$620–$1,050' },
                  { repair: 'Refrigerant leak repair', lm: '$900–$2,500', interior: '$800–$2,200' },
                  { repair: 'Defrost board/sensor', lm: '$350–$650', interior: '$300–$575' },
                  { repair: 'Compressor replacement', lm: '$2,500–$4,500', interior: '$2,200–$4,000' },
                  { repair: 'Annual tune-up', lm: '$150–$300', interior: '$135–$265' },
                ].map(row => (
                  <tr key={row.repair} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{row.repair}</td>
                    <td className="px-4 py-3 text-gray-700">{row.lm}</td>
                    <td className="px-4 py-3 text-gray-700">{row.interior}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            All costs include parts and labour. Prices are estimates based on 2026 BC market rates. Brand-specific parts (Mitsubishi, Daikin) typically run higher. See your city page for regional detail.
          </p>
        </div>

        {/* Related resources */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/service" className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
            <h3 className="font-bold text-gray-900 mb-1">Full Service & Repair Guide</h3>
            <p className="text-sm text-gray-600">DIY maintenance tasks, repair timelines, and when to repair vs. replace.</p>
          </Link>
          <Link href="/directory" className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
            <h3 className="font-bold text-gray-900 mb-1">Find BC Technicians</h3>
            <p className="text-sm text-gray-600">Browse licensed heat pump service contractors by city and region.</p>
          </Link>
          <Link href="/guides/heat-pump-home-assessment-checklist-bc" className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
            <h3 className="font-bold text-gray-900 mb-1">Pre-Contractor Checklist</h3>
            <p className="text-sm text-gray-600">30-minute home assessment to prepare before calling any contractor.</p>
          </Link>
        </div>

        <div className="disclaimer mt-12">
          <p className="font-semibold mb-2">Disclaimer</p>
          <p>
            Repair cost estimates are illustrative based on 2026 BC market data. Actual costs depend on brand, part availability, access complexity, and contractor. Always get a written estimate before authorizing repairs. Electrical and refrigerant work requires licensed technicians under BC regulations.
          </p>
        </div>
      </div>
    </>
  );
}
