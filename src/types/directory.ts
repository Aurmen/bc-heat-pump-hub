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
  // Climate data
  designTemp?: number; // Design temperature for heating calculations (°C)
  avgWinterLow?: number; // Average winter low temperature (°C)
  heatingDegreeDays?: number; // Annual heating degree days (base 18°C)
  // Cost data (2,000 sq ft home)
  installCosts?: {
    ductless: string;
    ducted: string;
    airToWater: string;
  };
  // Operating costs (annual, 2,000 sq ft home)
  operatingCosts?: {
    heatPump: string;
    gasBoiler: string;
    electricBaseboard: string;
  };
  // Recommended systems
  recommendedSystems?: string[];
}

export interface Region {
  name: string;
  slug: string;
  province: 'BC';
  description: string;
  cities: string[];
}
