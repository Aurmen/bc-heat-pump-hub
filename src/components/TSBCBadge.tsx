import { DirectoryListing, TSBCLicenseStatus } from '@/types/directory';

interface TSBCBadgeProps {
  listing: DirectoryListing;
  variant?: 'compact' | 'full';
}

export default function TSBCBadge({ listing, variant = 'compact' }: TSBCBadgeProps) {
  if (!listing.tsbc_verified) {
    return null;
  }

  const licenses: string[] = [];
  if (listing.tsbc_fsr_license) licenses.push('FSR');
  if (listing.tsbc_gas_license) licenses.push('Gas');
  if (listing.tsbc_electrical_license) licenses.push('Electrical');

  const hasCleanRecord = (listing.tsbc_enforcement_actions ?? 0) === 0;
  const isActive = listing.tsbc_license_status === 'active';
  const isExpiringSoon = listing.tsbc_license_status === 'expiring_soon';

  // Determine badge color based on status
  const getBadgeColor = () => {
    if (!isActive) return 'bg-gray-100 text-gray-700 border-gray-300';
    if (isExpiringSoon) return 'bg-yellow-50 text-yellow-700 border-yellow-300';
    return 'bg-success-50 text-success-700 border-success-300';
  };

  const getStatusIcon = () => {
    if (!isActive) return '⚠️';
    if (isExpiringSoon) return '⏰';
    return '✓';
  };

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2">
        <div className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded border ${getBadgeColor()}`}>
          <span>{getStatusIcon()}</span>
          <span>TSBC Verified</span>
        </div>
        {hasCleanRecord && isActive && (
          <div className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded border bg-blue-50 text-blue-700 border-blue-300">
            <span>🛡️</span>
            <span>Clean Record</span>
          </div>
        )}
      </div>
    );
  }

  // Full variant with detailed information
  return (
    <div className="bg-gradient-to-br from-success-50 to-emerald-50 border border-success-200 rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getStatusIcon()}</span>
          <div>
            <h4 className="font-bold text-gray-900">TSBC Verified Contractor</h4>
            <p className="text-sm text-gray-600">Licensed by Technical Safety BC</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {/* License Information */}
        <div className="bg-white rounded p-3">
          <p className="text-xs font-medium text-gray-700 mb-2">Active Licenses:</p>
          <div className="flex flex-wrap gap-2">
            {listing.tsbc_fsr_license && (
              <div className="bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded">
                FSR: {listing.tsbc_fsr_license}
              </div>
            )}
            {listing.tsbc_gas_license && (
              <div className="bg-accent-50 text-accent-700 text-xs px-2 py-1 rounded">
                Gas: {listing.tsbc_gas_license}
              </div>
            )}
            {listing.tsbc_electrical_license && (
              <div className="bg-yellow-50 text-yellow-700 text-xs px-2 py-1 rounded">
                Electrical: {listing.tsbc_electrical_license}
              </div>
            )}
          </div>
        </div>

        {/* Status and Safety Record */}
        <div className="flex gap-2 text-xs">
          <div className={`flex-1 rounded p-2 ${getBadgeColor()}`}>
            <p className="font-medium">
              Status: {listing.tsbc_license_status === 'active' ? 'Active' :
                       listing.tsbc_license_status === 'expiring_soon' ? 'Expiring Soon' :
                       listing.tsbc_license_status === 'expired' ? 'Expired' : 'Unknown'}
            </p>
            {listing.tsbc_license_expiry && (
              <p className="text-xs opacity-80 mt-1">
                Expires: {new Date(listing.tsbc_license_expiry).toLocaleDateString()}
              </p>
            )}
          </div>

          {hasCleanRecord && (
            <div className="flex-1 bg-blue-50 text-blue-700 border border-blue-300 rounded p-2">
              <p className="font-medium">🛡️ Clean Safety Record</p>
              <p className="text-xs opacity-80 mt-1">0 enforcement actions</p>
            </div>
          )}
        </div>

        {/* Last Verified */}
        {listing.tsbc_last_verified && (
          <p className="text-xs text-gray-500 text-center">
            Verified: {new Date(listing.tsbc_last_verified).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* What this means */}
      <div className="mt-3 pt-3 border-t border-success-200">
        <p className="text-xs text-gray-600">
          <strong>Why this matters:</strong> TSBC licensing ensures contractors meet safety standards
          for refrigeration, gas, and electrical work. Always verify current license status on{' '}
          <a
            href="https://www.technicalsafetybc.ca/regulatory-resources/find-a-licensed-contractor/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-700 underline"
          >
            TSBC's website
          </a>.
        </p>
      </div>
    </div>
  );
}
