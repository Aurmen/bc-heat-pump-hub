import Link from 'next/link';
import type { Metadata } from 'next';
import { BreadcrumbJsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Heat Pump Guides',
  description: 'Complete guides on heat pump costs, ROI, efficiency ratings (SEER/HSPF), air-to-water systems, and hybrid heating for BC homes. Compare ductless vs central systems.',
  alternates: { canonical: 'https://canadianheatpumphub.ca/guides' },
};

const guides = [
  {
    slug: 'types-of-heat-pumps-bc',
    title: 'Types of Heat Pumps in BC',
    description: 'Complete overview of ductless, ducted, air-to-water, geothermal, and cold climate heat pumps. Compare costs, efficiency, and ideal applications.',
  },
  {
    slug: 'how-heat-pumps-work',
    title: 'How Heat Pumps Work',
    description: 'Technical explanation of heat pump operation, refrigeration cycles, and why they\'re 200-400% efficient. Accessible to homeowners, detailed for the curious.',
  },
  {
    slug: 'heat-pump-installation-process-bc',
    title: 'Heat Pump Installation Process in BC',
    description: 'Step-by-step guide from quote to commissioning. Timelines, inspections, permits, and what to expect during your heat pump installation.',
  },
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
  {
    slug: 'mitsubishi-vs-daikin-bc',
    title: 'Mitsubishi vs. Daikin Heat Pumps in BC',
    description: 'BC-specific comparison of the two most-installed heat pump brands. Cold climate performance, pricing, dealer networks, warranties, and rebate eligibility.',
  },
  {
    slug: 'fujitsu-vs-mitsubishi-cold-climate',
    title: 'Fujitsu vs. Mitsubishi: Cold Climate Heat Pumps',
    description: 'Detailed comparison for BC Interior and northern homeowners. Performance at -15°C and below, pricing differences, and which brand fits each BC region.',
  },
  {
    slug: 'best-cold-climate-heat-pump-bc-2026',
    title: 'Best Cold Climate Heat Pumps for BC in 2026',
    description: 'Ranked guide to the top cold-climate heat pumps available through BC dealers. Covers Mitsubishi, Daikin, Fujitsu, LG, Bosch, and Samsung — by BC region.',
  },
  {
    slug: 'how-to-claim-heat-pump-rebate-bc',
    title: 'How to Claim Heat Pump Rebates in BC (2026)',
    description: 'Step-by-step guide to stacking CleanBC ($6,000), Canada Greener Homes Loan ($40,000), OHPA for oil-heated homes ($10,000), and BC Hydro rebates — in the right order.',
  },
  {
    slug: 'heat-pump-vs-electric-baseboard-bc',
    title: 'Heat Pump vs. Electric Baseboard Heating in BC',
    description: 'Annual savings of $1,200-$2,500 for BC baseboard-heated homes. Compare efficiency, operating costs, rebates, and payback periods for the most common BC heating conversion.',
  },
  {
    slug: 'oil-furnace-heat-pump-conversion-bc',
    title: 'Oil Furnace to Heat Pump Conversion in BC',
    description: 'How to switch from oil heating to a heat pump in BC. Federal OHPA grant ($10,000), system options for oil furnaces and boilers, oil tank disposal, and ROI examples.',
  },
  {
    slug: 'heat-pump-condo-strata-bc',
    title: 'Heat Pumps in BC Condos and Strata Properties',
    description: 'How to get strata approval for a heat pump in BC. Your rights under the Strata Property Act, system options for condos, and how to appeal a rejected application.',
  },
  {
    slug: 'heat-pump-home-assessment-checklist-bc',
    title: 'Heat Pump Home Assessment Checklist for BC Homeowners',
    description: 'Do a 30-minute walk-through before calling any contractor. Check your panel, heating system, insulation, and outdoor unit options to get better quotes and spot red flags.',
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
          Heat Pump Educational Guides
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
