import Link from 'next/link';
import type { Metadata } from 'next';
import { BreadcrumbJsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Heat Pump & Boiler Guides',
  description: 'Educational guides on heat pumps, air-to-water systems, boiler replacement, and hybrid heating solutions for BC homeowners.',
};

const guides = [
  {
    slug: 'heat-pump-vs-boiler-bc',
    title: 'Heat Pumps vs. Boilers in BC',
    description: 'Compare efficiency, operating costs, and climate suitability for different BC regions.',
  },
  {
    slug: 'air-to-water-heat-pumps-bc',
    title: 'Air-to-Water Heat Pumps in BC',
    description: 'How air-to-water systems work with hydronic heating, radiant floors, and existing boiler infrastructure.',
  },
  {
    slug: 'hybrid-heat-pump-boiler-systems',
    title: 'Hybrid Heat Pump + Boiler Systems',
    description: 'When and why to combine a heat pump with a backup boiler for reliability and efficiency.',
  },
  {
    slug: 'cost-heat-pump-installation-bc',
    title: 'Heat Pump Installation Costs in BC',
    description: 'Typical cost ranges, factors affecting pricing, available rebates, and long-term savings.',
  },
  {
    slug: 'boiler-replacement-cost-bc',
    title: 'Boiler Replacement Costs in BC',
    description: 'What to expect when replacing a gas, electric, or oil boiler in British Columbia.',
  },
];

export default function GuidesPage() {
  const breadcrumbItems = [
    { name: 'Home', url: 'https://canadianheatpumphub.ca' },
    { name: 'Guides', url: 'https://canadianheatpumphub.ca/guides' },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary-600">Home</Link>
          <span className="mx-2">/</span>
          <span>Guides</span>
        </nav>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Heat Pump & Boiler Educational Guides
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Technically accurate, homeowner-friendly information to help you make informed heating system decisions.
        </p>

        <div className="space-y-6">
          {guides.map(guide => (
            <Link
              key={guide.slug}
              href={`/guides/${guide.slug}`}
              className="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {guide.title}
              </h2>
              <p className="text-gray-600">
                {guide.description}
              </p>
              <span className="inline-block mt-3 text-primary-600 font-medium">
                Read Guide →
              </span>
            </Link>
          ))}
        </div>

        <div className="disclaimer mt-12">
          <p className="font-semibold mb-2">Disclaimer</p>
          <p>
            These guides provide educational information only. They are not engineering advice or product endorsements.
            Always consult qualified HVAC professionals for system design and installation specific to your home.
          </p>
        </div>
      </div>
    </>
  );
}
