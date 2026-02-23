import Link from 'next/link';
import { DirectoryListing, AudienceType } from '@/types/directory';
import { formatServiceName, formatPhoneNumber, inferAudience } from '@/lib/utils';
import { getListingReliability } from '@/lib/reliability';
import TSBCBadge from './TSBCBadge';
import ReliabilityBadge from './ReliabilityBadge';

interface CompanyCardProps {
  listing: DirectoryListing;
  audienceContext?: AudienceType;
}

export default function CompanyCard({ listing, audienceContext }: CompanyCardProps) {
  const listingAudience = inferAudience(listing);
  const reliability = getListingReliability(listing);

  // Determine what to emphasize based on audience context
  const emphasizeEmergency = audienceContext === 'residential';
  const emphasizeLicenses = audienceContext === 'commercial';

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        <Link href={`/directory/${listing.slug}`} className="hover:text-primary-600">
          {listing.company_name}
        </Link>
      </h3>

      {/* Audience Badge - Show what they serve */}
      {listingAudience !== 'unknown' && (
        <div className="mb-3">
          {listingAudience === 'both' && (
            <span className="inline-block bg-purple-50 text-purple-700 text-xs px-2 py-1 rounded font-medium">
              Residential & Commercial
            </span>
          )}
          {listingAudience === 'residential' && (
            <span className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded font-medium">
              🏠 Residential
            </span>
          )}
          {listingAudience === 'commercial' && (
            <span className="inline-block bg-orange-50 text-orange-700 text-xs px-2 py-1 rounded font-medium">
              🏢 Commercial
            </span>
          )}
        </div>
      )}

      {/* TSBC Verification Badge - emphasized for commercial */}
      {listing.tsbc_verified && (
        <div className={`mb-3 ${emphasizeLicenses ? 'ring-2 ring-primary-200 rounded-lg p-2 bg-primary-50' : ''}`}>
          <TSBCBadge listing={listing} variant="compact" />
          {emphasizeLicenses && (
            <p className="text-xs text-primary-700 mt-1 font-medium">
              Professional licenses verified
            </p>
          )}
        </div>
      )}

      {/* Reliability Score Badge — only shown after outreach assessment */}
      {reliability && listing.service_reliability && (
        <div className="mb-3">
          <ReliabilityBadge reliability={listing.service_reliability} variant="compact" />
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

      {/* Emergency Service - emphasized for residential */}
      {emphasizeEmergency && listing.emergency_service === 'yes' && (
        <div className="mb-3 bg-red-50 border border-red-200 rounded-lg p-2">
          <p className="text-xs text-red-700 font-bold flex items-center gap-1">
            <span>🚨</span>
            24/7 Emergency Service Available
          </p>
        </div>
      )}

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
        <p className="text-sm text-gray-600 italic mb-3 line-clamp-2">{listing.notes}</p>
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
