import type { Metadata } from 'next';
import Link from 'next/link';
import { BreadcrumbJsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'BC Heat Pump Case Studies & Technical Audits',
  description: 'In-depth technical case studies on heat pump installations, mechanical failures, and system audits in British Columbia. Written by a Red Seal Refrigeration Mechanic and Class A Gas Fitter.',
  alternates: {
    canonical: 'https://canadianheatpumphub.ca/case-studies',
  },
};

const caseStudies = [
  {
    slug: 'kettle-valley-ghost',
    title: 'The Kettle Valley Ghost: A Post-Mortem of All-Electric Mechanical Failure',
    description: 'Technical audit of compound mechanical failures in high-performance all-electric BC homes. Covers dew-point condensation on polished concrete slabs, unmodelled 31 kW makeup air unit loads, and ASHP balance point failures at the -15°C Vernon/Kelowna design temperature.',
    readTime: '14 min read',
    date: 'February 23, 2026',
    tags: ['Okanagan', 'All-Electric', 'Technical Audit', 'Interior BC'],
  },
];

const breadcrumbItems = [
  { name: 'Home', url: 'https://canadianheatpumphub.ca' },
  { name: 'Case Studies', url: 'https://canadianheatpumphub.ca/case-studies' },
];

export default function CaseStudiesPage() {
  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary-600">Home</Link>
          <span className="mx-2">/</span>
          <span>Case Studies</span>
        </nav>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          BC Heat Pump Case Studies
        </h1>
        <p className="text-xl text-gray-600 mb-10">
          Technical audits and post-mortems on real BC heating installations — written by a Red Seal Refrigeration Mechanic and Class A Gas Fitter.
        </p>

        <div className="space-y-6">
          {caseStudies.map(study => (
            <Link
              key={study.slug}
              href={`/case-studies/${study.slug}`}
              className="block bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-primary-300 transition-all"
            >
              <div className="flex flex-wrap gap-2 mb-3">
                {study.tags.map(tag => (
                  <span key={tag} className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full font-medium">
                    {tag}
                  </span>
                ))}
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{study.title}</h2>
              <p className="text-gray-600 text-sm mb-3 leading-relaxed">{study.description}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>{study.date}</span>
                <span>·</span>
                <span>{study.readTime}</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 bg-blue-50 border-l-4 border-primary-500 p-6 rounded-r-lg">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">About these case studies:</span> All technical audits are based on real BC installations and written from a mechanical compliance perspective. They are intended for contractors, building designers, and sophisticated homeowners — not as general consumer advice.
          </p>
        </div>
      </div>
    </>
  );
}
