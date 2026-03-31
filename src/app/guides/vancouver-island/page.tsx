import Link from 'next/link';
import type { Metadata } from 'next';
import { BreadcrumbJsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Vancouver Island Heat Pump Resource Center | Canadian Heat Pump Hub',
  description:
    'Technical heat pump guidance for Vancouver Island homeowners. Victoria and Saanich EL-4 compliance, air-to-water systems, strata approvals, and rebate navigation for Victoria, Nanaimo, Courtenay, and Campbell River.',
  alternates: {
    canonical: 'https://heatpumplocator.com/guides/vancouver-island',
  },
  keywords: [
    'Vancouver Island heat pump guide',
    'Victoria heat pump installation',
    'Saanich EL-4 heat pump compliance',
    'Nanaimo heat pump contractor',
    'air to water heat pump Vancouver Island',
    'Victoria strata heat pump approval',
    'Courtenay heat pump installer',
  ],
};

const featureCards = [
  {
    label: 'Compliance Guide',
    labelColor: 'bg-teal-100 text-teal-800 border border-teal-200',
    borderAccent: 'border-t-teal-600',
    title: 'Victoria & Saanich EL-4 Mandate',
    description:
      'Victoria and Saanich adopted EL-4 (Zero Carbon Step Code) for new construction — the same requirement as Vancouver. No combustion for space heating on new permits. This guide explains what EL-4 means for Island homeowners, which permits are affected, and how a heat pump satisfies compliance at the mild Island design temperatures of -3°C to -7°C.',
    href: '/guides/bc-step-code-summary',
    cta: 'Read the Step Code Guide',
  },
  {
    label: 'Technical Guide',
    labelColor: 'bg-blue-100 text-blue-800 border border-blue-200',
    borderAccent: 'border-t-blue-600',
    title: 'Air-to-Water Heat Pumps',
    description:
      "Vancouver Island's mild maritime climate — with design temperatures of -3°C to -9°C — is one of BC's most favourable zones for air-to-water (hydronic) heat pump systems. These systems integrate with radiant floors, fan coils, and existing hot water baseboard infrastructure. This guide covers when air-to-water makes sense, what efficiency you can realistically expect, and what the installation involves.",
    href: '/guides/air-to-water-heat-pumps-bc',
    cta: 'Read the Air-to-Water Guide',
  },
  {
    label: 'Strata Approval',
    labelColor: 'bg-blue-50 text-blue-700 border border-blue-200',
    borderAccent: 'border-t-blue-400',
    title: 'Strata Approvals in Victoria & Nanaimo',
    description:
      "Victoria and Nanaimo have significant condo and townhome strata populations. The same Strata Property Act rights and Duty to Accommodate provisions apply on the Island as in Metro Vancouver. This guide covers the approval process, what your application must include, and how to respond if council refuses.",
    href: '/guides/heat-pump-condo-strata-bc',
    cta: 'Read the Strata Guide',
  },
  {
    label: 'Rebates 2026',
    labelColor: 'bg-green-50 text-green-800 border border-green-200',
    borderAccent: 'border-t-green-600',
    title: 'Rebate Navigator',
    description:
      'Vancouver Island homeowners access the same provincial and federal rebate stack as the rest of BC. CleanBC Better Homes (up to $6,000), the Canada Greener Homes Loan ($40,000 interest-free), and BC Hydro rebates are all available — but application sequence matters. Do not purchase equipment before confirming eligibility.',
    href: '/guides/how-to-claim-heat-pump-rebate-bc',
    cta: 'Read the Rebate Guide',
  },
  {
    label: 'Checklist',
    labelColor: 'bg-gray-100 text-gray-700 border border-gray-200',
    borderAccent: 'border-t-gray-500',
    title: 'Contractor Interview Checklist',
    description:
      'Island contractors vary significantly in technical rigour. Before signing any quote, verify: Manual J load calculation completed at your design temperature, TSBC permits included in scope, CleanBC registration active, and AHRI certification numbers provided for the proposed equipment. If a contractor skips the load calc, get a second quote.',
    href: '/guides/heat-pump-onboarding-checklist',
    cta: 'Open the Checklist',
  },
];

