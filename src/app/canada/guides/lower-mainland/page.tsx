import Link from 'next/link';
import type { Metadata } from 'next';
import { BreadcrumbJsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Metro Vancouver & Lower Mainland Heat Pump Center | Canadian Heat Pump Hub',
  description:
    'Technical guides for Metro Vancouver heat pump installations. Strata approval roadmaps, 100A panel solutions, EPR compliance, and rebate navigation for Vancouver, Surrey, Burnaby, and Richmond homeowners.',
  alternates: {
    canonical: 'https://heatpumplocator.com/canada/guides/lower-mainland',
  },
  keywords: [
    'Lower Mainland heat pump guide',
    'Vancouver strata heat pump approval',
    '100 amp panel heat pump Vancouver',
    'BC Hydro heat pump rebate',
    'Surrey heat pump installer',
    'Burnaby heat pump condo',
    'EPR electrical planning report strata',
  ],
};

const featureCards = [
  {
    label: 'Compliance Guide',
    labelColor: 'bg-blue-100 text-blue-800 border border-blue-200',
    borderAccent: 'border-t-blue-600',
    title: 'Strata Approval Roadmap',
    description:
      'Metro Vancouver stratas with 5+ lots face a Dec 31, 2026 EPR filing deadline — and most are not started. This guide covers the Electrical Planning Report process, your Duty to Accommodate rights under the BC Human Rights Code, and a strata application template that gets approved.',
    href: '/guides/vancouver-strata-heat-pump-guide',
    cta: 'Read the Strata Guide',
  },
  {
    label: 'Technical Guide',
    labelColor: 'bg-slate-100 text-slate-700 border border-slate-200',
    borderAccent: 'border-t-slate-500',
    title: '100 Amp Panel Solutions',
    description:
      'Surrey and Vancouver homes on 100A service have two paths: a BC Hydro service upgrade (8–16 week lead time) or an Energy Management System using DCC-9/DCC-12 load controllers that lets a modern inverter heat pump share your existing capacity. Both paths work — this guide shows the numbers.',
    href: '/guides/100-amp-panel-heat-pump-vancouver',
    cta: 'Read the Panel Guide',
  },
  {
    label: 'Rebates 2026',
    labelColor: 'bg-blue-50 text-blue-700 border border-blue-200',
    borderAccent: 'border-t-blue-400',
    title: 'Rebate Navigator',
    description:
      'Stack CleanBC Better Homes (up to $6,000), the BC Hydro Condo Program (up to $2,250), and the Canada Greener Homes Loan ($40,000 interest-free) in the correct sequence. Application order matters — do not purchase equipment before reading this.',
    href: '/guides/how-to-claim-heat-pump-rebate-bc',
    cta: 'Read the Rebate Guide',
  },
  {
    label: 'Checklist',
    labelColor: 'bg-gray-100 text-gray-700 border border-gray-200',
    borderAccent: 'border-t-gray-500',
    title: 'Contractor Interview Checklist',
    description:
      'Use this before signing any quote. Covers Manual J load calculations, CEC Section 8 panel compliance, TSBC permits, CleanBC registration ID, and AHRI numbers. Ensures your 100A panel assessment is documented — and holds the contractor accountable.',
    href: '/guides/heat-pump-onboarding-checklist',
    cta: 'Open the Checklist',
  },
  {
    label: 'Compliance Guide',
    labelColor: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    borderAccent: 'border-t-emerald-600',
    title: 'BC Step Code & Zero Carbon Requirements',
    description:
      'Vancouver and Saanich mandate EL-4 compliance for all new construction — no fossil fuel combustion for space heating. This guide explains the four ZCSC Emission Levels, how TEDI affects heat pump sizing, and what the Zero Carbon mandate means for your strata or new build in 2026.',
    href: '/guides/bc-step-code-summary',
    cta: 'Read the Step Code Guide',
  },
];

const serviceAreaLinks = [
  { city: 'Vancouver', slug: 'vancouver', cityPage: '/bc/lower-mainland/vancouver' },
  { city: 'Surrey', slug: 'surrey', cityPage: '/bc/lower-mainland/surrey' },
  { city: 'Burnaby', slug: 'burnaby', cityPage: '/bc/lower-mainland/burnaby' },
  { city: 'Richmond', slug: 'richmond', cityPage: '/bc/lower-mainland/richmond' },
  { city: 'Coquitlam', slug: 'coquitlam', cityPage: '/bc/lower-mainland/coquitlam' },
];

