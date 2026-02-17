import Link from 'next/link';
import { DirectoryListing } from '@/types/directory';
import { formatServiceName, formatPhoneNumber } from '@/lib/utils';
import TSBCBadge from './TSBCBadge';

interface CompanyCardProps {
  listing: DirectoryListing;
}

export default function CompanyCard({ listing }: CompanyCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        <Link href={`/directory/${listing.slug}`} className="hover:text-primary-600">
          {listing.company_name}
        </Link>
      </h3>

      {/* TSBC Verification Badge */}
      {listing.tsbc_verified && (
        <div className="mb-3">
          <TSBCBadge listing={listing} variant="compact" />
        </div>
      )}

      <div className="text-sm text-gray-600 space-y-1 mb-3">
        <p>{listing.city}, {listing.region}</p>
        {listing.phone && (
          <p>
            <span className="font-medium">Phone:</span> {formatPhoneNumber(listing.phone)}
          </p>
        )}
      </div>

      <div className="mb-3">
        <p className="text-xs font-medium text-gray-700 mb-1">Services:</p>
        <div className="flex flex-wrap gap-1">
          {listing.services.map(service => (
            <span
              key={service}
              className="inline-block bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded"
            >
              {formatServiceName(service)}
            </span>
          ))}
        </div>
      </div>

      {listing.brands_supported.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-gray-700 mb-1">Brands:</p>
          <p className="text-sm text-gray-600">{listing.brands_supported.join(', ')}</p>
        </div>
      )}

      {listing.notes && (
        <p className="text-sm text-gray-600 italic mb-3">{listing.notes}</p>
      )}

      <Link
        href={`/directory/${listing.slug}`}
        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
      >
        View Details →
      </Link>
    </div>
  );
}
