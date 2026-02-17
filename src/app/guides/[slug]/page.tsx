import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { BreadcrumbJsonLd } from '@/components/JsonLd';

const guides = [
  'heat-pump-vs-boiler-bc',
  'air-to-water-heat-pumps-bc',
  'hybrid-heat-pump-boiler-systems',
  'cost-heat-pump-installation-bc',
  'boiler-replacement-cost-bc',
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

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary-600">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/guides" className="hover:text-primary-600">Guides</Link>
          <span className="mx-2">/</span>
          <span>{slug}</span>
        </nav>

        <div className="prose prose-lg">
          <Content />
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
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
