import type { Metadata } from 'next';
import Link from 'next/link';
import { cities } from '@/data/cities';
import { BreadcrumbJsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Cold Climate Heat Pumps in BC - Kelowna, Kamloops, Prince George | 2026 Guide',
  description: 'Complete guide to cold climate heat pumps for BC Interior winters. Performance to -25°C, costs, efficiency ratings, and recommended models for Kelowna, Kamloops, Prince George, Vernon.',
  alternates: {
    canonical: 'https://canadianheatpumphub.ca/cold-climate-heat-pump-bc',
  },
  openGraph: {
    title: 'Cold Climate Heat Pumps in BC - Interior Winters Guide',
    description: 'How cold climate heat pumps perform in Kelowna, Kamloops, and Interior BC. Technical specs, costs, and installer recommendations.',
    url: 'https://canadianheatpumphub.ca/cold-climate-heat-pump-bc',
  },
};

export default function ColdClimateHeatPumpBCPage() {
  const interiorCities = cities.filter(c =>
    ['Okanagan', 'Kootenays', 'Thompson-Cariboo', 'Northern BC'].includes(c.region)
  );

  const breadcrumbItems = [
    { name: 'Home', url: 'https://canadianheatpumphub.ca' },
    { name: 'Cold Climate Heat Pumps BC', url: 'https://canadianheatpumphub.ca/cold-climate-heat-pump-bc' },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary-600">Home</Link>
          <span className="mx-2">/</span>
          <span>Cold Climate Heat Pumps BC</span>
        </nav>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Cold Climate Heat Pumps in British Columbia
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          How modern heat pumps perform in Kelowna, Kamloops, Prince George, and Interior BC winters down to -25°C.
        </p>

        {/* Quick Answer */}
        <div className="bg-gradient-primary text-white rounded-2xl p-8 mb-12 shadow-xl">
          <h2 className="text-2xl font-bold mb-4">Do Heat Pumps Work in Cold Climates?</h2>
          <p className="text-lg text-blue-50 mb-4">
            <strong>Yes.</strong> Modern cold climate heat pumps are designed for Canadian winters and maintain full heating capacity down to -20°C to -25°C.
            They're proven technology in Interior BC, Alberta, and Northern US states with similar climates.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="text-3xl font-bold mb-1">-25°C</div>
              <div className="text-sm text-blue-100">Rated operating temp</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="text-3xl font-bold mb-1">200%+</div>
              <div className="text-sm text-blue-100">Efficiency (COP 2.0+)</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="text-3xl font-bold mb-1">$1.5K-3K</div>
              <div className="text-sm text-blue-100">Premium vs standard</div>
            </div>
          </div>
        </div>

        {/* What Makes a Heat Pump "Cold Climate"? */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">What Makes a Heat Pump "Cold Climate"?</h2>

          <div className="bg-white border border-gray-200 rounded-xl p-8 mb-6 shadow-lg">
            <p className="text-gray-700 mb-6">
              Cold climate heat pumps use advanced technology to maintain heating capacity and efficiency at temperatures where standard models struggle or fail.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-gray-900 mb-3">🔧 Key Technologies</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• <strong>Variable-speed inverter compressor:</strong> Adjusts output continuously for efficiency</li>
                  <li>• <strong>Enhanced vapor injection (EVI):</strong> Boosts capacity at low temps</li>
                  <li>• <strong>Larger heat exchangers:</strong> More surface area for heat transfer</li>
                  <li>• <strong>Advanced defrost cycles:</strong> Minimizes frost buildup, maintains efficiency</li>
                  <li>• <strong>Cold-weather refrigerants:</strong> Optimized for sub-zero operation</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-3">📊 Performance Ratings</h3>
                <div className="space-y-3">
                  <div className="bg-success-50 border-l-4 border-success-500 p-3 rounded">
                    <div className="font-bold text-gray-900">Cold Climate Certified</div>
                    <div className="text-sm text-gray-700">100% heating capacity at -15°C</div>
                    <div className="text-sm text-gray-700">COP ≥ 1.75 at -15°C</div>
                  </div>
                  <div className="bg-blue-50 border-l-4 border-primary-500 p-3 rounded">
                    <div className="font-bold text-gray-900">Extended Range</div>
                    <div className="text-sm text-gray-700">Rated to -20°C to -30°C</div>
                    <div className="text-sm text-gray-700">COP ≥ 1.5 at low temps</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Data */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Cold Climate Heat Pump Performance</h2>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-lg mb-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Temperature</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Heating Capacity</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Efficiency (COP)</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Notes</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr className="bg-success-50">
                  <td className="px-6 py-4 font-semibold text-gray-900">-5°C (23°F)</td>
                  <td className="px-6 py-4 text-gray-700">100-110%</td>
                  <td className="px-6 py-4 font-bold text-success-600">2.8-3.2</td>
                  <td className="px-6 py-4 text-sm text-gray-600">Typical winter day - peak efficiency</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-semibold text-gray-900">-10°C (14°F)</td>
                  <td className="px-6 py-4 text-gray-700">95-105%</td>
                  <td className="px-6 py-4 font-bold text-success-600">2.3-2.7</td>
                  <td className="px-6 py-4 text-sm text-gray-600">Cold day - still highly efficient</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-semibold text-gray-900">-15°C (5°F)</td>
                  <td className="px-6 py-4 text-gray-700">85-100%</td>
                  <td className="px-6 py-4 font-bold text-primary-600">2.0-2.5</td>
                  <td className="px-6 py-4 text-sm text-gray-600">Very cold - meets 100% capacity threshold</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-semibold text-gray-900">-20°C (-4°F)</td>
                  <td className="px-6 py-4 text-gray-700">70-85%</td>
                  <td className="px-6 py-4 font-bold text-primary-600">1.7-2.2</td>
                  <td className="px-6 py-4 text-sm text-gray-600">Extreme cold - backup heat may activate</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-semibold text-gray-900">-25°C (-13°F)</td>
                  <td className="px-6 py-4 text-gray-700">50-70%</td>
                  <td className="px-6 py-4 font-bold text-warning-600">1.5-1.8</td>
                  <td className="px-6 py-4 text-sm text-gray-600">Design temp - backup system recommended</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-blue-50 border-l-4 border-primary-500 p-6 rounded-r-lg">
            <p className="text-sm text-gray-700">
              <strong>COP (Coefficient of Performance)</strong> measures efficiency. COP of 2.5 means the heat pump produces 2.5 units of heat per 1 unit of electricity (250% efficiency).
              Even at -20°C, cold climate heat pumps are still 170-220% efficient—far better than electric resistance heating (100%).
            </p>
          </div>
        </div>

        {/* Where You Need Cold Climate Heat Pumps in BC */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Where You Need Cold Climate Heat Pumps in BC</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-success-50 border-2 border-success-200 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">✅ Cold Climate Models REQUIRED</h3>
              <p className="text-sm text-gray-700 mb-4">
                Regions where winter temperatures regularly drop below -10°C:
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• <strong>Okanagan Interior:</strong> Kelowna, Vernon, Penticton (-12°C to -17°C design temp)</li>
                <li>• <strong>Thompson-Cariboo:</strong> Kamloops, Williams Lake, 100 Mile House (-18°C to -25°C)</li>
                <li>• <strong>Kootenays:</strong> Nelson, Cranbrook, Fernie (-18°C to -25°C)</li>
                <li>• <strong>Northern BC:</strong> Prince George, Quesnel, Fort St. John (-25°C to -35°C)</li>
              </ul>
            </div>

            <div className="bg-blue-50 border-2 border-primary-200 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">✓ Standard Models OK</h3>
              <p className="text-sm text-gray-700 mb-4">
                Milder coastal and Lower Mainland climates (above -10°C design temp):
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• <strong>Lower Mainland:</strong> Vancouver, Surrey, Burnaby (-5°C to -8°C)</li>
                <li>• <strong>Fraser Valley:</strong> Abbotsford, Langley, Maple Ridge (-8°C to -10°C)</li>
                <li>• <strong>Vancouver Island:</strong> Victoria, Nanaimo, Courtenay (-5°C to -8°C)</li>
                <li>• <strong>Sunshine Coast:</strong> Sechelt, Gibsons (-5°C)</li>
              </ul>
              <p className="text-xs text-gray-600 mt-3">
                Cold climate models work great here too, just not strictly necessary.
              </p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-bold text-gray-900 mb-4">📍 Interior BC Cities - Climate Data</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {interiorCities.slice(0, 9).map(city => (
                <Link
                  key={city.slug}
                  href={`/bc/${city.regionSlug}/${city.slug}`}
                  className="border border-gray-200 rounded-lg p-4 hover:border-primary-400 hover:shadow-md transition-all"
                >
                  <div className="font-bold text-gray-900 mb-1">{city.name}</div>
                  <div className="text-sm text-gray-600">{city.region}</div>
                  {city.designTemp && (
                    <div className="text-sm font-semibold text-primary-600 mt-2">
                      Design Temp: {city.designTemp}°C
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Cost Premium */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Cost of Cold Climate Heat Pumps</h2>

          <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-lg">
            <p className="text-gray-700 mb-6">
              Cold climate heat pumps cost <strong>$1,500-$3,000 more</strong> than standard models due to enhanced compressors, larger heat exchangers, and advanced controls.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="border-l-4 border-gray-300 pl-4">
                <div className="text-sm text-gray-600 mb-1">Standard Heat Pump</div>
                <div className="text-2xl font-bold text-gray-900 mb-2">$8,500-$12,000</div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Rated to -10°C to -15°C</li>
                  <li>• Good for coastal BC</li>
                  <li>• Lower upfront cost</li>
                </ul>
              </div>

              <div className="border-l-4 border-primary-500 pl-4">
                <div className="text-sm text-gray-600 mb-1">Cold Climate Heat Pump</div>
                <div className="text-2xl font-bold text-primary-600 mb-2">$10,000-$15,000</div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Rated to -20°C to -30°C</li>
                  <li>• Essential for Interior BC</li>
                  <li>• Better winter efficiency</li>
                </ul>
              </div>
            </div>

            <div className="bg-success-50 border border-success-200 rounded-lg p-5">
              <p className="text-sm text-gray-700 mb-2">
                <strong>💰 Is the premium worth it?</strong>
              </p>
              <p className="text-sm text-gray-700">
                Absolutely—for Interior BC climates. Cold climate models maintain 2-3x efficiency even at -20°C, while standard models may barely operate or shut off entirely.
                The $2,000 premium pays for itself within 2-3 winters through better efficiency and avoiding backup electric heat.
              </p>
            </div>
          </div>
        </div>

        {/* Backup Heat */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Do I Need Backup Heat?</h2>

          <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-lg">
            <p className="text-gray-700 mb-6">
              Most cold climate heat pump installations in Interior BC include backup heat for the coldest days (below -20°C) and as insurance against equipment failure.
            </p>

            <div className="space-y-4">
              <div className="bg-blue-50 border-l-4 border-primary-500 p-5 rounded-r-lg">
                <h3 className="font-bold text-gray-900 mb-2">Option 1: Electric Resistance Backup</h3>
                <p className="text-sm text-gray-700 mb-2">
                  Built-in electric coils activate automatically when outdoor temp drops or heat pump can't keep up.
                </p>
                <div className="text-sm text-gray-600">
                  <strong>Cost:</strong> $500-1,200 (usually included) | <strong>Operating cost:</strong> $0.12/kWh (expensive, but rarely used)
                </div>
              </div>

              <div className="bg-yellow-50 border-l-4 border-accent-500 p-5 rounded-r-lg">
                <h3 className="font-bold text-gray-900 mb-2">Option 2: Dual Fuel (Heat Pump + Gas Boiler)</h3>
                <p className="text-sm text-gray-700 mb-2">
                  Keep existing gas boiler as backup. Heat pump handles most heating; boiler only runs on coldest days.
                </p>
                <div className="text-sm text-gray-600">
                  <strong>Cost:</strong> $0-2,500 (integration) | <strong>Operating cost:</strong> Low—backup rarely needed
                </div>
              </div>

              <div className="bg-gray-50 border-l-4 border-gray-400 p-5 rounded-r-lg">
                <h3 className="font-bold text-gray-900 mb-2">Option 3: Heat Pump Only (No Backup)</h3>
                <p className="text-sm text-gray-700 mb-2">
                  Oversized cold climate heat pump handles all heating. Works in most BC Interior climates if properly sized.
                </p>
                <div className="text-sm text-gray-600">
                  <strong>Cost:</strong> No additional cost | <strong>Risk:</strong> Slightly undersized on design days (-25°C)
                </div>
              </div>
            </div>

            <div className="mt-6 bg-primary-50 border border-primary-200 rounded-lg p-5">
              <p className="text-sm text-gray-700">
                <strong>Recommendation:</strong> For Kelowna, Kamloops, Vernon (-15°C to -20°C design temp): <strong>Option 1 or 2</strong> recommended.
                For Prince George, Northern BC (-25°C+): <strong>Option 2 (dual fuel) strongly recommended.</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Top Brands */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Recommended Cold Climate Heat Pump Brands</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Mitsubishi Hyper-Heat</h3>
              <div className="text-sm text-gray-700 space-y-2 mb-4">
                <div><strong>Rated to:</strong> -25°C to -30°C</div>
                <div><strong>Warranty:</strong> 12 years compressor</div>
                <div><strong>Models:</strong> MXZ, PUZ, SVZ series</div>
              </div>
              <div className="text-sm text-success-600 font-semibold">Industry standard for cold climates</div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Daikin Aurora</h3>
              <div className="text-sm text-gray-700 space-y-2 mb-4">
                <div><strong>Rated to:</strong> -25°C</div>
                <div><strong>Warranty:</strong> 12 years compressor</div>
                <div><strong>Models:</strong> Aurora series, VRV</div>
              </div>
              <div className="text-sm text-success-600 font-semibold">Excellent low-temp performance</div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Fujitsu Halcyon</h3>
              <div className="text-sm text-gray-700 space-y-2 mb-4">
                <div><strong>Rated to:</strong> -25°C to -30°C</div>
                <div><strong>Warranty:</strong> 12 years compressor</div>
                <div><strong>Models:</strong> XLTH, XFTH series</div>
              </div>
              <div className="text-sm text-success-600 font-semibold">Proven in Canadian climates</div>
            </div>
          </div>

          <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-5">
            <p className="text-sm text-gray-700">
              <strong>⚠️ Important:</strong> Not all models from these brands are cold climate rated. Verify the specific model's low-temperature rating and HSPF/COP performance at -15°C before purchase.
              Look for NEEP Cold Climate certification or AHRI ratings at low temperatures.
            </p>
          </div>
        </div>

        {/* ROI Calculator CTA */}
        <div className="mb-12 bg-gradient-to-r from-success-500 to-emerald-600 text-white rounded-2xl p-10 shadow-2xl text-center">
          <div className="text-5xl mb-4">🧮</div>
          <h2 className="text-3xl font-bold mb-3">Calculate ROI for Your Climate Zone</h2>
          <p className="text-lg text-green-50 mb-6 max-w-2xl mx-auto">
            Get personalized payback period and savings based on your city's design temperature, heating degree days, and current heating system.
          </p>
          <Link
            href="/calculator"
            className="inline-block bg-white hover:bg-gray-100 text-success-700 px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform hover:scale-105"
          >
            Try the Free Calculator →
          </Link>
          <p className="text-sm text-green-100 mt-3">Includes cold climate premium and backup heat costs</p>
        </div>

        {/* Find Installers */}
        <div className="mb-12 bg-gradient-primary text-white rounded-2xl p-10 shadow-2xl text-center">
          <h2 className="text-3xl font-bold mb-4">Find Cold Climate Heat Pump Installers</h2>
          <p className="text-lg text-blue-50 mb-6 max-w-2xl mx-auto">
            Connect with TSBC-verified contractors experienced with cold climate installations in Kelowna, Kamloops, Prince George, and Interior BC.
          </p>
          <Link
            href="/bc-heat-pump-installers"
            className="inline-block bg-white hover:bg-gray-100 text-primary-700 px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform hover:scale-105"
          >
            Browse Installer Directory →
          </Link>
        </div>

        {/* Related Resources */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Related Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/heat-pump-cost-bc"
              className="bg-white border-l-4 border-primary-500 rounded-lg p-6 shadow-md hover:shadow-xl transition-all"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Heat Pump Installation Costs
              </h3>
              <p className="text-gray-600 text-sm">
                Cold climate premium pricing, rebates, and payback analysis.
              </p>
            </Link>

            <Link
              href="/guides/hybrid-heat-pump-boiler-systems"
              className="bg-white border-l-4 border-accent-500 rounded-lg p-6 shadow-md hover:shadow-xl transition-all"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Dual Fuel Heat Pump + Boiler Systems
              </h3>
              <p className="text-gray-600 text-sm">
                How to combine a heat pump with backup gas boiler for extreme cold.
              </p>
            </Link>

            <Link
              href="/guides/heat-pump-vs-boiler-bc"
              className="bg-white border-l-4 border-success-500 rounded-lg p-6 shadow-md hover:shadow-xl transition-all"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Heat Pump vs Boiler in BC
              </h3>
              <p className="text-gray-600 text-sm">
                ROI comparison for cold climate regions. When each system makes sense.
              </p>
            </Link>

            <Link
              href="/rebates"
              className="bg-white border-l-4 border-yellow-500 rounded-lg p-6 shadow-md hover:shadow-xl transition-all"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                2026 BC Heat Pump Rebates
              </h3>
              <p className="text-gray-600 text-sm">
                Up to $16,000 available. Federal, provincial, and utility programs.
              </p>
            </Link>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="disclaimer">
          <p className="font-semibold mb-2">Disclaimer</p>
          <p>
            Technical specifications and performance data represent typical values and may vary by model, installation quality, and operating conditions.
            Always consult with a licensed HVAC professional to determine the appropriate equipment for your specific climate, home characteristics, and heating needs.
            Performance ratings are based on manufacturer specifications and third-party testing (NEEP, AHRI).
            Actual operating costs depend on electricity rates, usage patterns, backup heat usage, and home insulation.
            This information is educational only and not engineering advice.
          </p>
        </div>
      </div>
    </>
  );
}
