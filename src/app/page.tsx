import Link from 'next/link';
import { regions } from '@/data/regions';

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Canadian Heat Pump & Boiler Replacement Guide
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Honest ROI analysis for heat pump installation, air-to-water systems, boiler replacement,
          and hybrid heating solutions. Currently serving British Columbia.
        </p>
      </div>

      {/* Value Props */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Educational Guides</h3>
          <p className="text-gray-600 mb-4">
            Technically accurate, homeowner-friendly explanations of heat pump and boiler systems,
            costs, and climate considerations.
          </p>
          <Link href="/guides" className="text-primary-600 hover:text-primary-700 font-medium">
            Explore Guides →
          </Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">City-Specific Information</h3>
          <p className="text-gray-600 mb-4">
            Climate notes and installer listings tailored to your BC region—from coastal Vancouver Island
            to the Interior.
          </p>
          <Link href="/bc" className="text-primary-600 hover:text-primary-700 font-medium">
            Browse Cities →
          </Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Installer Directory</h3>
          <p className="text-gray-600 mb-4">
            Find heat pump and boiler installers serving your area. Filter by city and service type.
          </p>
          <Link href="/directory" className="text-primary-600 hover:text-primary-700 font-medium">
            View Directory →
          </Link>
        </div>
      </div>

      {/* Regions Overview */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Browse by BC Region</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {regions.map(region => (
            <Link
              key={region.slug}
              href={`/bc/${region.slug}`}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{region.name}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{region.description}</p>
              <span className="text-primary-600 font-medium text-sm">
                View Cities →
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Guides */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Featured Guides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/guides/heat-pump-vs-boiler-bc"
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Heat Pumps vs. Boilers in BC
            </h3>
            <p className="text-gray-600 text-sm">
              Compare efficiency, costs, and climate suitability for BC's varied regions.
            </p>
          </Link>

          <Link
            href="/guides/air-to-water-heat-pumps-bc"
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Air-to-Water Heat Pumps in BC
            </h3>
            <p className="text-gray-600 text-sm">
              Understand how air-to-water systems work with hydronic heating and radiant floors.
            </p>
          </Link>

          <Link
            href="/guides/hybrid-heat-pump-boiler-systems"
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Hybrid Heat Pump + Boiler Systems
            </h3>
            <p className="text-gray-600 text-sm">
              Learn when and why to combine a heat pump with a backup boiler.
            </p>
          </Link>

          <Link
            href="/guides/cost-heat-pump-installation-bc"
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Heat Pump Installation Costs in BC
            </h3>
            <p className="text-gray-600 text-sm">
              Typical cost ranges, factors that affect pricing, and available rebates.
            </p>
          </Link>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="disclaimer">
        <p className="font-semibold mb-2">Disclaimer</p>
        <p>
          This website provides educational information only. It is not engineering advice, product endorsement,
          or a contractor recommendation. Always verify contractor licensing, insurance, and suitability for
          your specific needs. Consult qualified HVAC professionals for system design and installation.
        </p>
      </div>
    </div>
  );
}
