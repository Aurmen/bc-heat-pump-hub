import type { Metadata } from 'next';
import Link from 'next/link';
import { BreadcrumbJsonLd, ArticleJsonLd } from '@/components/JsonLd';
import ArticleMeta from '@/components/ArticleMeta';
import GuideContent from '@/content/guides/heat-pump-bc.mdx';

export const metadata: Metadata = {
  title: 'BC Heat Pump Guide 2026: The Complete Homeowner Reference',
  description:
    'Mechanical facts, rebate stacking rules, TSBC verification, HSPF2 thresholds, and balance point sizing for BC homeowners. Covers all climate zones from Victoria to Prince George.',
  alternates: {
    canonical: 'https://canadianheatpumphub.ca/guides/heat-pump-bc',
  },
  openGraph: {
    title: 'BC Heat Pump Guide 2026: The Complete Homeowner Reference',
    description:
      'Everything BC homeowners need to know about heat pumps in 2026 — rebates, sizing, TSBC verification, and the 5 mechanical facts that resolve the most common anxieties.',
    url: 'https://canadianheatpumphub.ca/guides/heat-pump-bc',
  },
};

const MECHANICAL_FACTS = [
  { id: 'fact-1', label: 'Cold-Climate Units Work Below −30°C' },
  { id: 'fact-2', label: 'Balance Point Determines Backup Need' },
  { id: 'fact-3', label: 'HSPF2 ≥ 9.5 for Top Rebate Tier' },
  { id: 'fact-4', label: 'Aux Heat Cycling Is Normal' },
  { id: 'fact-5', label: 'Manual J Is Legally Required' },
];

const CITY_LINKS = [
  { name: 'Vancouver', href: '/bc/lower-mainland/vancouver', note: 'EL-4 mandate' },
  { name: 'Victoria', href: '/bc/vancouver-island/victoria', note: 'Mildest climate in Canada' },
  { name: 'Kelowna', href: '/bc/interior/kelowna', note: 'Cold-climate zone' },
];

const breadcrumbItems = [
  { name: 'Home', url: 'https://canadianheatpumphub.ca' },
  { name: 'Guides', url: 'https://canadianheatpumphub.ca/guides' },
  { name: 'BC Heat Pump Guide 2026', url: 'https://canadianheatpumphub.ca/guides/heat-pump-bc' },
];

export default function HeatPumpBCGuidePage() {
  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <ArticleJsonLd
        title="BC Heat Pump Guide 2026: The Complete Homeowner Reference"
        description="Mechanical facts, rebate stacking rules, TSBC verification, HSPF2 thresholds, and balance point sizing for BC homeowners."
        slug="heat-pump-bc"
        datePublished="2026-02-28"
        dateModified="2026-02-28"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary-600">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/guides" className="hover:text-primary-600">Guides</Link>
          <span className="mx-2">/</span>
          <span>BC Heat Pump Guide 2026</span>
        </nav>

        {/* Mobile: Jump-to TOC */}
        <div className="lg:hidden mb-8 bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Jump to: 5 Mechanical Facts
          </p>
          <ol className="space-y-2">
            {MECHANICAL_FACTS.map((fact, i) => (
              <li key={fact.id}>
                <a
                  href={`#${fact.id}`}
                  className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
                >
                  {i + 1}. {fact.label}
                </a>
              </li>
            ))}
          </ol>
        </div>

        {/* Two-column layout: content + sidebar */}
        <div className="lg:grid lg:grid-cols-[1fr_272px] lg:gap-12 lg:items-start">

          {/* ── Main content ── */}
          <article>
            <ArticleMeta lastUpdated="2026-02-28" readTime="14 min read" />
            <div className="prose prose-lg max-w-none">
              <GuideContent />
            </div>

            {/* Related resources */}
            <div className="mt-12 bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Related Resources</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { href: '/guides/how-to-claim-heat-pump-rebate-bc', label: 'How to Claim BC Rebates' },
                  { href: '/guides/heat-pump-onboarding-checklist', label: 'Contractor Onboarding Checklist' },
                  { href: '/guides/bc-step-code-city-tracker', label: 'BC Step Code City Tracker' },
                  { href: '/guides/best-cold-climate-heat-pump-bc-2026', label: 'Best Cold-Climate Heat Pumps 2026' },
                  { href: '/directory', label: 'Find Installers' },
                  { href: '/guides/heat-pump-sizing-guide-bc', label: 'Heat Pump Sizing Guide' },
                ].map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2 text-sm"
                  >
                    <span aria-hidden="true">→</span> {label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <Link href="/guides" className="text-primary-600 hover:text-primary-700 font-medium">
                ← Back to All Guides
              </Link>
            </div>
          </article>

          {/* ── Sticky sidebar ── */}
          <aside className="hidden lg:block">
            <div className="sticky top-8 space-y-5">

              {/* Quick Links — city pages */}
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
                  Quick Links
                </p>
                <ul className="space-y-3">
                  {CITY_LINKS.map(({ name, href, note }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className="flex flex-col hover:text-primary-600 group"
                      >
                        <span className="font-semibold text-gray-900 group-hover:text-primary-600 text-sm">
                          {name} Installers →
                        </span>
                        <span className="text-xs text-gray-500 mt-0.5">{note}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Link
                    href="/directory"
                    className="text-sm font-semibold text-primary-600 hover:text-primary-700"
                  >
                    Browse all BC installers →
                  </Link>
                </div>
              </div>

              {/* TOC — 5 Mechanical Facts */}
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
                  5 Mechanical Facts
                </p>
                <ol className="space-y-3">
                  {MECHANICAL_FACTS.map((fact, i) => (
                    <li key={fact.id} className="flex gap-2.5">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <a
                        href={`#${fact.id}`}
                        className="text-sm text-gray-700 hover:text-primary-600 hover:underline leading-snug"
                      >
                        {fact.label}
                      </a>
                    </li>
                  ))}
                </ol>
              </div>

              {/* CTA */}
              <div className="bg-primary-50 border border-primary-200 rounded-xl p-5">
                <p className="text-sm font-semibold text-primary-900 mb-2">
                  Ready to get quotes?
                </p>
                <p className="text-xs text-primary-700 mb-4 leading-relaxed">
                  Connect with TSBC-verified BC installers. Free, no-obligation inquiry.
                </p>
                <Link
                  href="/connect"
                  className="block text-center bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
                >
                  Get Contractor Quotes
                </Link>
                <p className="text-xs text-primary-600 mt-3 text-center">
                  This inquiry is a request for information. Final technical verification and site visits are required by a licensed contractor.
                </p>
              </div>

            </div>
          </aside>

        </div>
      </div>
    </>
  );
}