export default function LowerMainlandResourceCenter() {
  const breadcrumbItems = [
    { name: 'Home', url: 'https://heatpumplocator.com' },
    { name: 'Guides', url: 'https://heatpumplocator.com/canada/guides' },
    { name: 'Lower Mainland', url: 'https://heatpumplocator.com/canada/guides/lower-mainland' },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-10">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/canada/guides" className="hover:text-blue-600">Guides</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">Lower Mainland</span>
        </nav>

        {/* Header */}
        <div className="mb-14">
          <span className="inline-block text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full uppercase tracking-wide mb-5">
            Metro Vancouver
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-5 leading-tight">
            Metro Vancouver &amp; Lower Mainland<br className="hidden sm:block" /> Heat Pump Center
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl">
            Clean, professional guidance for strata residents and homeowners with electrical capacity constraints.
          </p>
        </div>

        {/* Main content + sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* 3-card grid — takes 2 of 3 columns on desktop */}
          <div className="lg:col-span-2 space-y-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Technical Guides
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
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">More Lower Mainland Guides</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  href="/canada/guides/heat-pump-bc-2026"
                  className="text-sm text-gray-900 hover:text-blue-700 font-semibold flex items-center gap-1.5 col-span-full border border-gray-200 rounded-lg px-3 py-2 bg-white"
                >
                  <span aria-hidden="true">→</span>
                  2026 Master Reference (EL levels, panel math, rebates, contractor verification)
                </Link>
                <Link
                  href="/canada/guides/100-amp-panel-heat-pump-bc"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1.5"
                >
                  <span aria-hidden="true">→</span>
                  100A Panel Guide (All BC)
                </Link>
                <Link
                  href="/canada/guides/heat-pump-condo-strata-bc"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1.5"
                >
                  <span aria-hidden="true">→</span>
                  BC Strata Legal Framework
                </Link>
                <Link
                  href="/canada/guides/heat-pump-home-assessment-checklist-bc"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1.5"
                >
                  <span aria-hidden="true">→</span>
                  Pre-Install Assessment Checklist
                </Link>
                <Link
                  href="/canada/guides/heat-pump-vs-electric-baseboard-bc"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1.5"
                >
                  <span aria-hidden="true">→</span>
                  Baseboard Replacement Guide
                </Link>
                <Link
                  href="/canada/guides/bc-heat-pump-rebate-calculator"
                  className="text-sm text-green-700 hover:text-green-800 font-medium flex items-center gap-1.5"
                >
                  <span aria-hidden="true">→</span>
                  2026 Rebate Estimator (Calculator)
                </Link>
                <Link
                  href="/canada/guides/heat-pump-roi-calculator"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1.5"
                >
                  <span aria-hidden="true">→</span>
                  ROI Calculator
                </Link>
                <Link
                  href="/canada/guides/bc-step-code-city-tracker"
                  className="text-sm text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1.5"
                >
                  <span aria-hidden="true">→</span>
                  Step Code City Tracker
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
                {serviceAreaLinks.map(({ city, slug, cityPage }) => (
                  <li key={slug}>
                    <div className="py-2.5 border-b border-gray-100 last:border-0">
                      <p className="text-sm font-semibold text-gray-800 mb-1">{city}</p>
                      <div className="flex flex-col gap-0.5">
                        <Link
                          href={`/repair/${slug}`}
                          className="text-xs text-blue-600 hover:text-blue-700"
                        >
                          Heat pump repair →
                        </Link>
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
                href="/directory?city=Vancouver"
                className="mt-5 block w-full text-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-colors"
              >
                Find Metro Vancouver Installers
              </Link>
            </div>

            {/* EPR deadline callout */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">
                Compliance Deadline
              </p>
              <p className="text-sm font-bold text-gray-900 mb-2">
                EPR Filing — Dec 31, 2026
              </p>
              <p className="text-xs text-gray-600 leading-relaxed">
                Metro Vancouver stratas with 5+ lots must obtain an Electrical Planning Report. Commission yours now — EPR firms have finite capacity and the queue will grow as the deadline approaches.
              </p>
              <Link
                href="/canada/guides/vancouver-strata-heat-pump-guide#the-epr-clock"
                className="inline-block mt-3 text-xs font-semibold text-amber-700 hover:text-amber-900"
              >
                What is an EPR? →
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
                href="/canada/directory"
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
