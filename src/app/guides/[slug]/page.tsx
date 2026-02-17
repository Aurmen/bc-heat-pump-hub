import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { BreadcrumbJsonLd } from '@/components/JsonLd';
import ArticleMeta from '@/components/ArticleMeta';

const guides = [
  'heat-pump-vs-boiler-bc',
  'air-to-water-heat-pumps-bc',
  'hybrid-heat-pump-boiler-systems',
  'cost-heat-pump-installation-bc',
  'boiler-replacement-cost-bc',
  'heat-pump-sizing-guide-bc',
  'ductless-vs-central-heat-pumps-bc',
  'understanding-heat-pump-ratings',
];

export async function generateStaticParams() {
  return guides.map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  const titles: Record<string, string> = {
    'heat-pump-vs-boiler-bc': 'Heat Pumps vs. Boilers in BC',
    'air-to-water-heat-pumps-bc': 'Air-to-Water Heat Pumps in BC',
    'hybrid-heat-pump-boiler-systems': 'Hybrid Heat Pump + Boiler Systems',
    'cost-heat-pump-installation-bc': 'Heat Pump Installation Costs in BC',
    'boiler-replacement-cost-bc': 'Boiler Replacement Costs in BC',
    'heat-pump-sizing-guide-bc': 'Heat Pump Sizing Guide for BC',
    'ductless-vs-central-heat-pumps-bc': 'Ductless vs. Central Heat Pumps',
    'understanding-heat-pump-ratings': 'Understanding SEER, HSPF & COP Ratings',
  };

  return {
    title: titles[slug] || 'Guide',
    description: `Comprehensive guide on ${titles[slug]?.toLowerCase() || 'heating systems'} for BC homeowners.`,
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (!guides.includes(slug)) {
    notFound();
  }

  // Dynamic import of MDX content
  let Content;
  try {
    Content = (await import(`@/content/guides/${slug}.mdx`)).default;
  } catch {
    notFound();
  }

  const breadcrumbItems = [
    { name: 'Home', url: 'https://canadianheatpumphub.ca' },
    { name: 'Guides', url: 'https://canadianheatpumphub.ca/guides' },
    { name: slug, url: `https://canadianheatpumphub.ca/guides/${slug}` },
  ];

  const titles: Record<string, string> = {
    'heat-pump-vs-boiler-bc': 'Heat Pumps vs. Boilers in BC',
    'air-to-water-heat-pumps-bc': 'Air-to-Water Heat Pumps in BC',
    'hybrid-heat-pump-boiler-systems': 'Hybrid Heat Pump + Boiler Systems',
    'cost-heat-pump-installation-bc': 'Heat Pump Installation Costs in BC',
    'boiler-replacement-cost-bc': 'Boiler Replacement Costs in BC',
    'heat-pump-sizing-guide-bc': 'Heat Pump Sizing Guide for BC',
    'ductless-vs-central-heat-pumps-bc': 'Ductless vs. Central Heat Pumps',
    'understanding-heat-pump-ratings': 'Understanding SEER, HSPF & COP Ratings',
  };

  const readTimes: Record<string, string> = {
    'heat-pump-vs-boiler-bc': '10 min read',
    'air-to-water-heat-pumps-bc': '12 min read',
    'hybrid-heat-pump-boiler-systems': '11 min read',
    'cost-heat-pump-installation-bc': '14 min read',
    'boiler-replacement-cost-bc': '13 min read',
    'heat-pump-sizing-guide-bc': '16 min read',
    'ductless-vs-central-heat-pumps-bc': '15 min read',
    'understanding-heat-pump-ratings': '13 min read',
  };

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary-600">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/guides" className="hover:text-primary-600">Guides</Link>
          <span className="mx-2">/</span>
          <span>{titles[slug] || slug}</span>
        </nav>

        <ArticleMeta
          lastUpdated="2026-02-16"
          readTime={readTimes[slug] || '10 min read'}
        />

        <div className="prose prose-lg">
          <Content />
        </div>

        {/* Related Resources */}
        <div className="mt-12 bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Related Resources</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/calculator" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2">
              <span>→</span> ROI Calculator
            </Link>
            <Link href="/rebates" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2">
              <span>→</span> 2026 Rebates Guide
            </Link>
            <Link href="/brands" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2">
              <span>→</span> Brand Comparison
            </Link>
            <Link href="/directory" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2">
              <span>→</span> Find Installers
            </Link>
            <Link href="/service" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2">
              <span>→</span> Service & Repair Guide
            </Link>
            <Link href="/faq" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2">
              <span>→</span> FAQ
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <Link
            href="/guides"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Back to All Guides
          </Link>
        </div>
      </article>
    </>
  );
}
