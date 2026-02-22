import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { brands, getBrandBySlug, DEALER_NETWORK_LABEL } from '@/data/brands';
import { getAllListings } from '@/lib/utils';
import CompanyCard from '@/components/CompanyCard';
import { BreadcrumbJsonLd } from '@/components/JsonLd';

export async function generateStaticParams() {
  return brands.map(b => ({ slug: b.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const brand = getBrandBySlug(slug);
  if (!brand) return { title: 'Brand Not Found' };

  return {
    title: `${brand.name} Heat Pump Dealers in BC | Canadian Heat Pump Hub`,
    description: `Find certified ${brand.name} heat pump installers and dealers in British Columbia. ${brand.bcNotes}`,
    alternates: {
      canonical: `https://canadianheatpumphub.ca/brands/${brand.slug}`,
    },
  };
}

export default async function BrandPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const brand = getBrandBySlug(slug);

  if (!brand) notFound();

  // Find all dealers that explicitly carry this brand
  const allListings = getAllListings();
  const dealers = allListings.filter(l =>
    l.brands_supported.some(
      b => b.toLowerCase() === brand.name.toLowerCase()
    )
  );

  // Group by region
  const byRegion: Record<string, typeof dealers> = {};
  for (const d of dealers) {
    const r = d.region;
    if (!byRegion[r]) byRegion[r] = [];
    byRegion[r].push(d);
  }

  const regionOrder = ['Lower Mainland', 'Vancouver Island', 'Interior'];

  // Multi-brand dealers who may carry this brand
  const multiBrandDealers = allListings.filter(l =>
    l.brands_supported.includes('Multiple') &&
    !dealers.find(d => d.slug === l.slug)
  );

  const breadcrumbItems = [
    { name: 'Home', url: 'https://canadianheatpumphub.ca' },
    { name: 'Brands', url: 'https://canadianheatpumphub.ca/brands' },
    { name: brand.name, url: `https://canadianheatpumphub.ca/brands/${brand.slug}` },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary-600">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/brands" className="hover:text-primary-600">Brands</Link>
          <span className="mx-2">/</span>
          <span>{brand.name}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <h1 className="text-4xl font-bold text-gray-900">
              {brand.name} Dealers in BC
            </h1>
            <span className="inline-block bg-primary-100 text-primary-800 text-sm font-medium px-3 py-1 rounded-full">
              {brand.type}
            </span>
            {brand.specialty && (
              <span className="inline-block bg-accent-100 text-accent-800 text-sm font-medium px-3 py-1 rounded-full">
                {brand.specialty}
              </span>
            )}
          </div>
          <p className="text-lg text-gray-600 max-w-3xl">{brand.bcNotes}</p>
        </div>

        {/* Brand stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-primary-600">{dealers.length}</div>
            <div className="text-sm text-gray-500 mt-1">Confirmed dealers</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-gray-700">
              {new Set(dealers.map(d => d.city)).size}
            </div>
            <div className="text-sm text-gray-500 mt-1">Cities covered</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-gray-700">{brand.origin}</div>
            <div className="text-sm text-gray-500 mt-1">Manufactured in</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <div className={`text-sm font-semibold mt-1 px-2 py-1 rounded-full inline-block ${
              brand.dealerNetwork === 'strong' ? 'bg-green-100 text-green-800' :
              brand.dealerNetwork === 'moderate' ? 'bg-blue-100 text-blue-800' :
              brand.dealerNetwork === 'limited' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-700'
            }`}>
              {DEALER_NETWORK_LABEL[brand.dealerNetwork]}
            </div>
            <div className="text-sm text-gray-500 mt-1">Dealer network</div>
          </div>
        </div>

        {/* Dealers by region */}
        {dealers.length > 0 ? (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {brand.name} Installers in BC
            </h2>
            {regionOrder
              .filter(r => byRegion[r]?.length > 0)
              .map(regionName => (
                <div key={regionName} className="mb-10">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                    {regionName}
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      ({byRegion[regionName].length} dealer{byRegion[regionName].length !== 1 ? 's' : ''})
                    </span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {byRegion[regionName].map(listing => (
                      <CompanyCard key={listing.slug} listing={listing} />
                    ))}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center mb-12">
            <p className="text-gray-600 mb-2 font-medium">
              No confirmed {brand.name} dealers currently listed in our directory.
            </p>
            <p className="text-gray-500 text-sm mb-4">
              {brand.dealerNetwork === 'rare'
                ? `${brand.name} has very limited dealer presence in BC. Contact the manufacturer directly for referrals.`
                : `We may be missing dealers — check back as we expand the directory.`}
            </p>
            <Link href="/directory" className="text-primary-600 hover:text-primary-700 font-medium">
              Browse all BC installers →
            </Link>
          </div>
        )}

        {/* Multi-brand dealers note */}
        {multiBrandDealers.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-10">
            <h3 className="font-semibold text-gray-900 mb-2">
              {multiBrandDealers.length} additional multi-brand contractors may carry {brand.name}
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              These contractors work with multiple brands and may stock or order {brand.name} equipment.
              Contact them directly to confirm availability.
            </p>
            <Link href="/directory" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View all BC installers →
            </Link>
          </div>
        )}

        {/* Cold climate note */}
        {brand.coldClimateRated && (
          <div className="bg-white border border-gray-200 rounded-lg p-5 mb-8">
            <h3 className="font-semibold text-gray-900 mb-2">
              Is {brand.name} suitable for BC winters?
            </h3>
            <p className="text-sm text-gray-700">
              Yes — {brand.name} offers cold-climate rated models suitable for BC's varied climates,
              including the BC Interior. Always confirm the specific model is rated for your
              local design temperature. See our{' '}
              <Link href="/brands" className="text-primary-600 hover:text-primary-700">
                brand comparison guide
              </Link>{' '}
              for detailed performance specs.
            </p>
          </div>
        )}

        {/* Back to brands */}
        <div className="flex flex-wrap gap-4 mt-8">
          <Link
            href="/brands"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            ← All brand comparisons
          </Link>
          <Link
            href="/directory"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Browse full installer directory →
          </Link>
        </div>

        <div className="disclaimer mt-10">
          <p className="font-semibold mb-2">Disclaimer</p>
          <p>
            Dealer listings are for informational purposes only. Brand authorization status
            and dealer certifications should be verified directly with the contractor and
            manufacturer. Listings do not constitute endorsements.
          </p>
        </div>
      </div>
    </>
  );
}