const serviceAreaLinks = [
  { city: 'Victoria', slug: 'victoria', cityPage: '/bc/vancouver-island/victoria', hasRepair: true },
  { city: 'Nanaimo', slug: 'nanaimo', cityPage: '/bc/vancouver-island/nanaimo', hasRepair: true },
  { city: 'Courtenay', slug: 'courtenay', cityPage: '/bc/vancouver-island/courtenay', hasRepair: false },
  { city: 'Campbell River', slug: 'campbell-river', cityPage: '/bc/vancouver-island/campbell-river', hasRepair: false },
];

export default function VancouverIslandResourceCenter() {
  const breadcrumbItems = [
    { name: 'Home', url: 'https://heatpumplocator.com' },
    { name: 'Guides', url: 'https://heatpumplocator.com/guides' },
    { name: 'Vancouver Island', url: 'https://heatpumplocator.com/guides/vancouver-island' },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-10">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/guides" className="hover:text-blue-600">Guides</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">Vancouver Island</span>
        </nav>

        {/* Header */}
        <div className="mb-14">
          <span className="inline-block text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 px-3 py-1 rounded-full uppercase tracking-wide mb-5">
            Vancouver Island
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-5 leading-tight">
            Vancouver Island<br className="hidden sm:block" /> Heat Pump Resource Center
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl">
            Compliance, rebates, and technical guidance for BC&apos;s mildest heat pump climate — Victoria, Nanaimo, Courtenay, and beyond.
          </p>
        </div>

        {/* Main content + sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Feature cards — 2 of 3 columns */}
          <div className="lg:col-span-2 space-y-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Technical Guides &amp; Compliance
            </p>

            {featureCards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className={`block bg-white border border-gray-200 border-t-4 ${card.borderAccent} rounded-xl p-7 sm:p-9 hover:shadow-md transition-all duration-200 group`}
              >
                <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full mb-4 ${card.labelColor}`}>
                  {card.label}
                </span>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors">
                  {card.title}
                </h3>
                <p className="text-gray-500 leading-relaxed text-sm">
                  {card.description}
                </p>
                <div className="mt-5 flex items-center gap-1 text-blue-600 font-semibold text-sm group-hover:gap-2 transition-all">
                  {card.cta}
                  <span aria-hidden="true">→</span>
                </div>
              </Link>
            ))}

            {/* Supporting guides strip */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">More Vancouver Island Guides</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  href="/guides/heat-pump-bc-2026"
                  className="text-sm text-gray-900 hover:text-blue-700 font-semibold flex items-center gap-1.5 col-span-full border border-gray-200 rounded-lg px-3 py-2 bg-white"
                >
                  <span aria-hidden="true">→</span>
                  2026 Master Reference (EL levels, panel math, rebates, contractor verification)
                </Link>
                <Link
                  href="/guides/ductless-vs-central-heat-pumps-bc"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1.5"
                >
                  <span aria-hidden="true">→</span>
                  Ductless vs. Central Heat Pumps
                </Link>
                <Link
                  href="/guides/heat-pump-vs-electric-baseboard-bc"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1.5"
                >
                  <span aria-hidden="true">→</span>
                  Baseboard Replacement Guide
                </Link>
                <Link
                  href="/guides/heat-pump-sizing-guide-bc"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1.5"
                >
                  <span aria-hidden="true">→</span>
                  Heat Pump Sizing Guide (BC)
                </Link>
                <Link
                  href="/guides/heat-pump-home-assessment-checklist-bc"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1.5"
                >
                  <span aria-hidden="true">→</span>
                  Pre-Install Assessment Checklist
                </Link>
                <Link
                  href="/guides/bc-heat-pump-rebate-calculator"
                  className="text-sm text-green-700 hover:text-green-800 font-medium flex items-center gap-1.5"
                >
                  <span aria-hidden="true">→</span>
                  2026 Rebate Estimator (Calculator)
                </Link>
                <Link
                  href="/guides/heat-pump-roi-calculator"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1.5"
                >
                  <span aria-hidden="true">→</span>
                  ROI Calculator
                </Link>
                <Link
                  href="/guides/bc-step-code-city-tracker"
                  className="text-sm text-teal-700 hover:text-teal-800 font-medium flex items-center gap-1.5"
                >
                  <span aria-hidden="true">→</span>
                  Step Code City Tracker
                </Link>
                <Link
                  href="/guides/hybrid-heat-pump-boiler-systems"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1.5"
                >
                  <span aria-hidden="true">→</span>
                  Hybrid Heat Pump + Boiler Systems
                </Link>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">

            {/* Service Area */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5">
                Service Area
              </h2>
              <ul className="space-y-1">
                {serviceAreaLinks.map(({ city, slug, cityPage, hasRepair }) => (
                  <li key={slug}>
                    <div className="py-2.5 border-b border-gray-100 last:border-0">
                      <p className="text-sm font-semibold text-gray-800 mb-1">{city}</p>
                      <div className="flex flex-col gap-0.5">
                        {hasRepair && (
                          <Link
                            href={`/repair/${slug}`}
                            className="text-xs text-blue-600 hover:text-blue-700"
                          >
                            Heat pump repair →
                          </Link>
                        )}
                        <Link
                          href={cityPage}
                          className="text-xs text-gray-400 hover:text-gray-600"
                        >
                          City install guide →
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <Link
                href="/directory?city=Victoria"
                className="mt-5 block w-full text-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-colors"
              >
                Find Island Installers
              </Link>
            </div>

            {/* Climate callout */}
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-6">
              <p className="text-xs font-semibold text-teal-700 uppercase tracking-wide mb-2">
                Design Temperature
              </p>
              <p className="text-sm font-bold text-gray-900 mb-2">
                -3°C to -9°C
              </p>
              <p className="text-xs text-gray-600 leading-relaxed">
                Vancouver Island is one of Canada&apos;s warmest climates for heat pump installations. Standard ASHPs — not cold-climate units — are adequate for most Island locations. This also means smaller equipment sizing and lower installation costs than Interior BC.
              </p>
              <Link
                href="/guides/heat-pump-sizing-guide-bc"
                className="inline-block mt-3 text-xs font-semibold text-teal-700 hover:text-teal-900"
              >
                Sizing guide for mild climates →
              </Link>
            </div>

            {/* EL-4 callout */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">
                Compliance — New Builds
              </p>
              <p className="text-sm font-bold text-gray-900 mb-2">
                Victoria &amp; Saanich: EL-4
              </p>
              <p className="text-xs text-gray-600 leading-relaxed">
                New construction in Victoria and Saanich must meet EL-4 of the Zero Carbon Step Code — no combustion for space heating. Other Island municipalities vary. Confirm current requirements with your local AHJ before pulling a permit.
              </p>
              <Link
                href="/guides/bc-step-code-city-tracker"
                className="inline-block mt-3 text-xs font-semibold text-amber-700 hover:text-amber-900"
              >
                Check your municipality →
              </Link>
            </div>

            {/* Directory CTA */}
            <div className="bg-gray-900 rounded-xl p-6 text-white">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Verify Before You Hire
              </p>
              <p className="text-sm font-bold mb-2">Licensed BC Contractors</p>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                Every listing checked against Technical Safety BC. Filter by city, service type, and brand.
              </p>
              <Link
                href="/directory"
                className="block w-full text-center bg-white text-gray-900 text-sm font-semibold py-2.5 px-4 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Browse Directory
              </Link>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
