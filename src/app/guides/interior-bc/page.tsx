import Link from 'next/link';
import type { Metadata } from 'next';
import { BreadcrumbJsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Thompson-Okanagan & Interior BC Heat Pump Resource Center | Canadian Heat Pump Hub',
  description:
    'Technical heat pump guidance for BC Interior homeowners. Cold-climate ASHP sizing, dual-fuel hybrid systems, and balance point planning for Kelowna, Kamloops, Vernon, and Penticton.',
  alternates: {
    canonical: 'https://canadianheatpumphub.ca/guides/interior-bc',
  },
  keywords: [
    'Interior BC heat pump guide',
    'Kelowna heat pump sizing',
    'Kamloops cold climate heat pump',
    'ASHP balance point BC Interior',
    'dual fuel hybrid heat pump Interior BC',
    'Thompson Okanagan HVAC',
    'Vernon heat pump installation',
  ],
};

const featureCards = [
  {
    label: 'Case Study',
    labelColor: 'bg-slate-100 text-slate-700 border border-slate-200',
    borderAccent: 'border-t-slate-600',
    title: 'The Kettle Valley Ghost',
    description:
      'A commercial facility in the Interior ran a heat pump system that failed every January. The cause was not the equipment — it was a 31 kW ghost load that had been invisible for 11 years. What happens when mechanicals fail at -15°C and no one knows why.',
    href: '/case-studies/kettle-valley-ghost',
    cta: 'Read the Case Study',
  },
  {
    label: 'Technical Guide',
    labelColor: 'bg-blue-100 text-blue-800 border border-blue-200',
    borderAccent: 'border-t-blue-600',
    title: 'Dual-Fuel & Hybrid Logic',
    description:
      'In the Interior, an all-electric heat pump hits its balance point between -15°C and -20°C — right when the coldest nights occur. A gas backup stage is not a compromise; it is a technical response to the climate. This guide explains when hybrid is the right call and when it is not.',
    href: '/guides/hybrid-heat-pump-boiler-systems',
    cta: 'Read the Hybrid Guide',
  },
  {
    label: 'Sizing Guide',
    labelColor: 'bg-blue-50 text-blue-700 border border-blue-200',
    borderAccent: 'border-t-blue-400',
    title: 'ASHP Balance Points: -15°C vs -5°C',
    description:
      'Metro Vancouver contractors spec equipment for -5°C design temperatures. Interior contractors spec for -15°C to -22°C. The same unit performs completely differently across these two climates — this guide covers what cold-climate rating actually means, which brands maintain capacity at depth, and how to read the spec sheets.',
    href: '/guides/best-cold-climate-heat-pump-bc-2026',
    cta: 'Read the Cold Climate Guide',
  },
  {
    label: 'Checklist',
    labelColor: 'bg-gray-100 text-gray-700 border border-gray-200',
    borderAccent: 'border-t-gray-500',
    title: 'Okanagan Install Checklist',
    description:
      'Before signing any Interior BC quote, verify these 22 points. Includes design temperature confirmation (-20°C for Kelowna, -22°C for Kamloops), balance point documentation, cold-climate AHRI reference numbers, TSBC permits, and CleanBC registration. If your contractor cannot answer these questions, get a second quote.',
    href: '/guides/heat-pump-onboarding-checklist',
    cta: 'Open the Checklist',
  },
  {
    label: 'Compliance Guide',
    labelColor: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    borderAccent: 'border-t-emerald-600',
    title: 'BC Step Code & Zero Carbon Requirements',
    description:
      'Interior BC municipalities currently range from EL-1 (measure only) to EL-3. New construction in Kelowna and Kamloops must navigate TEDI requirements and GHG limits that are tightening every year. Understanding which Emission Level applies to your project determines whether a dual-fuel hybrid passes — or fails — compliance review.',
    href: '/guides/bc-step-code-summary',
    cta: 'Read the Step Code Guide',
  },
];

const serviceAreaLinks = [
  { city: 'Kelowna', slug: 'kelowna', cityPage: '/bc/interior/kelowna', hasRepair: true },
  { city: 'Kamloops', slug: 'kamloops', cityPage: '/bc/interior/kamloops', hasRepair: true },
  { city: 'Vernon', slug: 'vernon', cityPage: '/bc/interior/vernon', hasRepair: true },
  { city: 'Penticton', slug: 'penticton', cityPage: '/bc/interior/penticton', hasRepair: false },
];

export default function InteriorBCResourceCenter() {
  const breadcrumbItems = [
    { name: 'Home', url: 'https://canadianheatpumphub.ca' },
    { name: 'Guides', url: 'https://canadianheatpumphub.ca/guides' },
    { name: 'Interior BC', url: 'https://canadianheatpumphub.ca/guides/interior-bc' },
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
          <span className="text-gray-700">Interior BC</span>
        </nav>

        {/* Header */}
        <div className="mb-14">
          <span className="inline-block text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1 rounded-full uppercase tracking-wide mb-5">
            Thompson-Okanagan &amp; Interior
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-5 leading-tight">
            Thompson-Okanagan &amp; Interior BC<br className="hidden sm:block" /> Resource Center
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl">
            Technical guidance for high-performance heating in sub&#8209;15°C climates.
          </p>
        </div>

        {/* Main content + sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* 3-card grid */}
          <div className="lg:col-span-2 space-y-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Technical Guides &amp; Case Studies
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
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">More Interior Guides</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  href="/guides/fujitsu-vs-mitsubishi-cold-climate"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1.5"
                >
                  <span aria-hidden="true">→</span>
                  Fujitsu vs Mitsubishi: Cold Climate
                </Link>
                <Link
                  href="/guides/heat-pump-sizing-guide-bc"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1.5"
                >
                  <span aria-hidden="true">→</span>
                  Heat Pump Sizing Guide (BC)
                </Link>
                <Link
                  href="/guides/oil-furnace-heat-pump-conversion-bc"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1.5"
                >
                  <span aria-hidden="true">→</span>
                  Oil Furnace Conversion Guide
                </Link>
                <Link
                  href="/guides/how-to-claim-heat-pump-rebate-bc"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1.5"
                >
                  <span aria-hidden="true">→</span>
                  BC Rebate Navigator
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
                href="/directory?city=Kelowna"
                className="mt-5 block w-full text-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-colors"
              >
                Find Interior BC Installers
              </Link>
            </div>

            {/* Cold climate design temp callout */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
                Design Temperature
              </p>
              <p className="text-sm font-bold text-gray-900 mb-2">
                -15°C to -22°C
              </p>
              <p className="text-xs text-gray-600 leading-relaxed">
                Interior BC design temperatures are 10–17°C colder than Metro Vancouver. Equipment specified for the coast will underperform — or fail entirely — on the coldest Interior nights.
              </p>
              <Link
                href="/guides/best-cold-climate-heat-pump-bc-2026"
                className="inline-block mt-3 text-xs font-semibold text-slate-700 hover:text-slate-900"
              >
                Cold-climate equipment guide →
              </Link>
            </div>

            {/* Directory CTA */}
            <div className="bg-gray-900 rounded-xl p-6 text-white">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Verify Before You Hire
              </p>
              <p className="text-sm font-bold mb-2">Licensed BC Contractors</p>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                Every listing checked against Technical Safety BC. Filter by city, service type, and specialty.
              </p>
              <Link
                href="/directory?specialties=cold_climate_pro"
                className="block w-full text-center bg-white text-gray-900 text-sm font-semibold py-2.5 px-4 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Browse Cold Climate Specialists
              </Link>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
