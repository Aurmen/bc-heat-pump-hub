import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  repairCities,
  getRepairCityBySlug,
  repairCosts,
  preCallChecklist,
  symptomTable,
} from '@/data/repair-cities';
import { getListingsByCity } from '@/lib/utils';
import CompanyCard from '@/components/CompanyCard';
import { BreadcrumbJsonLd } from '@/components/JsonLd';

export async function generateStaticParams() {
  return repairCities.map(city => ({ city: city.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city: citySlug } = await params;
  const city = getRepairCityBySlug(citySlug);
  if (!city) return { title: 'Not Found' };

  return {
    title: `Heat Pump Repair ${city.name} BC | Emergency Service Guide 2026`,
    description: `Emergency heat pump repair in ${city.name}, BC. Pre-call checklist, symptom guide, local repair costs, and licensed technicians. ${city.climateHeadline}`,
    alternates: {
      canonical: `https://canadianheatpumphub.ca/repair/${city.slug}`,
    },
  };
}

const urgencyColors = {
  high: 'bg-red-100 text-red-800 border-red-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-blue-100 text-blue-800 border-blue-200',
};

const urgencyLabel = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

const brandRepairLinks = [
  { name: 'Mitsubishi', slug: 'mitsubishi' },
  { name: 'Daikin', slug: 'daikin' },
  { name: 'Fujitsu', slug: 'fujitsu' },
  { name: 'LG', slug: 'lg' },
  { name: 'Bosch', slug: 'bosch' },
  { name: 'Samsung', slug: 'samsung' },
];

export default async function CityRepairPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city: citySlug } = await params;
  const city = getRepairCityBySlug(citySlug);

  if (!city) notFound();

  const listings = getListingsByCity(city.name);

  const breadcrumbItems = [
    { name: 'Home', url: 'https://canadianheatpumphub.ca' },
    { name: 'Heat Pump Repair', url: 'https://canadianheatpumphub.ca/repair' },
    { name: city.name, url: `https://canadianheatpumphub.ca/repair/${city.slug}` },
  ];

  const costCol =
    city.costTier === 'lower-mainland'
      ? 'lowerMainland'
      : city.costTier === 'island'
      ? 'island'
      : 'interior';

  const costLabel =
    city.costTier === 'lower-mainland'
      ? 'Lower Mainland'
      : city.costTier === 'island'
      ? 'Vancouver Island'
      : 'Interior BC';

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary-600">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/repair" className="hover:text-primary-600">Heat Pump Repair</Link>
          <span className="mx-2">/</span>
          <span>{city.name}</span>
        </nav>

        {/* Header */}
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Heat Pump Repair in {city.name}, BC
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Pre-call emergency checklist, symptom guide, {costLabel} repair costs, and licensed technicians in {city.name}.
        </p>

        {/* Emergency banner */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-10 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <p className="font-bold text-red-900">Emergency service needed?</p>
            <p className="text-sm text-red-800 mt-1">
              Work through the checklist below first — about 1 in 5 service calls turns out to be a tripped breaker, clogged filter, or thermostat setting.
            </p>
          </div>
          <Link
            href="/directory"
            className="shrink-0 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors"
          >
            Find a Technician →
          </Link>
        </div>

        {/* Climate context */}
        <div className="bg-blue-50 border-l-4 border-primary-500 rounded-r-xl p-6 mb-10">
          <h2 className="font-bold text-gray-900 mb-2 text-lg">
            {city.climateHeadline}
          </h2>
          <p className="text-gray-700 text-sm leading-relaxed mb-4">
            {city.climateRepairNote}
          </p>
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
              Most common {city.name} repair issues
            </p>
            <ul className="space-y-1">
              {city.topRepairIssues.map((issue, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-800">
                  <span className="text-primary-600 font-bold mt-0.5">{i + 1}.</span>
                  {issue}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Pre-call checklist */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Before You Call a Technician
          </h2>
          <p className="text-gray-600 text-sm mb-5">
            Run through these steps first. They resolve ~20% of service calls and save you a diagnostic fee.
          </p>
          <div className="space-y-3">
            {preCallChecklist.map((item, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 flex gap-4">
                <div className="shrink-0 w-7 h-7 rounded-full bg-primary-100 text-primary-700 font-bold text-sm flex items-center justify-center mt-0.5">
                  {i + 1}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm mb-1">{item.step}</p>
                  <p className="text-gray-600 text-sm">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Symptom guide */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Symptom Guide
          </h2>
          <p className="text-gray-600 text-sm mb-5">
            Common heat pump symptoms, likely causes, and what to try before calling.
          </p>
          <div className="space-y-3">
            {symptomTable.map((row, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <h3 className="font-bold text-gray-900">{row.symptom}</h3>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0 ${urgencyColors[row.urgency]}`}>
                    {urgencyLabel[row.urgency]} priority
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                  <div className="p-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Likely Cause</p>
                    <p className="text-sm text-gray-700">{row.likelyCause}</p>
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Try First</p>
                    <p className="text-sm text-gray-700">{row.diyStep}</p>
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Call If...</p>
                    <p className="text-sm text-gray-700">{row.callIf}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Repair cost table */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Repair Costs in {city.name} ({new Date().getFullYear()})
          </h2>
          <p className="text-gray-600 text-sm mb-5">
            Typical {costLabel} labour and parts rates. Emergency or after-hours calls add $150–$250 to any service visit.
          </p>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-5 py-3 font-semibold text-gray-700">Repair</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-700">{costLabel}</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-700 hidden md:table-cell">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {repairCosts.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-900">{row.repair}</td>
                      <td className="px-5 py-3 text-primary-700 font-semibold">{row[costCol]}</td>
                      <td className="px-5 py-3 text-gray-600 text-xs hidden md:table-cell">{row.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Costs include parts and labour. Brand-specific parts (Mitsubishi, Daikin, Fujitsu) may run higher. Always get a written estimate before authorizing work.
          </p>
        </div>

        {/* Contractors */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Heat Pump Technicians in {city.name}
          </h2>
          <p className="text-gray-600 text-sm mb-5">
            Licensed contractors serving {city.name}. Always confirm they hold a current Technical Safety BC refrigeration licence before booking.
          </p>
          {listings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {listings.map(listing => (
                <CompanyCard key={listing.slug} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
              <p className="text-gray-600 mb-4">
                No contractors currently listed for {city.name}. Browse the full directory to find technicians serving your area.
              </p>
              <Link
                href="/directory"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Browse All BC Technicians →
              </Link>
            </div>
          )}
          {listings.length > 0 && (
            <div className="mt-5 text-center">
              <Link href="/directory" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                View full BC contractor directory →
              </Link>
            </div>
          )}
        </div>

        {/* Brand repair links */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-10">
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            Brand-Specific Repair for {city.name}
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Looking for a technician certified on a specific brand? Use the brand pages to find authorized dealers and service technicians.
          </p>
          <div className="flex flex-wrap gap-2">
            {brandRepairLinks.map(brand => (
              <Link
                key={brand.slug}
                href={`/brands/${brand.slug}`}
                className="inline-flex items-center gap-1 bg-primary-50 hover:bg-primary-100 text-primary-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {brand.name} dealers in BC →
              </Link>
            ))}
          </div>
        </div>

        {/* Related guides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <Link
            href="/service"
            className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
          >
            <h3 className="font-bold text-gray-900 mb-1">Full Service Guide</h3>
            <p className="text-sm text-gray-600">DIY maintenance schedule, when to repair vs. replace, and how to verify technician credentials.</p>
          </Link>
          <Link
            href="/guides/heat-pump-home-assessment-checklist-bc"
            className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
          >
            <h3 className="font-bold text-gray-900 mb-1">Home Assessment Checklist</h3>
            <p className="text-sm text-gray-600">If your heat pump is underperforming (not failing), walk through this 30-minute assessment before calling.</p>
          </Link>
          <Link
            href={`/bc/${city.regionSlug}/${city.slug}`}
            className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
          >
            <h3 className="font-bold text-gray-900 mb-1">{city.name} Install Guide</h3>
            <p className="text-sm text-gray-600">Climate data, installation costs, and recommended systems for {city.name} homeowners.</p>
          </Link>
        </div>

        <div className="disclaimer">
          <p className="font-semibold mb-2">Disclaimer</p>
          <p>
            Repair cost estimates are illustrative based on 2026 BC market data. Actual costs depend on brand, part availability, and access complexity. Always obtain a written estimate before authorizing repairs. Refrigerant and electrical work legally requires licensed technicians under Technical Safety BC regulations.
          </p>
        </div>
      </div>
    </>
  );
}
