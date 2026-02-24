import Link from 'next/link';
import type { Metadata } from 'next';
import { BreadcrumbJsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Lower Mainland Heat Pump Resource Center | Canadian Heat Pump Hub',
  description:
    'Technical guides for Metro Vancouver heat pump installations. Strata approval roadmaps, 100A panel solutions, EPR compliance, and rebate navigation for Vancouver, Surrey, Burnaby, and Richmond homeowners.',
  alternates: {
    canonical: 'https://canadianheatpumphub.ca/guides/lower-mainland',
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
    borderAccent: 'border-t-blue-500',
    title: 'Strata & Condo Approval',
    description:
      'Navigate the Dec 31, 2026 EPR deadline, invoke your Duty to Accommodate rights under the BC Human Rights Code, and submit a strata application that gets approved. Includes rebate table and a realistic 6–12 week timeline.',
    href: '/guides/vancouver-strata-heat-pump-guide',
    cta: 'Read the Strata Guide',
  },
  {
    label: 'Technical Guide',
    labelColor: 'bg-amber-100 text-amber-800 border border-amber-200',
    borderAccent: 'border-t-amber-500',
    title: '100 Amp Panel Solutions',
    description:
      'Older Surrey and Vancouver homes on 100A service: understand BC Hydro service upgrade costs, Energy Management Systems, and why inverter heat pumps change the load math. Includes a contractor verification checklist.',
    href: '/guides/100-amp-panel-heat-pump-vancouver',
    cta: 'Read the Panel Guide',
  },
  {
    label: 'Rebates 2026',
    labelColor: 'bg-green-100 text-green-800 border border-green-200',
    borderAccent: 'border-t-green-500',
    title: 'Rebate Navigator',
    description:
      'Stack CleanBC Better Homes (up to $6,000), the BC Hydro Condo Program (up to $2,250), and the Canada Greener Homes Loan ($40,000 interest-free) in the correct sequence. Do not purchase equipment before reading this.',
    href: '/guides/how-to-claim-heat-pump-rebate-bc',
    cta: 'Read the Rebate Guide',
  },
];

const quickLinks = [
  { city: 'Vancouver', slug: 'vancouver', cityPage: '/bc/lower-mainland/vancouver' },
  { city: 'Surrey', slug: 'surrey', cityPage: '/bc/lower-mainland/surrey' },
  { city: 'Burnaby', slug: 'burnaby', cityPage: '/bc/lower-mainland/burnaby' },
  { city: 'Richmond', slug: 'richmond', cityPage: '/bc/lower-mainland/richmond' },
];

export default function LowerMainlandResourceCenter() {
  const breadcrumbItems = [
    { name: 'Home', url: 'https://canadianheatpumphub.ca' },
    { name: 'Guides', url: 'https://canadianheatpumphub.ca/guides' },
    { name: 'Lower Mainland', url: 'https://canadianheatpumphub.ca/guides/lower-mainland' },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-primary-600">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/guides" className="hover:text-primary-600">Guides</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">Lower Mainland</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-semibold bg-primary-50 text-primary-700 border border-primary-200 px-3 py-1 rounded-full uppercase tracking-wide mb-4">
            Metro Vancouver
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Lower Mainland Heat Pump<br className="hidden sm:block" /> Resource Center
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Technical guides written for the specific conditions of Vancouver, Surrey, Burnaby, Richmond, and Coquitlam — strata buildings, older panels, and Metro-specific rebate programs.
          </p>
        </div>

        {/* Main content + sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* 3-card grid — takes 2 of 3 columns on desktop */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest">
              Technical Guides
            </h2>

            {featureCards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className={`block bg-white border border-gray-200 border-t-4 ${card.borderAccent} rounded-xl p-6 sm:p-8 hover:shadow-lg transition-all duration-200 group`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full mb-3 ${card.labelColor}`}>
                      {card.label}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-700 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>
                <div className="mt-5 flex items-center gap-1 text-primary-600 font-semibold text-sm group-hover:gap-2 transition-all">
                  {card.cta}
                  <span aria-hidden="true">→</span>
                </div>
              </Link>
            ))}

            {/* Supporting guides strip */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">More Lower Mainland Guides</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  href="/guides/100-amp-panel-heat-pump-bc"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1.5"
                >
                  <span aria-hidden="true">→</span>
                  100A Panel Guide (All BC)
                </Link>
                <Link
                  href="/guides/heat-pump-condo-strata-bc"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1.5"
                >
                  <span aria-hidden="true">→</span>
                  BC Strata Legal Framework
                </Link>
                <Link
                  href="/guides/heat-pump-home-assessment-checklist-bc"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1.5"
                >
                  <span aria-hidden="true">→</span>
                  Pre-Install Assessment Checklist
                </Link>
                <Link
                  href="/guides/heat-pump-vs-electric-baseboard-bc"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1.5"
                >
                  <span aria-hidden="true">→</span>
                  Baseboard Replacement Guide
                </Link>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">

            {/* Quick Links — city repair pages */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">
                Quick Links
              </h2>
              <ul className="space-y-1">
                {quickLinks.map(({ city, slug, cityPage }) => (
                  <li key={slug}>
                    <div className="py-2 border-b border-gray-100 last:border-0">
                      <p className="text-sm font-semibold text-gray-800 mb-1">{city}</p>
                      <div className="flex flex-col gap-0.5">
                        <Link
                          href={`/repair/${slug}`}
                          className="text-xs text-primary-600 hover:text-primary-700"
                        >
                          Heat pump repair →
                        </Link>
                        <Link
                          href={cityPage}
                          className="text-xs text-gray-500 hover:text-gray-700"
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
                className="mt-4 block w-full text-center bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-colors"
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
                href="/guides/vancouver-strata-heat-pump-guide#the-epr-clock"
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
