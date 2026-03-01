/**
 * push-enrichment.mjs
 *
 * Reads scripts/enriched-contractors.csv and PATCHes Airtable with the
 * enriched data. Run AFTER npm run setup-schema has created the fields.
 *
 * Usage:
 *   node scripts/push-enrichment.mjs
 *   node scripts/push-enrichment.mjs --dry-run
 *   node scripts/push-enrichment.mjs --only=website,email   # specific fields only
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CSV_PATH  = join(__dirname, 'enriched-contractors.csv');

const argv    = process.argv.slice(2);
const DRY_RUN = argv.includes('--dry-run');
const onlyArg = argv.find(a => a.startsWith('--only='));
const ONLY_FIELDS = onlyArg ? onlyArg.split('=')[1].split(',') : null;

// ── Env ───────────────────────────────────────────────────────────────────────
const envCandidates = [join(__dirname, '../.env.local'), join(__dirname, '../../../../.env.local')];
for (const p of envCandidates) {
  if (!existsSync(p)) continue;
  for (const line of readFileSync(p, 'utf-8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq < 0) continue;
    const k = t.slice(0, eq).trim();
    const v = t.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (k && !process.env[k]) process.env[k] = v;
  }
  break;
}

const API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_BASE_ID;
const TABLE   = 'Submissions';

if (!API_KEY || !BASE_ID) { console.error('❌  Missing env vars'); process.exit(1); }

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── CSV parse ─────────────────────────────────────────────────────────────────
function parseCSVLine(line) {
  const fields = []; let field = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { if (inQ && line[i+1] === '"') { field += '"'; i++; } else inQ = !inQ; }
    else if (ch === ',' && !inQ) { fields.push(field); field = ''; }
    else field += ch;
  }
  fields.push(field);
  return fields;
}

function loadCSV(path) {
  const lines = readFileSync(path, 'utf-8').trim().split('\n');
  const headers = parseCSVLine(lines[0]);
  return lines.slice(1).map(line => {
    const vals = parseCSVLine(line);
    const row = {};
    headers.forEach((h, i) => { row[h] = vals[i] ?? ''; });
    return row;
  });
}

// ── Airtable field mapping ────────────────────────────────────────────────────
// CSV column → Airtable field name
const FIELD_MAP = {
  province:       'Province',
  website:        'Website',
  email:          'Email',
  fsr_license:    'FSR License',
  gas_license:    'Gas Fitter License',
  license_status: 'License Status',
  services:       'Services',       // multi-select: split on "; "
  audience:       'Audience',       // multi-select: split on "; "
  brands:         'Brands',
  notes:          'Notes',
};

const MULTI_SELECT_FIELDS = new Set(['services', 'audience']);

function buildFields(row) {
  const fields = {};
  for (const [csvCol, airtableField] of Object.entries(FIELD_MAP)) {
    if (ONLY_FIELDS && !ONLY_FIELDS.includes(csvCol)) continue;
    const val = row[csvCol]?.trim();
    if (!val) continue;
    if (MULTI_SELECT_FIELDS.has(csvCol)) {
      fields[airtableField] = val.split(';').map(s => s.trim()).filter(Boolean);
    } else {
      fields[airtableField] = val;
    }
  }
  return fields;
}

// ── PATCH ─────────────────────────────────────────────────────────────────────
async function flushUpdates(updates) {
  const BATCH = 10;
  let patched = 0;
  for (let i = 0; i < updates.length; i += BATCH) {
    const batch = updates.slice(i, i + BATCH);
    const res = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE)}`,
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ typecast: true, records: batch }),
      }
    );
    if (!res.ok) {
      console.error(`  ⚠️  batch ${i/BATCH+1} failed: ${(await res.text()).slice(0, 200)}`);
    } else {
      patched += batch.length;
      process.stdout.write(`  patched ${patched}/${updates.length}...\r`);
    }
    await sleep(250);
  }
  console.log(`  patched ${patched}/${updates.length} records.   `);
  return patched;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n📤  Push Enrichment → Airtable');
  if (DRY_RUN)    console.log('    DRY RUN\n');
  if (ONLY_FIELDS) console.log(`    Fields: ${ONLY_FIELDS.join(', ')}\n`);

  if (!existsSync(CSV_PATH)) {
    console.error('❌  enriched-contractors.csv not found. Run web-enrich.mjs first.');
    process.exit(1);
  }

  const rows = loadCSV(CSV_PATH);
  console.log(`  Loaded ${rows.length} rows from enriched-contractors.csv`);

  // Build PATCH updates — skip rows with no enrichable data
  const updates = [];
  for (const row of rows) {
    if (!row.airtable_id) continue;
    const fields = buildFields(row);
    if (Object.keys(fields).length === 0) continue;
    updates.push({ id: row.airtable_id, fields });
  }

  console.log(`  ${updates.length} records have data to push\n`);

  // Breakdown
  const counts = {};
  for (const u of updates) {
    for (const k of Object.keys(u.fields)) {
      counts[k] = (counts[k] ?? 0) + 1;
    }
  }
  console.log('  Fields to write:');
  for (const [f, n] of Object.entries(counts).sort((a,b) => b[1]-a[1])) {
    console.log(`    ${f.padEnd(25)} ${n}`);
  }
  console.log('');

  if (!DRY_RUN && updates.length > 0) {
    await flushUpdates(updates);
  } else if (DRY_RUN) {
    updates.slice(0, 5).forEach(u =>
      console.log(`  WOULD patch ${u.id}: ${JSON.stringify(u.fields).slice(0, 80)}`)
    );
    if (updates.length > 5) console.log(`  ... and ${updates.length - 5} more`);
  }

  console.log('\n✅  Done.\n');
}

main().catch(err => { console.error('\n❌ ', err.message); process.exit(1); });
