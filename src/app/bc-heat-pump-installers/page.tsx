import type { Metadata } from 'next';
import Link from 'next/link';
import { regions } from '@/data/regions';
import { cities } from '@/data/cities';
import { getAllListings } from '@/lib/utils';
import { BreadcrumbJsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'BC Heat Pump Installers - Find TSBC Verified Contractors | 2026',
  description: 'Find licensed heat pump installers across British Columbia. TSBC-verified contractors for ductless, ducted, and air-to-water heat pump installation. Compare costs, read reviews, get quotes.',
  alternates: {
    canonical: 'https://canadianheatpumphub.ca/bc-heat-pump-installers',
  },
  openGraph: {
    title: 'BC Heat Pump Installers - Find TSBC Verified Contractors',
    description: 'Find licensed heat pump installers across British Columbia. TSBC-verified contractors for residential and commercial projects.',
    url: 'https://canadianheatpumphub.ca/bc-heat-pump-installers',
  },
};

export default function BCHeatPumpInstallersPage() {
  const listings = getAllListings();
  const totalInstallers = listings.length;
  const totalCities = cities.length;

  const breadcrumbItems = [
    { name: 'Home', url: 'https://canadianheatpumphub.ca' },
    { name: 'BC Heat Pump Installers', url: 'https://canadianheatpumphub.ca/bc-heat-pump-installers' },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary-600">Home</Link>
          <span className="mx-2">/</span>
          <span>BC Heat Pump Installers</span>
        </nav>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          BC Heat Pump Installers
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Find TSBC-verified heat pump contractors across British Columbia. Compare {totalInstallers} installers serving {totalCities} cities.
        </p>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-primary text-white rounded-xl p-6 shadow-lg">
            <div className="text-4xl font-bold mb-2">{totalInstallers}</div>
            <div className="text-blue-100">Verified Installers</div>
          </div>
          <div className="bg-gradient-accent text-white rounded-xl p-6 shadow-lg">
            <div className="text-4xl font-bold mb-2">{totalCities}</div>
            <div className="text-orange-100">Cities Covered</div>
          </div>
          <div className="bg-gradient-to-br from-success-500 to-success-700 text-white rounded-xl p-6 shadow-lg">
            <div className="text-4xl font-bold mb-2">$6K-16K</div>
            <div className="text-green-100">Rebates Available</div>
          </div>
        </div>

        {/* What We Cover */}
        <div className="mb-12 bg-blue-50 border-l-4 border-primary-500 p-6 rounded-r-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Choose BC Heat Pump Hub?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">✓ TSBC Verification</h3>
              <p className="text-sm text-gray-700">All contractors verified through Technical Safety BC gas licensing database.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">✓ Climate-Specific Guidance</h3>
              <p className="text-sm text-gray-700">City-by-city climate data, recommended systems, and cost estimates.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">✓ Complete ROI Analysis</h3>
              <p className="text-sm text-gray-700">Installation costs, operating costs, payback periods, and 15-year savings.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">✓ 2026 Rebate Guide</h3>
              <p className="text-sm text-gray-700">Up-to-date federal, provincial, and utility rebate information.</p>
            </div>
          </div>
        </div>

        {/* Browse by Region */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Browse Heat Pump Installers by Region</h2>
          <p className="text-gray-600 mb-6">
            British Columbia's climate varies dramatically from coastal to interior regions. Find installers experienced with your local conditions.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {regions.map(region => {
              const regionCities = cities.filter(c => c.regionSlug === region.slug);
              return (
                <Link
                  key={region.slug}
                  href={`/bc/${region.slug}`}
                  className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-primary-400 hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{region.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{region.description}</p>
                  <div className="text-sm text-primary-600 font-semibold">
                    {regionCities.length} cities →
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Popular Cities */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Popular Cities for Heat Pump Installation</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cities.slice(0, 12).map(city => (
              <Link
                key={city.slug}
                href={`/bc/${city.regionSlug}/${city.slug}`}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-primary-400 transition-all"
              >
                <div className="font-semibold text-gray-900">{city.name}</div>
                <div className="text-sm text-gray-500">{city.region}</div>
              </Link>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link
              href="/bc"
              className="text-primary-600 hover:text-primary-700 font-semibold"
            >
              View All {totalCities} Cities →
            </Link>
          </div>
        </div>

        {/* Services Offered */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Heat Pump Installation Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-primary-200 rounded-lg p-6">
              <div className="text-3xl mb-3">❄️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Ductless Mini-Split</h3>
              <p className="text-sm text-gray-600 mb-3">
                Wall-mounted units for zone heating. Ideal for homes without ductwork.
              </p>
              <div className="text-sm font-semibold text-gray-900">Cost: $8,500-$14,500</div>
              <div className="text-sm text-success-600">After rebates: $3,000-9,000</div>
            </div>

            <div className="bg-white border border-primary-200 rounded-lg p-6">
              <div className="text-3xl mb-3">🏠</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Ducted Heat Pump</h3>
              <p className="text-sm text-gray-600 mb-3">
                Central system using existing or new ductwork. Whole-home solution.
              </p>
              <div className="text-sm font-semibold text-gray-900">Cost: $11,500-$17,500</div>
              <div className="text-sm text-success-600">After rebates: $5,000-12,000</div>
            </div>

            <div className="bg-white border border-primary-200 rounded-lg p-6">
              <div className="text-3xl mb-3">💧</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Air-to-Water</h3>
              <p className="text-sm text-gray-600 mb-3">
                Hydronic heating for radiant floors, baseboards, or radiators.
              </p>
              <div className="text-sm font-semibold text-gray-900">Cost: $14,500-$24,500</div>
              <div className="text-sm text-success-600">After rebates: $8,000-19,000</div>
            </div>
          </div>
        </div>

        {/* ROI Calculator CTA */}
        <div className="mb-12 bg-gradient-to-r from-success-500 to-emerald-600 text-white rounded-2xl p-10 shadow-2xl text-center">
          <div className="text-5xl mb-4">🧮</div>
          <h2 className="text-3xl font-bold mb-3">Calculate Your Heat Pump ROI</h2>
          <p className="text-lg text-green-50 mb-6 max-w-2xl mx-auto">
            Get personalized payback period, annual savings, and 15-year ROI analysis based on your city's climate.
          </p>
          <Link
            href="/calculator"
            className="inline-block bg-white hover:bg-gray-100 text-success-700 px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform hover:scale-105"
          >
            Try the Calculator →
          </Link>
          <p className="text-sm text-green-100 mt-3">Free • Takes 2 minutes • No email required</p>
        </div>

        {/* How to Choose */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Choose a Heat Pump Installer in BC</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <ol className="space-y-4">
              <li className="flex">
                <span className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold mr-4">1</span>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Verify TSBC Licensing</h3>
                  <p className="text-sm text-gray-700">All BC gas contractors must hold valid Technical Safety BC licenses. Check TSBC database for G2 or G3 certification.</p>
                </div>
              </li>
              <li className="flex">
                <span className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold mr-4">2</span>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Get Multiple Quotes</h3>
                  <p className="text-sm text-gray-700">Request 2-3 quotes from local installers. Compare equipment specifications, warranties, and installation quality—not just price.</p>
                </div>
              </li>
              <li className="flex">
                <span className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold mr-4">3</span>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Ask About Load Calculations</h3>
                  <p className="text-sm text-gray-700">Proper sizing requires Manual J load calculation. Oversized or undersized systems waste energy and money.</p>
                </div>
              </li>
              <li className="flex">
                <span className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold mr-4">4</span>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Check References & Reviews</h3>
                  <p className="text-sm text-gray-700">Ask for recent customer references. Look for installers with experience in your climate zone (cold climate vs coastal).</p>
                </div>
              </li>
              <li className="flex">
                <span className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold mr-4">5</span>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Confirm Rebate Eligibility</h3>
                  <p className="text-sm text-gray-700">Ensure installer can provide documentation required for federal and provincial rebates. Some programs require HPCN certification.</p>
                </div>
              </li>
            </ol>
          </div>
        </div>

        {/* Featured Guides */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Heat Pump Installation Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/heat-pump-cost-bc"
              className="bg-white border-l-4 border-primary-500 rounded-lg p-6 shadow-md hover:shadow-xl transition-all"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Heat Pump Installation Costs in BC
              </h3>
              <p className="text-gray-600 text-sm">
                Ductless, ducted, and air-to-water system costs by region. Before and after rebates.
              </p>
            </Link>

            <Link
              href="/rebates"
              className="bg-white border-l-4 border-accent-500 rounded-lg p-6 shadow-md hover:shadow-xl transition-all"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                2026 BC Heat Pump Rebates
              </h3>
              <p className="text-gray-600 text-sm">
                Complete guide to federal, provincial, and utility rebates. Up to $16,000 available.
              </p>
            </Link>

            <Link
              href="/cold-climate-heat-pump-bc"
              className="bg-white border-l-4 border-success-500 rounded-lg p-6 shadow-md hover:shadow-xl transition-all"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Cold Climate Heat Pumps in BC
              </h3>
              <p className="text-gray-600 text-sm">
                How heat pumps perform in Kelowna, Kamloops, Prince George, and Interior BC winters.
              </p>
            </Link>

            <Link
              href="/guides/heat-pump-vs-boiler-bc"
              className="bg-white border-l-4 border-yellow-500 rounded-lg p-6 shadow-md hover:shadow-xl transition-all"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Heat Pump vs Boiler in BC
              </h3>
              <p className="text-gray-600 text-sm">
                Compare efficiency, costs, and ROI. When to choose heat pump, boiler, or hybrid system.
              </p>
            </Link>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-primary text-white rounded-2xl p-10 text-center shadow-2xl">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Installer?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Browse our directory of TSBC-verified contractors serving all major BC cities. Filter by location, services, and emergency availability.
          </p>
          <Link
            href="/directory"
            className="inline-block bg-white hover:bg-gray-100 text-primary-700 px-10 py-4 rounded-xl font-bold text-xl shadow-lg transition-all transform hover:scale-105"
          >
            Browse Installer Directory →
          </Link>
        </div>

        {/* Disclaimer */}
        <div className="disclaimer mt-12">
          <p className="font-semibold mb-2">Disclaimer</p>
          <p>
            This directory is provided for informational purposes only and does not constitute endorsements.
            Always verify contractor licensing through Technical Safety BC, check insurance coverage, and obtain multiple quotes before hiring.
            Heat pump costs and rebates vary by system type, home characteristics, and program availability.
            Consult qualified HVAC professionals for system design specific to your home.
          </p>
        </div>
      </div>
    </>
  );
}
