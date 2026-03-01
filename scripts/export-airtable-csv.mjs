/**
 * export-airtable-csv.mjs
 *
 * Exports ALL records from Airtable (all statuses) to scripts/airtable-backup.csv
 *
 * Run:  node scripts/export-airtable-csv.mjs
 */

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Load .env.local ────────────────────────────────────────────────────────────
const envPath = join(__dirname, '../.env.local');
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
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
const TABLE   = 'Submissions';

if (!API_KEY || !BASE_ID) {
  console.error('❌  Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID');
  process.exit(1);
}

// ── Fetch all records (paginated) ─────────────────────────────────────────────
async function fetchAll() {
  const records = [];
  let offset = null;
  do {
    const url = new URL(`https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE)}`);
    if (offset) url.searchParams.set('offset', offset);
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });
    if (!res.ok) throw new Error(`Airtable ${res.status}: ${await res.text()}`);
    const data = await res.json();
    records.push(...data.records);
    offset = data.offset ?? null;
    process.stdout.write(`  fetched ${records.length} records...\r`);
  } while (offset);
  console.log(`  fetched ${records.length} records total.   `);
  return records;
}

// ── CSV helpers ────────────────────────────────────────────────────────────────
function csvCell(val) {
  if (val === null || val === undefined) return '';
  const s = Array.isArray(val) ? val.join('; ') : String(val);
  return `"${s.replace(/"/g, '""')}"`;
}

// ── Main ───────────────────────────────────────────────────────────────────────
const COLUMNS = [
  'Company Name',
  'Phone',
  'Website',
  'City',
  'Province',
  'Status',
  'TSBC Verification Status',
  'FSR License',
  'Gas Fitter License',
  'Electrical License',
  'License Status',
  'Enforcement Actions',
  'Services',
  'Brands',
  'Notes',
  'Audience',
];

console.log('📋  Exporting all Airtable records → CSV\n');
const records = await fetchAll();

const rows = records.map(r => {
  const f = r.fields;
  return COLUMNS.map(col => csvCell(f[col])).join(',');
});

const csv = [COLUMNS.join(','), ...rows].join('\n');
const outPath = join(__dirname, 'airtable-backup.csv');
writeFileSync(outPath, csv, 'utf-8');

console.log(`\n✅  Wrote ${records.length} records → scripts/airtable-backup.csv`);

// Summary breakdown by status
const byStatus = {};
for (const r of records) {
  const s = r.fields['Status'] ?? '(none)';
  byStatus[s] = (byStatus[s] ?? 0) + 1;
}
console.log('\n   By status:');
for (const [s, n] of Object.entries(byStatus).sort((a, b) => b[1] - a[1])) {
  console.log(`     ${s.padEnd(20)} ${n}`);
}
