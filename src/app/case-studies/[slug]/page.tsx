import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { BreadcrumbJsonLd, TechnicalArticleJsonLd } from '@/components/JsonLd';

const caseStudies: Record<string, {
  title: string;
  description: string;
  keywords: string[];
  readTime: string;
  datePublished: string;
  dateModified: string;
}> = {
  'kettle-valley-ghost': {
    title: 'The Kettle Valley Ghost: A Post-Mortem of All-Electric Mechanical Failure',
    description: 'Technical audit of compound mechanical failures in high-performance all-electric BC homes. Covers dew-point condensation on polished concrete slabs, unmodelled 31 kW makeup air unit loads, and ASHP balance point failures at the -15°C Vernon/Kelowna design temperature.',
    keywords: [
      'Okanagan heat pump failure',
      '31kW MUA load',
      'ASHP balance point BC',
      'BC mechanical audit',
      'makeup air unit calculation',
      'dew point concrete slab',
      'heat pump sizing Kelowna',
      'all-electric mechanical failure BC',
    ],
    readTime: '14 min read',
    datePublished: '2026-02-23',
    dateModified: '2026-02-23',
  },
};

async function importCaseStudy(slug: string) {
  switch (slug) {
    case 'kettle-valley-ghost':
      return (await import('@/content/case-studies/kettle-valley-ghost.mdx')).default;
    default:
      return null;
  }
}

export async function generateStaticParams() {
  return Object.keys(caseStudies).map(slug => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const meta = caseStudies[slug];
  if (!meta) return { title: 'Not Found' };

  return {
    title: `${meta.title} | Canadian Heat Pump Hub`,
    description: meta.description,
    keywords: meta.keywords,
    alternates: {
      canonical: `https://canadianheatpumphub.ca/case-studies/${slug}`,
    },
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const meta = caseStudies[slug];

  if (!meta) notFound();

  const Content = await importCaseStudy(slug);
  if (!Content) notFound();

  const breadcrumbItems = [
    { name: 'Home', url: 'https://canadianheatpumphub.ca' },
    { name: 'Case Studies', url: 'https://canadianheatpumphub.ca/case-studies' },
    { name: meta.title, url: `https://canadianheatpumphub.ca/case-studies/${slug}` },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <TechnicalArticleJsonLd
        title={meta.title}
        description={meta.description}
        slug={slug}
        datePublished={meta.datePublished}
        dateModified={meta.dateModified}
        keywords={meta.keywords}
      />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary-600">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/case-studies" className="hover:text-primary-600">Case Studies</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">{meta.title}</span>
        </nav>

        {/* Audit classification header */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-xs font-semibold bg-gray-900 text-white px-3 py-1 rounded-full uppercase tracking-wide">
            Technical Audit
          </span>
          <span className="text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200 px-3 py-1 rounded-full">
            Okanagan Region
          </span>
          <span className="text-xs text-gray-500">{meta.readTime}</span>
          <span className="text-xs text-gray-400">
            Published {new Date(meta.datePublished).toLocaleDateString('en-CA', {
              year: 'numeric', month: 'long', day: 'numeric',
            })}
          </span>
        </div>

        {/* Credential strip */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg px-5 py-3 mb-8 text-sm text-gray-600">
          Audit observations by a{' '}
          <span className="font-semibold text-gray-900">Red Seal Refrigeration Mechanic</span>
          {' '}and{' '}
          <span className="font-semibold text-gray-900">Class A Gas Fitter</span>.
          This document records field observations. It does not constitute engineering advice or a professional compliance report.
        </div>

        <div className="prose prose-lg">
          <Content />
        </div>

        {/* Related resources */}
        <div className="mt-12 bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Related Technical Resources</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Link href="/guides/heat-pump-sizing-guide-bc" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2 text-sm">
              <span>→</span> Heat Pump Sizing Guide for BC
            </Link>
            <Link href="/guides/best-cold-climate-heat-pump-bc-2026" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2 text-sm">
              <span>→</span> Cold Climate Heat Pump Selection
            </Link>
            <Link href="/guides/heat-pump-home-assessment-checklist-bc" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2 text-sm">
              <span>→</span> Pre-Install Assessment Checklist
            </Link>
            <Link href="/repair/kelowna" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2 text-sm">
              <span>→</span> Kelowna Heat Pump Repair Guide
            </Link>
            <Link href="/repair/vernon" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2 text-sm">
              <span>→</span> Vernon Heat Pump Repair Guide
            </Link>
            <Link href="/directory" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2 text-sm">
              <span>→</span> Find Licensed BC Contractors
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
          <Link href="/case-studies" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
            ← All Case Studies
          </Link>
          <Link href="/contact" className="text-sm text-gray-500 hover:text-gray-700">
            Submit an audit inquiry →
          </Link>
        </div>
      </article>
    </>
  );
}
