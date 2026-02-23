import { ServiceReliability } from '@/types/directory';
import { calculateReliabilityScore, getReliabilityTier } from '@/lib/reliability';

interface Props {
  reliability: ServiceReliability;
  variant?: 'compact' | 'full';
}

export default function ReliabilityBadge({ reliability, variant = 'compact' }: Props) {
  const score = calculateReliabilityScore(reliability);
  const tier = getReliabilityTier(score);

  if (variant === 'compact') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${tier.bgColor} ${tier.color} ${tier.borderColor}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
        {tier.label} · {score}/100
      </span>
    );
  }

  // Full variant — used on detail pages
  const categories = buildVerifiedItems(reliability);

  return (
    <div className={`border rounded-xl p-6 ${tier.bgColor} ${tier.borderColor}`}>
      <div className="flex items-start justify-between mb-4 gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Service Reliability Score</h3>
          <p className="text-sm text-gray-600 mt-0.5">
            Based on direct outreach verification
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-3xl font-bold text-gray-900">
            {score}
            <span className="text-base font-normal text-gray-500">/100</span>
          </div>
          <span
            className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full mt-1 border ${tier.bgColor} ${tier.color} ${tier.borderColor}`}
          >
            {tier.label}
          </span>
        </div>
      </div>

      {/* Score bar */}
      <div className="w-full bg-white bg-opacity-60 rounded-full h-2 mb-6">
        <div
          className={`h-2 rounded-full ${tier.barColor} transition-all`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Verified items by category */}
      <div className="space-y-4">
        {categories.map(cat => (
          <div key={cat.label}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              {cat.label}
            </p>
            {cat.items.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {cat.items.map(item => (
                  <span
                    key={item}
                    className="text-xs bg-white border border-gray-200 text-gray-700 px-2.5 py-1 rounded-full"
                  >
                    {item}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">Not yet collected</p>
            )}
          </div>
        ))}
      </div>

      {reliability.last_assessed && (
        <p className="text-xs text-gray-500 mt-5 pt-4 border-t border-gray-200">
          Last assessed:{' '}
          {new Date(reliability.last_assessed).toLocaleDateString('en-CA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      )}
    </div>
  );
}

interface Category {
  label: string;
  items: string[];
}

function buildVerifiedItems(sr: ServiceReliability): Category[] {
  const cats: Category[] = [];

  const licensing: string[] = [];
  if (sr.licensing_verified) licensing.push('TSBC licence confirmed');
  if (sr.insurance_verified) licensing.push('Insurance confirmed');
  cats.push({ label: 'Licensing & Insurance', items: licensing });

  const avail: string[] = [];
  if (sr.emergency_24_7) avail.push('24/7 emergency');
  if (sr.same_day_service) avail.push('Same-day service');
  if (sr.weekend_service) avail.push('Weekend availability');
  if (sr.service_truck_count)
    avail.push(`${sr.service_truck_count} service truck${sr.service_truck_count !== 1 ? 's' : ''}`);
  cats.push({ label: 'Availability', items: avail });

  const exp: string[] = [];
  if (sr.hp_installs_per_year) exp.push(`${sr.hp_installs_per_year} HP installs/year`);
  sr.brand_certifications.forEach(b => exp.push(`${b} certified`));
  if (sr.hydronic_experience) exp.push('Hydronic experience');
  cats.push({ label: 'Heat Pump Experience', items: exp });

  const quality: string[] = [];
  if (sr.written_diagnostics) quality.push('Written diagnostics');
  if (sr.performance_testing_offered) quality.push('Performance testing');
  if (sr.maintenance_plans) quality.push('Maintenance plans');
  cats.push({ label: 'Service Quality', items: quality });

  const history: string[] = [];
  if (sr.google_rating && sr.google_review_count)
    history.push(`${sr.google_rating}★ (${sr.google_review_count} reviews)`);
  if (sr.complaint_pattern_flag) history.push('⚠ Complaint pattern noted');
  cats.push({ label: 'Customer History', items: history });

  const specialty: string[] = [];
  if (sr.condo_strata_experience) specialty.push('Condo/strata');
  if (sr.commercial_capable) specialty.push('Commercial');
  if (sr.hydronic_boiler_service) specialty.push('Hydronic/boiler service');
  cats.push({ label: 'Specialty', items: specialty });

  const docs: string[] = [];
  if (sr.digital_records) docs.push('Digital records');
  if (sr.photo_documentation) docs.push('Photo documentation');
  if (sr.permit_tracking) docs.push('Permit tracking');
  cats.push({ label: 'Documentation', items: docs });

  return cats;
}
