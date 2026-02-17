import { DirectoryListing, ServiceType } from '@/types/directory';
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
