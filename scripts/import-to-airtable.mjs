/**
 * import-to-airtable.mjs
 *
 * Reads scripts/airtable-import.csv and creates records in Airtable,
 * setting Status = "Published" for all entries.
 *
 * Run: node scripts/import-to-airtable.mjs
 *
 * Required env vars: AIRTABLE_API_KEY, AIRTABLE_BASE_ID (same as sync script)
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Load .env.local ───────────────────────────────────────────────────────────
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
  process.exit(1);
}

// ── Reverse service mapping (enum → Airtable label) ───────────────────────────
const SERVICE_LABELS = {
  heat_pumps:   'Heat Pumps',
  hybrid:       'Hybrid Systems',
  boilers:      'Boilers',
  air_to_water: 'Air-to-Water',
};

// ── Parse CSV (handles quoted fields with commas) ─────────────────────────────
function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = parseLine(lines[0]);
  return lines.slice(1).map(line => {
    const values = parseLine(line);
    const row = {};
    headers.forEach((h, i) => { row[h] = values[i] ?? ''; });
    return row;
  });
}

function parseLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}

// ── Map CSV row → Airtable fields ─────────────────────────────────────────────
function mapRow(row) {
  // Services: "heat_pumps, hybrid" → ["Heat Pumps", "Hybrid Systems"]
  const serviceEnums = row.services
    ? row.services.split(',').map(s => s.trim()).filter(Boolean)
    : [];
  const services = serviceEnums.map(e => SERVICE_LABELS[e]).filter(Boolean);

  // Brands: "Mitsubishi, Daikin" → ["Mitsubishi", "Daikin"]
  const brands = row.brands_supported
    ? row.brands_supported.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  const fields = {
    'Company Name': row.company_name,
    'Website':      row.website,
    'Phone':        row.phone,
    'City':         row.city,
    'Status':       '📋 Published',
  };

  if (row.region) {
    fields['Lower Mainland, Vancouver Island, Interior, Northern BC'] = row.region;
  }
  if (services.length) {
    fields['Heat Pumps, Air-to-Water, Boilers, Hybrid Systems, Ground Source, Pool Heating, Snow Melt'] = services;
  }
  if (row.emergency_service && row.emergency_service !== 'unknown') {
    fields['Emergency Service'] = row.emergency_service === 'yes' ? 'Yes' : 'No';
  }
  if (brands.length) {
    fields['Brand Support'] = brands.join(', ');
  }

  // Extract service area prefix from notes if present
  const notesText = row.notes ?? '';
  const saMatch = notesText.match(/^Service area: ([^.]+)\./);
  if (saMatch) {
    fields['Service Area'] = saMatch[1].trim();
    const remainder = notesText.slice(saMatch[0].length).trim();
    if (remainder) fields['Admin Notes'] = remainder;
  } else if (notesText) {
    fields['Admin Notes'] = notesText;
  }

  if (row.tsbc_fsr_license)        fields['FSR License']        = row.tsbc_fsr_license;
  if (row.tsbc_gas_license)        fields['Gas Fitter License'] = row.tsbc_gas_license;
  if (row.tsbc_electrical_license) fields['Electrical License'] = row.tsbc_electrical_license;

  return fields;
}

// ── POST a batch of up to 10 records ─────────────────────────────────────────
async function createBatch(records) {
  const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ records: records.map(fields => ({ fields })) }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Airtable ${res.status}: ${body}`);
  }
  return res.json();
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const csvPath = join(__dirname, 'airtable-import.csv');
  if (!existsSync(csvPath)) {
    console.error('❌  scripts/airtable-import.csv not found');
    process.exit(1);
  }

  const rows = parseCSV(readFileSync(csvPath, 'utf-8'));
  console.log(`\nImporting ${rows.length} contractors → Airtable base ${BASE_ID}...\n`);

  const fieldSets = rows.map(mapRow).filter(f => f['Company Name']);

  let created = 0;
  const BATCH = 10;

  for (let i = 0; i < fieldSets.length; i += BATCH) {
    const batch = fieldSets.slice(i, i + BATCH);
    await createBatch(batch);
    created += batch.length;
    process.stdout.write(`  created ${created} / ${fieldSets.length}...\r`);
    // Airtable rate limit: 5 req/s — wait 250ms between batches
    if (i + BATCH < fieldSets.length) {
      await new Promise(r => setTimeout(r, 250));
    }
  }

  console.log(`\n✓ Imported ${created} records with Status = "Published"\n`);
  console.log('Now run: npm run sync-airtable\n');
}

main().catch(err => {
  console.error('\n❌ Import failed:', err.message);
  process.exit(1);
});
