/**
 * sync-airtable.mjs
 *
 * Fetches all contractor records from Airtable and writes src/data/directory.json.
 * Run manually:  node scripts/sync-airtable.mjs
 * Vercel build:  node scripts/sync-airtable.mjs && next build
 *
 * Required env vars (set in .env.local for local dev, Vercel project settings for CI):
 *   AIRTABLE_API_KEY   – Personal access token from airtable.com/create/tokens
 *   AIRTABLE_BASE_ID   – Found in the Airtable API docs URL: airtable.com/appXXXXXX/api/docs
 *
 * Airtable table name: "Contractors"
 * Field names must exactly match those listed in mapRecord() below.
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
const TABLE_NAME = 'Contractors';

if (!API_KEY || !BASE_ID) {
  console.error('❌  Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID');
  console.error('    Add them to .env.local (local) or Vercel project settings (CI).');
  process.exit(1);
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
// Airtable field names used below MUST match your table's field names exactly.
// Multi-select fields (services, brands_supported) are returned as string[].
// Checkbox fields are boolean.
// Single-select fields (region, emergency_service, tsbc_license_status) are strings.

function mapRecord(record) {
  const f = record.fields;

  // Reassemble specialties object from flat Airtable checkboxes
  const specialties = {};
  if (f.ems_certified)    specialties.ems_certified    = true;
  if (f.strata_approved)  specialties.strata_approved  = true;
  if (f.cold_climate_pro) specialties.cold_climate_pro = true;

  // source_urls stored as Long text, one URL per line
  const source_urls = f.source_urls
    ? f.source_urls.split('\n').map(u => u.trim()).filter(Boolean)
    : [];

  const listing = {
    company_name:            f.company_name            ?? '',
    slug:                    f.slug                    ?? '',
    website:                 f.website                 ?? '',
    phone:                   f.phone                   ?? '',
    city:                    f.city                    ?? '',
    region:                  f.region                  ?? '',
    province:                'BC',
    services:                f.services                ?? [],
    emergency_service:       f.emergency_service       ?? 'unknown',
    brands_supported:        f.brands_supported        ?? [],
    notes:                   f.notes                   ?? '',
    source_urls,
    tsbc_verified:           f.tsbc_verified            ?? false,
    tsbc_fsr_license:        f.tsbc_fsr_license         ?? '',
    tsbc_gas_license:        f.tsbc_gas_license         ?? '',
    tsbc_electrical_license: f.tsbc_electrical_license  ?? '',
    tsbc_license_status:     f.tsbc_license_status      ?? 'unknown',
    tsbc_enforcement_actions: f.tsbc_enforcement_actions ?? 0,
    tsbc_last_verified:      f.tsbc_last_verified        ?? '',
    service_reliability:     null,
  };

  if (Object.keys(specialties).length > 0) {
    listing.specialties = specialties;
  }

  return listing;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\nSyncing contractors from Airtable base ${BASE_ID}...`);

  const records = await fetchAllRecords();
  const listings = records
    .map(mapRecord)
    .filter(l => l.slug) // skip any records with empty slug
    .sort((a, b) => a.company_name.localeCompare(b.company_name));

  const outputPath = join(__dirname, '../src/data/directory.json');
  writeFileSync(outputPath, JSON.stringify(listings, null, 2));

  console.log(`✓ Wrote ${listings.length} listings → src/data/directory.json\n`);
}

main().catch(err => {
  console.error('\n❌ Sync failed:', err.message);
  process.exit(1);
});
