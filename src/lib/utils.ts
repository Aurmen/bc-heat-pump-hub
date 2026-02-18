import { DirectoryListing, ServiceType, AudienceType } from '@/types/directory';
import directoryData from '@/data/directory.json';

export function getAllListings(): DirectoryListing[] {
  return directoryData as DirectoryListing[];
}

export function getListingBySlug(slug: string): DirectoryListing | undefined {
  return getAllListings().find(listing => listing.slug === slug);
}

export function getListingsByCity(city: string): DirectoryListing[] {
  return getAllListings().filter(listing =>
    listing.city.toLowerCase() === city.toLowerCase()
  );
}

export function getListingsByRegion(region: string): DirectoryListing[] {
  return getAllListings().filter(listing =>
    listing.region.toLowerCase().replace(/\s+/g, '-') === region.toLowerCase()
  );
}

export function formatServiceName(service: ServiceType): string {
  const serviceNames: Record<ServiceType, string> = {
    heat_pumps: 'Heat Pumps',
    air_to_water: 'Air-to-Water Heat Pumps',
    boilers: 'Boiler Replacement',
    hybrid: 'Hybrid Systems',
  };
  return serviceNames[service];
}

export function formatPhoneNumber(phone: string): string {
  // Basic formatting for display
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

/**
 * Infers the target audience for a listing based on notes, services, and TSBC licenses.
 * This avoids needing an explicit audience field in the data.
 */
export function inferAudience(listing: DirectoryListing): AudienceType {
  const notesLower = listing.notes.toLowerCase();

  // Explicit mentions in notes
  const hasResidentialMention = /residential/.test(notesLower);
  const hasCommercialMention = /commercial/.test(notesLower);

  if (hasResidentialMention && hasCommercialMention) return 'both';
  if (hasResidentialMention) return 'residential';
  if (hasCommercialMention) return 'commercial';

  // Heuristics based on business indicators
  // Multiple TSBC licenses (FSR + Gas + Electrical) suggests commercial capacity
  const licenseCount = [
    listing.tsbc_fsr_license,
    listing.tsbc_gas_license,
    listing.tsbc_electrical_license
  ].filter(Boolean).length;

  if (licenseCount >= 2) {
    return 'both'; // Likely serves both markets
  }

  // Default to 'both' if we can't determine - safer assumption
  return 'both';
}

/**
 * Filters listings by audience preference.
 * Returns all listings if audienceFilter is undefined or 'all'.
 */
export function filterByAudience(
  listings: DirectoryListing[],
  audienceFilter?: string
): DirectoryListing[] {
  if (!audienceFilter || audienceFilter === 'all') {
    return listings;
  }

  return listings.filter(listing => {
    const audience = inferAudience(listing);
    if (audience === 'both') return true; // Always show contractors that serve both
    if (audience === 'unknown') return true; // Show unknown rather than hide
    return audience === audienceFilter;
  });
}
