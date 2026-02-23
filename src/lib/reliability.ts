import { DirectoryListing, ServiceReliability } from '@/types/directory';

export type ReliabilityTierLabel = 'Elite' | 'Verified' | 'Standard' | 'Limited';

export interface TierInfo {
  label: ReliabilityTierLabel;
  color: string;
  bgColor: string;
  borderColor: string;
  barColor: string;
}

const TIERS: Record<ReliabilityTierLabel, TierInfo> = {
  Elite: {
    label: 'Elite',
    color: 'text-emerald-800',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    barColor: 'bg-emerald-500',
  },
  Verified: {
    label: 'Verified',
    color: 'text-blue-800',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    barColor: 'bg-blue-500',
  },
  Standard: {
    label: 'Standard',
    color: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    barColor: 'bg-gray-400',
  },
  Limited: {
    label: 'Limited',
    color: 'text-amber-800',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    barColor: 'bg-amber-400',
  },
};

export function calculateReliabilityScore(sr: ServiceReliability): number {
  let score = 0;

  // Category 1: Licensing (20 pts)
  if (sr.licensing_verified === true) score += 12;
  if (sr.insurance_verified === true) score += 8;

  // Category 2: Availability (20 pts)
  if (sr.emergency_24_7 === true) score += 8;
  if (sr.same_day_service === true) score += 5;
  if (sr.weekend_service === true) score += 4;
  const trucks = sr.service_truck_count ?? 0;
  if (trucks >= 5) score += 3;
  else if (trucks >= 2) score += 2;
  else if (trucks >= 1) score += 1;

  // Category 3: HP Experience (15 pts)
  if (sr.hp_installs_per_year === '50+') score += 8;
  else if (sr.hp_installs_per_year === '20-50') score += 6;
  else if (sr.hp_installs_per_year === '10-20') score += 4;
  else if (sr.hp_installs_per_year === '<10') score += 2;
  if (sr.brand_certifications.length >= 3) score += 4;
  else if (sr.brand_certifications.length >= 1) score += 2;
  if (sr.hydronic_experience === true) score += 3;

  // Category 4: Service Quality (15 pts)
  if (sr.written_diagnostics === true) score += 5;
  if (sr.performance_testing_offered === true) score += 5;
  if (sr.maintenance_plans === true) score += 5;

  // Category 5: Customer History (15 pts)
  const rating = sr.google_rating ?? 0;
  const reviews = sr.google_review_count ?? 0;
  if (rating >= 4.7 && reviews >= 20) score += 10;
  else if (rating >= 4.5 && reviews >= 10) score += 8;
  else if (rating >= 4.0 && reviews >= 5) score += 5;
  else if (rating >= 3.5) score += 2;
  if (reviews >= 50) score += 3;
  else if (reviews >= 20) score += 2;
  else if (reviews >= 10) score += 1;
  if (sr.complaint_pattern_flag === true) score -= 5;

  // Category 6: Specialty (10 pts)
  if (sr.condo_strata_experience === true) score += 4;
  if (sr.commercial_capable === true) score += 3;
  if (sr.hydronic_boiler_service === true) score += 3;

  // Category 7: Documentation (5 pts)
  if (sr.digital_records === true) score += 2;
  if (sr.photo_documentation === true) score += 2;
  if (sr.permit_tracking === true) score += 1;

  return Math.max(0, Math.min(100, score));
}

export function getReliabilityTier(score: number): TierInfo {
  if (score >= 90) return TIERS.Elite;
  if (score >= 75) return TIERS.Verified;
  if (score >= 60) return TIERS.Standard;
  return TIERS.Limited;
}

/**
 * Returns null unless the listing has a completed outreach assessment
 * (i.e., service_reliability is present and last_assessed is set).
 */
export function getListingReliability(
  listing: DirectoryListing
): { score: number; tier: TierInfo } | null {
  if (!listing.service_reliability?.last_assessed) return null;
  const score = calculateReliabilityScore(listing.service_reliability);
  return { score, tier: getReliabilityTier(score) };
}
