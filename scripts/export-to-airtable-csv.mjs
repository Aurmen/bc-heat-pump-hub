/**
 * export-to-airtable-csv.mjs
 *
 * ONE-TIME USE — converts src/data/directory.json to a CSV that Airtable
 * can import directly (Airtable > Import data > CSV file).
 *
 * Run:  node scripts/export-to-airtable-csv.mjs
 * Output: scripts/airtable-import.csv
 *
 * After importing, delete this file and use sync-airtable.mjs going forward.
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const listings = JSON.parse(
  readFileSync(join(__dirname, '../src/data/directory.json'), 'utf-8')
);

// ── Airtable CSV column headers ───────────────────────────────────────────────
// Multi-select fields (services, brands_supported): comma-separated strings
// Airtable reads "heat_pumps, boilers" as two separate multi-select values.
// Checkbox fields: TRUE / FALSE
// source_urls: newline-separated (we encode \n as actual newline inside quotes)

const HEADERS = [
  'company_name',
  'slug',
  'website',
  'phone',
  'city',
  'region',
  'services',
  'emergency_service',
  'brands_supported',
  'notes',
  'source_urls',
  'tsbc_verified',
  'tsbc_fsr_license',
  'tsbc_gas_license',
  'tsbc_electrical_license',
  'tsbc_license_status',
  'tsbc_enforcement_actions',
  'tsbc_last_verified',
  'ems_certified',
  'strata_approved',
  'cold_climate_pro',
];

function escapeCell(value) {
  const str = String(value ?? '');
  // If value contains comma, newline, or double-quote → wrap in quotes and escape inner quotes
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function rowFromListing(l) {
  return [
    escapeCell(l.company_name),
    escapeCell(l.slug),
    escapeCell(l.website),
    escapeCell(l.phone),
    escapeCell(l.city),
    escapeCell(l.region),
    escapeCell((l.services ?? []).join(', ')),
    escapeCell(l.emergency_service ?? 'unknown'),
    escapeCell((l.brands_supported ?? []).join(', ')),
    escapeCell(l.notes ?? ''),
    escapeCell((l.source_urls ?? []).join('\n')),
    escapeCell(l.tsbc_verified ? 'TRUE' : 'FALSE'),
    escapeCell(l.tsbc_fsr_license ?? ''),
    escapeCell(l.tsbc_gas_license ?? ''),
    escapeCell(l.tsbc_electrical_license ?? ''),
    escapeCell(l.tsbc_license_status ?? 'unknown'),
    escapeCell(l.tsbc_enforcement_actions ?? 0),
    escapeCell(l.tsbc_last_verified ?? ''),
    escapeCell(l.specialties?.ems_certified    ? 'TRUE' : 'FALSE'),
    escapeCell(l.specialties?.strata_approved  ? 'TRUE' : 'FALSE'),
    escapeCell(l.specialties?.cold_climate_pro ? 'TRUE' : 'FALSE'),
  ].join(',');
}

const rows = [HEADERS.join(','), ...listings.map(rowFromListing)];
const csv = rows.join('\n');

const outPath = join(__dirname, 'airtable-import.csv');
writeFileSync(outPath, csv);

console.log(`✓ Wrote ${listings.length} rows → scripts/airtable-import.csv`);
console.log(`  Import this file into Airtable: your base > Import data > CSV file`);
