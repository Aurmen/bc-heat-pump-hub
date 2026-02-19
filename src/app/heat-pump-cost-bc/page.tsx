import type { Metadata } from 'next';
import Link from 'next/link';
import { regions } from '@/data/regions';
import { cities } from '@/data/cities';
import { BreadcrumbJsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Heat Pump Cost BC - Installation & Operating Costs 2026 | Complete Guide',
  description: 'Complete guide to heat pump costs in British Columbia. Installation costs $8,500-24,500, rebates up to $16,000, operating costs 60-70% less than baseboard. ROI calculator included.',
  alternates: {
    canonical: 'https://canadianheatpumphub.ca/heat-pump-cost-bc',
  },
  openGraph: {
    title: 'Heat Pump Cost BC - Installation & Operating Costs 2026',
    description: 'Complete breakdown of heat pump installation costs, operating costs, rebates, and payback periods across British Columbia.',
    url: 'https://canadianheatpumphub.ca/heat-pump-cost-bc',
  },
};

export default function HeatPumpCostBCPage() {
  const breadcrumbItems = [
    { name: 'Home', url: 'https://canadianheatpumphub.ca' },
    { name: 'Heat Pump Cost BC', url: 'https://canadianheatpumphub.ca/heat-pump-cost-bc' },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary-600">Home</Link>
          <span className="mx-2">/</span>
          <span>Heat Pump Cost BC</span>
        </nav>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Heat Pump Cost in British Columbia (2026)
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Complete breakdown of heat pump installation costs, operating costs, rebates, and ROI across BC's regions.
        </p>

        {/* Quick Summary */}
        <div className="bg-gradient-primary text-white rounded-2xl p-8 mb-12 shadow-xl">
          <h2 className="text-2xl font-bold mb-6">Heat Pump Cost Summary (2026)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-blue-100 mb-2">Installation Cost</div>
              <div className="text-3xl font-bold">$8.5K-24.5K</div>
              <div className="text-sm text-blue-100 mt-1">Before rebates</div>
            </div>
            <div>
              <div className="text-sm text-blue-100 mb-2">After Rebates</div>
              <div className="text-3xl font-bold">$3K-19K</div>
              <div className="text-sm text-blue-100 mt-1">Up to $16K off</div>
            </div>
            <div>
              <div className="text-sm text-blue-100 mb-2">Annual Savings</div>
              <div className="text-3xl font-bold">$1,500-2,500</div>
              <div className="text-sm text-blue-100 mt-1">vs electric baseboard</div>
            </div>
          </div>
        </div>

        {/* Installation Costs by System Type */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Installation Costs by System Type</h2>
          <p className="text-gray-600 mb-6">
            Costs shown are for a typical 2,000 sq ft home in BC. Actual costs vary by home size, insulation quality, and installation complexity.
          </p>

          <div className="space-y-6">
            <div className="bg-white border-2 border-primary-200 rounded-xl p-6 shadow-lg">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Ductless Mini-Split Heat Pump</h3>
                  <p className="text-gray-600">Wall-mounted indoor units, single outdoor compressor. 1-5 zones.</p>
                </div>
                <div className="text-3xl">❄️</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Installation Cost</div>
                  <div className="text-2xl font-bold text-gray-900">$8,500 - $14,500</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">After Rebates</div>
                  <div className="text-2xl font-bold text-success-600">$3,000 - $9,000</div>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-semibold text-gray-900 mb-2">What's Included:</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• 1-3 indoor wall units + outdoor compressor</li>
                  <li>• Refrigerant lines, electrical, condensate drain</li>
                  <li>• Basic pad/bracket installation</li>
                  <li>• Commissioning and warranty registration</li>
                </ul>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <strong>Best for:</strong> Homes without ductwork, zone heating, renovations
              </div>
            </div>

            <div className="bg-white border-2 border-primary-200 rounded-xl p-6 shadow-lg">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Ducted Heat Pump System</h3>
                  <p className="text-gray-600">Central air handler connected to ductwork. Whole-home solution.</p>
                </div>
                <div className="text-3xl">🏠</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Installation Cost</div>
                  <div className="text-2xl font-bold text-gray-900">$11,500 - $17,500</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">After Rebates</div>
                  <div className="text-2xl font-bold text-success-600">$5,000 - $12,000</div>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-semibold text-gray-900 mb-2">What's Included:</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Outdoor heat pump + indoor air handler</li>
                  <li>• Refrigerant lines, electrical connections</li>
                  <li>• Integration with existing ducts (or +$3K-8K for new ducts)</li>
                  <li>• Thermostat upgrade, startup, commissioning</li>
                </ul>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <strong>Best for:</strong> Homes with existing ductwork, new construction, whole-home comfort
              </div>
            </div>

            <div className="bg-white border-2 border-primary-200 rounded-xl p-6 shadow-lg">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Air-to-Water Heat Pump</h3>
                  <p className="text-gray-600">Hydronic heating for radiant floors, baseboards, or radiators.</p>
                </div>
                <div className="text-3xl">💧</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Installation Cost</div>
                  <div className="text-2xl font-bold text-gray-900">$14,500 - $24,500</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">After Rebates</div>
                  <div className="text-2xl font-bold text-success-600">$8,000 - $19,000</div>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-semibold text-gray-900 mb-2">What's Included:</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Outdoor heat pump + indoor hydronic module</li>
                  <li>• Buffer tank, pump, controls, expansion tank</li>
                  <li>• Connection to existing hydronic distribution</li>
                  <li>• Commissioning, water quality treatment</li>
                </ul>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <strong>Best for:</strong> Homes with radiant floors, baseboard radiators, or hot water heating
              </div>
            </div>
          </div>
        </div>

        {/* Operating Costs */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Annual Operating Costs in BC</h2>
          <p className="text-gray-600 mb-6">
            Estimated annual heating costs for a 2,000 sq ft home in Lower Mainland climate. Actual costs vary by insulation, usage, and local climate.
          </p>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Heating System</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Annual Cost</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">vs Electric Baseboard</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">15-Year Savings</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr className="bg-success-50">
                  <td className="px-6 py-4 font-bold text-gray-900">Heat Pump</td>
                  <td className="px-6 py-4 text-lg font-bold text-success-600">$1,000-$1,300</td>
                  <td className="px-6 py-4 font-bold text-success-600">Save 60-70%</td>
                  <td className="px-6 py-4 text-lg font-bold text-success-600">$24,000-$33,000</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-semibold text-gray-900">Gas Boiler (Natural Gas)</td>
                  <td className="px-6 py-4 text-gray-700">$1,200-$1,600</td>
                  <td className="px-6 py-4 text-success-600">Save 55-65%</td>
                  <td className="px-6 py-4 text-success-600">$21,000-$28,500</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-semibold text-gray-900">Oil Boiler</td>
                  <td className="px-6 py-4 text-gray-700">$2,200-$2,800</td>
                  <td className="px-6 py-4 text-warning-600">More expensive</td>
                  <td className="px-6 py-4 text-gray-500">-</td>
                </tr>
                <tr className="bg-red-50">
                  <td className="px-6 py-4 font-semibold text-gray-900">Electric Baseboard</td>
                  <td className="px-6 py-4 text-gray-700">$3,000-$3,800</td>
                  <td className="px-6 py-4 text-red-600">Baseline (most expensive)</td>
                  <td className="px-6 py-4 text-gray-500">-</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 bg-blue-50 border-l-4 border-primary-500 p-4">
            <p className="text-sm text-gray-700">
              <strong>BC Electricity Rates:</strong> Based on BC Hydro rates (~$0.12/kWh) and FortisBC natural gas rates (~$1.50/GJ). Heat pump efficiency (COP) of 2.5-3.5 assumed.
            </p>
          </div>
        </div>

        {/* Cost Factors */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">What Affects Heat Pump Installation Cost?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-3">🏡 Home Size & Heating Load</h3>
              <p className="text-sm text-gray-700 mb-2">
                Larger homes require more powerful (and more expensive) equipment. 1,000 sq ft home: $7K-10K. 3,000 sq ft home: $15K-25K.
              </p>
              <p className="text-sm text-gray-600">
                Proper load calculation (Manual J) ensures correct sizing.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-3">❄️ Climate Zone</h3>
              <p className="text-sm text-gray-700 mb-2">
                Cold climate heat pumps (rated to -20°C or lower) cost $1,500-3,000 more than standard models.
              </p>
              <p className="text-sm text-gray-600">
                Essential for Interior BC (Kelowna, Kamloops, Prince George).
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-3">🔧 Installation Complexity</h3>
              <p className="text-sm text-gray-700 mb-2">
                Simple installations (ground floor, outdoor unit close to indoor): lower cost. Complex installs (rooftop, long line sets, electrical upgrades): add $2K-5K.
              </p>
              <p className="text-sm text-gray-600">
                Electrical panel upgrades: $1,500-3,000 if needed.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-3">🏗️ Existing Infrastructure</h3>
              <p className="text-sm text-gray-700 mb-2">
                Homes with ductwork: ducted heat pump easier. No ducts: ductless or add ductwork (+$3K-8K).
              </p>
              <p className="text-sm text-gray-600">
                Hydronic systems: air-to-water is best option.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-3">🏅 Equipment Brand & Efficiency</h3>
              <p className="text-sm text-gray-700 mb-2">
                Premium brands (Mitsubishi, Daikin, Fujitsu): $1K-2K more. Higher SEER/HSPF ratings: better efficiency, higher upfront cost.
              </p>
              <p className="text-sm text-gray-600">
                Warranty periods vary: 5-12 years typical.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-3">📋 Permits & Inspections</h3>
              <p className="text-sm text-gray-700 mb-2">
                BC requires permits for heat pump installations. Permit fees: $150-500. Inspections required by Technical Safety BC.
              </p>
              <p className="text-sm text-gray-600">
                Included in most contractor quotes.
              </p>
            </div>
          </div>
        </div>

        {/* Rebates Section */}
        <div className="mb-12 bg-gradient-to-r from-success-500 to-emerald-600 text-white rounded-2xl p-10 shadow-2xl">
          <h2 className="text-3xl font-bold mb-4">Reduce Costs with BC Heat Pump Rebates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white/10 backdrop-blur rounded-lg p-5">
              <div className="text-sm text-green-100 mb-2">Standard Household</div>
              <div className="text-4xl font-bold mb-2">Up to $6,000</div>
              <div className="text-sm text-green-100">Federal + Provincial programs</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-5">
              <div className="text-sm text-green-100 mb-2">Income-Qualified</div>
              <div className="text-4xl font-bold mb-2">Up to $16,000</div>
              <div className="text-sm text-green-100">Enhanced rebates + interest-free loan</div>
            </div>
          </div>
          <Link
            href="/rebates"
            className="inline-block bg-white hover:bg-gray-100 text-success-700 px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform hover:scale-105"
          >
            View Complete 2026 Rebates Guide →
          </Link>
        </div>

        {/* ROI Calculator CTA */}
        <div className="mb-12 bg-gradient-primary text-white rounded-2xl p-10 shadow-2xl text-center">
          <div className="text-5xl mb-4">🧮</div>
          <h2 className="text-3xl font-bold mb-3">Calculate Your Exact ROI</h2>
          <p className="text-lg text-blue-50 mb-6 max-w-2xl mx-auto">
            Get personalized payback period, annual savings, and 15-year ROI based on your city, home size, and current heating costs.
          </p>
          <Link
            href="/calculator"
            className="inline-block bg-white hover:bg-gray-100 text-primary-700 px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform hover:scale-105"
          >
            Try the Free Calculator →
          </Link>
          <p className="text-sm text-blue-100 mt-3">Takes 2 minutes • No email required</p>
        </div>

        {/* City-Specific Costs */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Heat Pump Costs by BC City</h2>
          <p className="text-gray-600 mb-6">
            Installation and operating costs vary by climate zone. View detailed cost breakdowns for your city.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {regions.map(region => (
              <Link
                key={region.slug}
                href={`/bc/${region.slug}`}
                className="bg-white border border-gray-200 rounded-lg p-5 hover:border-primary-400 hover:shadow-lg transition-all"
              >
                <h3 className="font-bold text-gray-900 mb-2">{region.name}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{region.description}</p>
                <div className="text-sm text-primary-600 font-semibold mt-3">
                  View Cities →
                </div>
              </Link>
            ))}
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="font-bold text-gray-900 mb-4">Popular Cities:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {cities.slice(0, 12).map(city => (
                <Link
                  key={city.slug}
                  href={`/bc/${city.regionSlug}/${city.slug}`}
                  className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
                >
                  {city.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Related Cost Guides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/bc-heat-pump-installers"
              className="bg-white border-l-4 border-primary-500 rounded-lg p-6 shadow-md hover:shadow-xl transition-all"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Find BC Heat Pump Installers
              </h3>
              <p className="text-gray-600 text-sm">
                Browse TSBC-verified contractors. Get multiple quotes to compare costs.
              </p>
            </Link>

            <Link
              href="/guides/heat-pump-vs-boiler-bc"
              className="bg-white border-l-4 border-accent-500 rounded-lg p-6 shadow-md hover:shadow-xl transition-all"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Heat Pump vs Boiler Cost Comparison
              </h3>
              <p className="text-gray-600 text-sm">
                Compare installation costs, operating costs, and long-term ROI.
              </p>
            </Link>

            <Link
              href="/guides/cost-heat-pump-installation-bc"
              className="bg-white border-l-4 border-success-500 rounded-lg p-6 shadow-md hover:shadow-xl transition-all"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Detailed Installation Cost Guide
              </h3>
              <p className="text-gray-600 text-sm">
                In-depth breakdown of labor, materials, permits, and hidden costs.
              </p>
            </Link>

            <Link
              href="/cold-climate-heat-pump-bc"
              className="bg-white border-l-4 border-yellow-500 rounded-lg p-6 shadow-md hover:shadow-xl transition-all"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Cold Climate Heat Pump Costs
              </h3>
              <p className="text-gray-600 text-sm">
                Premium equipment for Interior BC. Performance and cost differences.
              </p>
            </Link>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="disclaimer">
          <p className="font-semibold mb-2">Disclaimer</p>
          <p>
            Cost estimates are based on 2026 market data from BC contractors and may vary significantly by location, home characteristics, and project complexity.
            Always obtain multiple written quotes from licensed HVAC contractors before making decisions.
            Rebate amounts and eligibility change frequently—verify current programs with official sources.
            Operating cost estimates assume average electricity rates, fuel costs, and system efficiency; actual costs depend on usage patterns, insulation quality, and climate.
            This information is educational only and not financial or engineering advice.
          </p>
        </div>
      </div>
    </>
  );
}
