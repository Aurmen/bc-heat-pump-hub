import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getAllListings, getListingBySlug, formatServiceName, formatPhoneNumber } from '@/lib/utils';
import { BreadcrumbJsonLd, LocalBusinessJsonLd } from '@/components/JsonLd';

export async function generateStaticParams() {
  const listings = getAllListings();
  return listings.map(listing => ({ slug: listing.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const listing = getListingBySlug(slug);

  if (!listing) return { title: 'Company Not Found' };

  return {
    title: `${listing.company_name} - ${listing.city}, BC`,
    description: `${listing.company_name} provides ${listing.services.map(s => formatServiceName(s)).join(', ')} services in ${listing.city}, ${listing.region}.`,
  };
}

export default async function CompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = getListingBySlug(slug);

  if (!listing) {
    notFound();
  }

  const breadcrumbItems = [
    { name: 'Home', url: 'https://canadianheatpumphub.ca' },
    { name: 'Directory', url: 'https://canadianheatpumphub.ca/directory' },
    { name: listing.company_name, url: `https://canadianheatpumphub.ca/directory/${listing.slug}` },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <LocalBusinessJsonLd
        name={listing.company_name}
        url={listing.website}
        phone={listing.phone}
        city={listing.city}
        region={listing.region}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary-600">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/directory" className="hover:text-primary-600">Directory</Link>
          <span className="mx-2">/</span>
          <span>{listing.company_name}</span>
        </nav>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {listing.company_name}
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          {listing.city}, {listing.region}, BC
        </p>

        <div className="bg-white border border-gray-200 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>

          <div className="space-y-4">
            {listing.phone ? (
              <div>
                <span className="font-semibold text-gray-900">Phone:</span>{' '}
                <a href={`tel:${listing.phone}`} className="text-primary-600 hover:text-primary-700">
                  {formatPhoneNumber(listing.phone)}
                </a>
              </div>
            ) : (
              <div>
                <span className="font-semibold text-gray-900">Phone:</span>{' '}
                <span className="text-gray-500">Not available</span>
              </div>
            )}

            {listing.website ? (
              <div>
                <span className="font-semibold text-gray-900">Website:</span>{' '}
                <a
                  href={listing.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 underline"
                >
                  {listing.website}
                </a>
              </div>
            ) : (
              <div>
                <span className="font-semibold text-gray-900">Website:</span>{' '}
                <span className="text-gray-500">Not available</span>
              </div>
            )}

            <div>
              <span className="font-semibold text-gray-900">Location:</span>{' '}
              {listing.city}, {listing.region}, {listing.province}
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Services</h2>

          <div className="flex flex-wrap gap-2 mb-6">
            {listing.services.map(service => (
              <span
                key={service}
                className="inline-block bg-primary-50 text-primary-700 px-4 py-2 rounded-lg font-medium"
              >
                {formatServiceName(service)}
              </span>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <span className="font-semibold text-gray-900">Emergency Service:</span>{' '}
              {listing.emergency_service === 'yes' && 'Available'}
              {listing.emergency_service === 'no' && 'Not available'}
              {listing.emergency_service === 'unknown' && 'Unknown - please inquire'}
            </div>

            {listing.brands_supported.length > 0 && (
              <div>
                <span className="font-semibold text-gray-900">Brands Supported:</span>{' '}
                {listing.brands_supported.join(', ')}
              </div>
            )}
          </div>
        </div>

        {listing.notes && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Information</h3>
            <p className="text-gray-700">{listing.notes}</p>
          </div>
        )}

        <div className="bg-blue-50 border-l-4 border-primary-500 p-6 mb-8">
          <p className="text-sm text-gray-700">
            <strong>Suggest an update?</strong> Email us at{' '}
            <a href="mailto:contact@canadianheatpumphub.ca" className="text-primary-600 hover:text-primary-700">
              contact@canadianheatpumphub.ca
            </a>
          </p>
        </div>

        <div className="disclaimer">
          <p className="font-semibold mb-2">Disclaimer</p>
          <p>
            This listing is for informational purposes only and does not constitute an endorsement.
            Always verify contractor licensing, insurance, and suitability for your specific project.
            Request multiple quotes and check references before hiring any contractor.
          </p>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <Link
            href="/directory"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Back to Directory
          </Link>
        </div>
      </div>
    </>
  );
}
