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
  {
    slug: 'dual-fuel-vs-all-electric-interior-bc',
    title: 'Dual-Fuel vs. All-Electric: Choosing the Right System for the BC Interior',
    description: 'Balance point physics, ghost load math, and a side-by-side comparison for Kelowna, Kamloops, and Vernon homes. Explains why dual-fuel hybrid is the technically conservative choice for -22°C design temperatures.',
  },
  {
    slug: 'heat-pump-onboarding-checklist',
    title: 'Heat Pump Contractor Onboarding Checklist',
    description: '22-point contractor verification checklist. Manual J load calcs, CEC Section 8 electrical compliance, TSBC permits, CleanBC registration, and AHRI numbers — everything to confirm before signing any installation contract.',
  },
  {
    slug: 'bc-step-code-summary',
    title: 'The 2026 BC Step Code: What Homeowners & Builders Need to Know',
    description: 'Zero Carbon Step Code (ZCSC) explained: EL-1 through EL-4, TEDI and envelope performance, and why Vancouver\'s EL-4 mandate means all-electric heat pumps are now legally required for new construction.',
  },
  {
    slug: 'bc-step-code-city-tracker',
    title: 'BC Step Code City Tracker: Municipal Adoption Levels (2026)',
    description: 'Municipality-by-municipality table of BC Energy Step Code and ZCSC adoption. Vancouver (EL-4), Victoria (EL-4), Kelowna (EL-2), Surrey (EL-1) — with GHGI, TEDI, and MEUI explained for builders and homeowners.',
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
        <p className="text-xl text-gray-600 mb-10">
          Technically accurate, homeowner-friendly information to help you make informed heating system decisions.
        </p>

        {/* Regional Resource Centers */}
        <div className="mb-12">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
            Regional Resource Centers
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/guides/lower-mainland"
              className="block bg-white border border-gray-200 border-t-4 border-t-blue-600 rounded-xl p-6 hover:shadow-md transition-all duration-200 group"
            >
              <span className="inline-block text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-full mb-3">
                Metro Vancouver
              </span>
              <h2 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
                Lower Mainland Resource Center
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                Strata approvals, 100A panel solutions, EPR 2026 deadline, and rebate stacking for Vancouver, Surrey, Burnaby, and Richmond.
              </p>
              <div className="mt-4 flex items-center gap-1 text-blue-600 font-semibold text-sm group-hover:gap-2 transition-all">
                Explore Metro Vancouver guides <span aria-hidden="true">→</span>
              </div>
            </Link>

            <Link
              href="/guides/interior-bc"
              className="block bg-white border border-gray-200 border-t-4 border-t-slate-600 rounded-xl p-6 hover:shadow-md transition-all duration-200 group"
            >
              <span className="inline-block text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded-full mb-3">
                Thompson-Okanagan &amp; Interior
              </span>
              <h2 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
                Interior BC Resource Center
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                Cold-climate ASHP sizing, dual-fuel hybrid logic, and balance point planning for Kelowna, Kamloops, Vernon, and Penticton.
              </p>
              <div className="mt-4 flex items-center gap-1 text-blue-600 font-semibold text-sm group-hover:gap-2 transition-all">
                Explore Interior BC guides <span aria-hidden="true">→</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Tools & Calculators */}
        <div className="mb-12">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
            Tools &amp; Calculators
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/guides/bc-heat-pump-rebate-calculator"
              className="block bg-white border border-gray-200 border-t-4 border-t-green-600 rounded-xl p-6 hover:shadow-md transition-all duration-200 group"
            >
              <span className="inline-block text-xs font-semibold bg-green-100 text-green-800 border border-green-200 px-2.5 py-0.5 rounded-full mb-3">
                Rebate Calculator
              </span>
              <h2 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
                2026 BC Rebate Estimator
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                Estimate your OHPA, CleanBC Better Homes, and BC Hydro grant eligibility in under 60 seconds. Up to $16,000 in grants for oil-heated homes.
              </p>
              <div className="mt-4 flex items-center gap-1 text-blue-600 font-semibold text-sm group-hover:gap-2 transition-all">
                Estimate my rebates <span aria-hidden="true">→</span>
              </div>
            </Link>

            <Link
              href="/guides/heat-pump-roi-calculator"
              className="block bg-white border border-gray-200 border-t-4 border-t-blue-500 rounded-xl p-6 hover:shadow-md transition-all duration-200 group"
            >
              <span className="inline-block text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-full mb-3">
                ROI Calculator
              </span>
              <h2 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
                Heat Pump ROI Calculator
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                Estimate annual savings and payback period based on your current heating costs, installation cost, and available rebates.
              </p>
              <div className="mt-4 flex items-center gap-1 text-blue-600 font-semibold text-sm group-hover:gap-2 transition-all">
                Calculate my savings <span aria-hidden="true">→</span>
              </div>
            </Link>
          </div>
        </div>

        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
          All Guides
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
