import Link from 'next/link';
import { regions } from '@/data/regions';

export default function HomePage() {
  return (
    <div>
      {/* Hero Section with Audience Selection */}
      <div className="bg-gradient-hero text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg">
              Canadian Heat Pump & Boiler Guide
            </h1>
            <p className="text-xl md:text-2xl text-blue-50 max-w-3xl mx-auto mb-8">
              Honest ROI analysis for heat pump installation, air-to-water systems, boiler replacement,
              and hybrid heating solutions in British Columbia.
            </p>

            {/* Audience Selection */}
            <div className="mb-8">
              <p className="text-lg text-blue-100 mb-4">I'm looking for information as a:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                <Link
                  href="/directory?audience=residential"
                  className="bg-white hover:bg-gray-100 text-primary-700 px-8 py-6 rounded-lg font-semibold text-lg shadow-lg transition-all transform hover:scale-105 border-2 border-transparent hover:border-primary-300"
                >
                  <div className="text-3xl mb-2">🏠</div>
                  <div className="font-bold mb-1">Homeowner</div>
                  <div className="text-sm text-gray-600">Find installers for your home</div>
                </Link>
                <Link
                  href="/directory?audience=commercial"
                  className="bg-white hover:bg-gray-100 text-primary-700 px-8 py-6 rounded-lg font-semibold text-lg shadow-lg transition-all transform hover:scale-105 border-2 border-transparent hover:border-primary-300"
                >
                  <div className="text-3xl mb-2">🏢</div>
                  <div className="font-bold mb-1">Facilities Manager</div>
                  <div className="text-sm text-gray-600">Find contractors for commercial projects</div>
                </Link>
              </div>
            </div>

            {/* Secondary CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/rebates"
                className="bg-accent-500 hover:bg-accent-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all transform hover:scale-105"
              >
                2026 Rebates Guide →
              </Link>
              <Link
                href="/directory"
                className="bg-transparent hover:bg-white/10 text-white border-2 border-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all"
              >
                View All Installers
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Value Props */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white border-2 border-primary-100 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow group">
          <div className="w-14 h-14 bg-gradient-primary rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <span className="text-3xl">📚</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">Educational Guides</h3>
          <p className="text-gray-600 mb-4 leading-relaxed">
            Technically accurate, homeowner-friendly explanations of heat pump and boiler systems,
            costs, and climate considerations.
          </p>
          <Link href="/guides" className="text-primary-600 hover:text-primary-700 font-semibold inline-flex items-center group">
            Explore Guides
            <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        <div className="bg-white border-2 border-accent-100 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow group">
          <div className="w-14 h-14 bg-gradient-accent rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <span className="text-3xl">🏙️</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">City-Specific Information</h3>
          <p className="text-gray-600 mb-4 leading-relaxed">
            Climate notes and installer listings tailored to your BC region—from coastal Vancouver Island
            to the Interior.
          </p>
          <Link href="/bc" className="text-accent-600 hover:text-accent-700 font-semibold inline-flex items-center group">
            Browse Cities
            <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        <div className="bg-white border-2 border-success-100 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow group">
          <div className="w-14 h-14 bg-gradient-to-br from-success-400 to-success-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <span className="text-3xl">🔧</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">Installer Directory</h3>
          <p className="text-gray-600 mb-4 leading-relaxed">
            Find heat pump and boiler installers serving your area. Filter by city and service type.
          </p>
          <Link href="/directory" className="text-success-600 hover:text-success-700 font-semibold inline-flex items-center group">
            View Directory
            <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </div>

      {/* ROI Calculator CTA */}
      <div className="mb-16 bg-gradient-to-r from-success-500 to-emerald-600 text-white rounded-2xl p-12 shadow-2xl">
        <div className="text-center max-w-3xl mx-auto">
          <div className="text-6xl mb-4">🧮</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Calculate Your Heat Pump ROI
          </h2>
          <p className="text-xl text-green-50 mb-8">
            Get personalized payback period, annual savings, and 15-year ROI analysis based on your home, climate zone, and current heating costs.
          </p>
          <Link
            href="/calculator"
            className="inline-block bg-white hover:bg-gray-100 text-success-700 px-10 py-5 rounded-xl font-bold text-xl shadow-lg transition-all transform hover:scale-105"
          >
            Try the Calculator →
          </Link>
          <p className="text-sm text-green-100 mt-4">Free • Takes 2 minutes • No email required</p>
        </div>
      </div>

      {/* Regions Overview */}
      <div className="mb-16 bg-gradient-to-br from-primary-50 to-blue-50 rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Browse by BC Region</h2>
        <p className="text-gray-600 mb-8 text-lg">Climate-specific guidance for your area</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {regions.map(region => (
            <Link
              key={region.slug}
              href={`/bc/${region.slug}`}
              className="bg-white border border-primary-200 rounded-xl p-6 hover:shadow-xl hover:border-primary-400 transition-all transform hover:-translate-y-1"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-2">{region.name}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{region.description}</p>
              <span className="text-primary-600 font-semibold text-sm inline-flex items-center">
                View Cities
                <span className="ml-1">→</span>
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Guides */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Guides</h2>
        <p className="text-gray-600 mb-8 text-lg">Deep dives into heat pump technology and costs</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/guides/heat-pump-vs-boiler-bc"
            className="bg-white border-l-4 border-primary-500 rounded-lg p-6 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">⚖️</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Heat Pumps vs. Boilers in BC
                </h3>
                <p className="text-gray-600 text-sm">
                  Compare efficiency, costs, and climate suitability for BC's varied regions.
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/guides/air-to-water-heat-pumps-bc"
            className="bg-white border-l-4 border-accent-500 rounded-lg p-6 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">💧</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Air-to-Water Heat Pumps in BC
                </h3>
                <p className="text-gray-600 text-sm">
                  Understand how air-to-water systems work with hydronic heating and radiant floors.
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/guides/hybrid-heat-pump-boiler-systems"
            className="bg-white border-l-4 border-success-500 rounded-lg p-6 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🔄</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Hybrid Heat Pump + Boiler Systems
                </h3>
                <p className="text-gray-600 text-sm">
                  Learn when and why to combine a heat pump with a backup boiler.
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/guides/cost-heat-pump-installation-bc"
            className="bg-white border-l-4 border-yellow-500 rounded-lg p-6 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">💰</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Heat Pump Installation Costs in BC
                </h3>
                <p className="text-gray-600 text-sm">
                  Typical cost ranges, factors that affect pricing, and available rebates.
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 rounded-lg p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-bold text-gray-900 mb-2">Disclaimer</p>
            <p className="text-gray-700 text-sm leading-relaxed">
              This website provides educational information only. It is not engineering advice, product endorsement,
              or a contractor recommendation. Always verify contractor licensing, insurance, and suitability for
              your specific needs. Consult qualified HVAC professionals for system design and installation.
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
