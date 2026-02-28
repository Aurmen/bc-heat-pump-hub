/**
 * sync-airtable.mjs
 *
 * Fetches all "Published" records from the "Contractor Submissions" table in
 * Airtable and writes src/data/directory.json.
 *
 * Run manually:  node scripts/sync-airtable.mjs
 * Vercel build:  node scripts/sync-airtable.mjs && next build
 *
 * Required env vars (set in .env.local for local dev, Vercel project settings for CI):
 *   AIRTABLE_API_KEY   – Personal access token from airtable.com/create/tokens
 *   AIRTABLE_BASE_ID   – Found in the URL: airtable.com/appXXXXXX/...
 *
 * Only records with Status = "Published" are included in the output.
 */

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Load .env.local for local development ─────────────────────────────────────
const envPath = join(__dirname, '../.env.local');
if (existsSync(envPath)) {
  const lines = readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx < 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    if (key && !process.env[key]) process.env[key] = val;
  }
}

const API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_BASE_ID;
const TABLE_NAME = 'Submissions';

if (!API_KEY || !BASE_ID) {
  console.error('❌  Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID');
  console.error('    Add them to .env.local (local) or Vercel project settings (CI).');
  process.exit(1);
}

// ── Services value mapping ────────────────────────────────────────────────────
// Maps Airtable multi-select labels → DirectoryListing ServiceType values.
// Unknown / non-standard values are silently dropped.
const SERVICE_MAP = {
  'Heat Pumps':     'heat_pumps',
  'Air-to-Water':   'air_to_water',
  'Boilers':        'boilers',
  'Hybrid Systems': 'hybrid',
  'Ground Source':  'heat_pumps', // closest equivalent
};

// ── Slug generation ───────────────────────────────────────────────────────────
function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// ── Fetch all records (paginated) ────────────────────────────────────────────
async function fetchAllRecords() {
  const records = [];
  let offset = null;

  do {
    const url = new URL(
      `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}`
    );
    if (offset) url.searchParams.set('offset', offset);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Airtable ${res.status}: ${body}`);
    }

    const data = await res.json();
    records.push(...data.records);
    offset = data.offset ?? null;
    process.stdout.write(`  fetched ${records.length} records...\r`);
  } while (offset);

  console.log(`  fetched ${records.length} records total.   `);
  return records;
}

// ── Map Airtable record → DirectoryListing ───────────────────────────────────
//
// Field names match the "Contractor Submissions" table exactly.
// Status = "Published" filter is applied in main() before calling this.

function mapRecord(record) {
  const f = record.fields;

  // Map services: translate Airtable labels → ServiceType values, deduplicate
  const rawServices = Array.isArray(f['Heat Pumps, Air-to-Water, Boilers, Hybrid Systems, Ground Source, Pool Heating, Snow Melt'])
    ? f['Heat Pumps, Air-to-Water, Boilers, Hybrid Systems, Ground Source, Pool Heating, Snow Melt']
    : [];
  const services = [...new Set(
    rawServices.map(s => SERVICE_MAP[s]).filter(Boolean)
  )];

  // Prepend service area to notes if present
  const serviceArea = f['Service Area'] ?? '';
  const adminNotes  = f['Admin Notes'] ?? '';
  const notes = [
    serviceArea ? `Service area: ${serviceArea}.` : '',
    adminNotes,
  ].filter(Boolean).join(' ');

  // TSBC verified: map single-select "Verified" → true
  const tsbcStatus = f['TSBC Verification Status'] ?? '';
  const tsbc_verified = tsbcStatus === 'Verified';

  // License status: map to our enum values; default 'unknown'
  const licenseStatusRaw = (f['License Status'] ?? '').toLowerCase().replace(/\s+/g, '_');
  const validStatuses = ['active', 'expiring_soon', 'expired', 'unknown'];
  const tsbc_license_status = validStatuses.includes(licenseStatusRaw)
    ? licenseStatusRaw
    : 'unknown';

  return {
    company_name:             f['Company Name']          ?? '',
    slug:                     '',                         // generated in main()
    website:                  f['Website']               ?? '',
    phone:                    f['Phone']                 ?? '',
    city:                     f['City']                  ?? '',
    region:                   f['Lower Mainland, Vancouver Island, Interior, Northern BC'] ?? '',
    province:                 'BC',
    services,
    emergency_service:        f['Emergency Service']     ?? 'unknown',
    brands_supported:         f['Brand Support']         ?? [],
    notes,
    source_urls:              [],
    tsbc_verified,
    tsbc_fsr_license:         f['FSR License']           ?? '',
    tsbc_gas_license:         f['Gas Fitter License']    ?? '',
    tsbc_electrical_license:  f['Electrical License']    ?? '',
    tsbc_license_status,
    tsbc_enforcement_actions: f['Enforcement Actions']   ?? 0,
    tsbc_last_verified:       '',
    service_reliability:      null,
  };
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\nSyncing contractors from Airtable base ${BASE_ID}...`);

  const records = await fetchAllRecords();

  // Only sync records with Status = "Published"
  const published = records.filter(r => (r.fields['Status'] ?? '').includes('Published'));
  console.log(`  ${published.length} of ${records.length} records have Status = "Published"`);

  // Map to listings
  const listings = published
    .map(mapRecord)
    .filter(l => l.company_name); // skip blank records

  // Generate slugs from company name, deduplicate
  const seen = {};
  for (const l of listings) {
    const base = slugify(l.company_name);
    if (!seen[base]) {
      seen[base] = 1;
      l.slug = base;
    } else {
      l.slug = `${base}-${seen[base]}`;
      seen[base]++;
    }
  }

  listings.sort((a, b) => a.company_name.localeCompare(b.company_name));

  const outputPath = join(__dirname, '../src/data/directory.json');
  writeFileSync(outputPath, JSON.stringify(listings, null, 2));

  console.log(`✓ Wrote ${listings.length} listings → src/data/directory.json\n`);
}

main().catch(err => {
  console.error('\n❌ Sync failed:', err.message);
  process.exit(1);
});
