export type ServiceType = 'heat_pumps' | 'air_to_water' | 'boilers' | 'hybrid';

export interface DirectoryListing {
  company_name: string;
  slug: string;
  website: string;
  phone: string;
  city: string;
  region: 'Lower Mainland' | 'Vancouver Island' | 'Interior';
  province: 'BC';
  services: ServiceType[];
  emergency_service: 'yes' | 'no' | 'unknown';
  brands_supported: string[];
  notes: string;
  source_urls: string[];
}

export interface City {
  name: string;
  slug: string;
  region: string;
  regionSlug: string;
  province: 'BC';
  climateNotes: string;
  population?: string;
}

export interface Region {
  name: string;
  slug: string;
  province: 'BC';
  description: string;
  cities: string[];
}
