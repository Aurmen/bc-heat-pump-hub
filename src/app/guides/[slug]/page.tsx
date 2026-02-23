import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { BreadcrumbJsonLd, ArticleJsonLd } from '@/components/JsonLd';
import ArticleMeta from '@/components/ArticleMeta';

const guides = [
  'types-of-heat-pumps-bc',
  'how-heat-pumps-work',
  'heat-pump-installation-process-bc',
  'heat-pump-vs-boiler-bc',
  'air-to-water-heat-pumps-bc',
  'hybrid-heat-pump-boiler-systems',
  'cost-heat-pump-installation-bc',
  'boiler-replacement-cost-bc',
  'heat-pump-sizing-guide-bc',
  'ductless-vs-central-heat-pumps-bc',
  'understanding-heat-pump-ratings',
];

// Function to import guide content based on slug
async function importGuideContent(slug: string) {
  switch (slug) {
    case 'types-of-heat-pumps-bc':
      return (await import('@/content/guides/types-of-heat-pumps-bc.mdx')).default;
    case 'how-heat-pumps-work':
      return (await import('@/content/guides/how-heat-pumps-work.mdx')).default;
    case 'heat-pump-installation-process-bc':
      return (await import('@/content/guides/heat-pump-installation-process-bc.mdx')).default;
    case 'heat-pump-vs-boiler-bc':
      return (await import('@/content/guides/heat-pump-vs-boiler-bc.mdx')).default;
    case 'air-to-water-heat-pumps-bc':
      return (await import('@/content/guides/air-to-water-heat-pumps-bc.mdx')).default;
    case 'hybrid-heat-pump-boiler-systems':
      return (await import('@/content/guides/hybrid-heat-pump-boiler-systems.mdx')).default;
    case 'cost-heat-pump-installation-bc':
      return (await import('@/content/guides/cost-heat-pump-installation-bc.mdx')).default;
    case 'boiler-replacement-cost-bc':
      return (await import('@/content/guides/boiler-replacement-cost-bc.mdx')).default;
    case 'heat-pump-sizing-guide-bc':
      return (await import('@/content/guides/heat-pump-sizing-guide-bc.mdx')).default;
    case 'ductless-vs-central-heat-pumps-bc':
      return (await import('@/content/guides/ductless-vs-central-heat-pumps-bc.mdx')).default;
    case 'understanding-heat-pump-ratings':
      return (await import('@/content/guides/understanding-heat-pump-ratings.mdx')).default;
    default:
      return null;
  }
}

export async function generateStaticParams() {
  return guides.map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  const titles: Record<string, string> = {
    'types-of-heat-pumps-bc': 'Types of Heat Pumps in BC',
    'how-heat-pumps-work': 'How Heat Pumps Work',
    'heat-pump-installation-process-bc': 'Heat Pump Installation Process in BC',
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
    alternates: { canonical: `https://canadianheatpumphub.ca/guides/${slug}` },
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (!guides.includes(slug)) {
    notFound();
  }

  // Import the guide content using switch statement
  const Content = await importGuideContent(slug);

  if (!Content) {
    notFound();
  }

  const breadcrumbItems = [
    { name: 'Home', url: 'https://canadianheatpumphub.ca' },
    { name: 'Guides', url: 'https://canadianheatpumphub.ca/guides' },
    { name: slug, url: `https://canadianheatpumphub.ca/guides/${slug}` },
  ];

  const titles: Record<string, string> = {
    'types-of-heat-pumps-bc': 'Types of Heat Pumps in BC',
    'how-heat-pumps-work': 'How Heat Pumps Work',
    'heat-pump-installation-process-bc': 'Heat Pump Installation Process in BC',
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
    'types-of-heat-pumps-bc': '18 min read',
    'how-heat-pumps-work': '16 min read',
    'heat-pump-installation-process-bc': '20 min read',
    'heat-pump-vs-boiler-bc': '10 min read',
    'air-to-water-heat-pumps-bc': '12 min read',
    'hybrid-heat-pump-boiler-systems': '11 min read',
    'cost-heat-pump-installation-bc': '14 min read',
    'boiler-replacement-cost-bc': '13 min read',
    'heat-pump-sizing-guide-bc': '16 min read',
    'ductless-vs-central-heat-pumps-bc': '15 min read',
    'understanding-heat-pump-ratings': '13 min read',
  };

  const descriptions: Record<string, string> = {
    'types-of-heat-pumps-bc': 'Complete guide to heat pump types in British Columbia. Learn about ductless, ducted, air-to-water, geothermal, and cold climate heat pumps. Compare costs, efficiency, and ideal applications for BC homes.',
    'how-heat-pumps-work': 'Technical explanation of heat pump operation made accessible. Learn about refrigeration cycles, compressors, COP ratings, and why heat pumps are 200-400% efficient even in cold weather.',
    'heat-pump-installation-process-bc': 'Step-by-step guide to heat pump installation in BC. Learn about load calculations, permits, inspections, timelines, and what to expect from quote to commissioning.',
    'heat-pump-vs-boiler-bc': 'Compare heat pumps and boilers for BC homes. Learn about costs, efficiency, climate suitability, and which system is right for your situation.',
    'air-to-water-heat-pumps-bc': 'Complete guide to air-to-water heat pumps in BC. Understand how they work with hydronic systems, costs, efficiency, and installation requirements.',
    'hybrid-heat-pump-boiler-systems': 'Learn about hybrid heat pump and boiler systems. Discover how combining both technologies maximizes efficiency and comfort in BC climate.',
    'cost-heat-pump-installation-bc': 'Comprehensive breakdown of heat pump installation costs in BC. Includes equipment, labor, rebates, and total cost by system type.',
    'boiler-replacement-cost-bc': 'Guide to boiler replacement costs in BC. Compare gas, electric, and combi boilers, plus installation costs and available rebates.',
    'heat-pump-sizing-guide-bc': 'Learn how to properly size a heat pump for BC homes. Manual J calculations, design temperatures, and avoiding over/undersizing.',
    'ductless-vs-central-heat-pumps-bc': 'Compare ductless mini-split and central ducted heat pumps. Costs, efficiency, installation, and which is best for your BC home.',
    'understanding-heat-pump-ratings': 'Understand SEER, HSPF, and COP ratings for heat pumps. Learn what these efficiency metrics mean for BC climate performance.',
  };

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <ArticleJsonLd
        title={titles[slug] || 'Guide'}
        description={descriptions[slug] || `Comprehensive guide on ${titles[slug]?.toLowerCase() || 'heating systems'} for BC homeowners.`}
        slug={slug}
        datePublished="2026-01-15"
        dateModified="2026-02-16"
      />
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
