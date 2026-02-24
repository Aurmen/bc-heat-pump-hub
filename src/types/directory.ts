export type ServiceType = 'heat_pumps' | 'air_to_water' | 'boilers' | 'hybrid';

export type AudienceType = 'residential' | 'commercial' | 'both' | 'unknown';

export type TSBCLicenseStatus = 'active' | 'expiring_soon' | 'expired' | 'unknown';

export interface ServiceReliability {
  last_assessed: string | null; // ISO date — null means not yet assessed
  // Licensing (20 pts)
  licensing_verified: boolean | null;
  insurance_verified: boolean | null;
  // Availability (20 pts)
  emergency_24_7: boolean | null;
  same_day_service: boolean | null;
  weekend_service: boolean | null;
  service_truck_count: number | null;
  // HP Experience (15 pts)
  hp_installs_per_year: '<10' | '10-20' | '20-50' | '50+' | null;
  brand_certifications: string[];
  hydronic_experience: boolean | null;
  // Service Quality (15 pts)
  written_diagnostics: boolean | null;
  performance_testing_offered: boolean | null;
  maintenance_plans: boolean | null;
  // Customer History (15 pts)
  google_rating: number | null;
  google_review_count: number | null;
  complaint_pattern_flag: boolean | null;
  // Specialty (10 pts)
  condo_strata_experience: boolean | null;
  commercial_capable: boolean | null;
  hydronic_boiler_service: boolean | null;
  // Documentation (5 pts)
  digital_records: boolean | null;
  photo_documentation: boolean | null;
  permit_tracking: boolean | null;
}

export type SpecialtyKey = 'ems_certified' | 'strata_approved' | 'cold_climate_pro';

export interface ContractorSpecialties {
  ems_certified?: boolean;    // Experienced with DCC-9/DCC-12 and EMS load management
  strata_approved?: boolean;  // History of strata/condo installations
  cold_climate_pro?: boolean; // Specializes in sub -15°C Interior installs
}

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
  specialties?: ContractorSpecialties;
  // TSBC Verification (Technical Safety BC)
  tsbc_verified?: boolean;
  tsbc_fsr_license?: string; // Field Safety Representative (refrigeration) license number
  tsbc_gas_license?: string; // Gas fitter license number (if applicable)
  tsbc_electrical_license?: string; // Electrical license number (if applicable)
  tsbc_license_status?: TSBCLicenseStatus;
  tsbc_license_expiry?: string; // ISO date string
  tsbc_enforcement_actions?: number; // Number of enforcement actions (0 = clean record)
  tsbc_last_verified?: string; // ISO date string - when we last verified the license
  // Service Reliability Score — null until a real outreach assessment is completed
  service_reliability?: ServiceReliability | null;
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
