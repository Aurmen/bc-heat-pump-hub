/**
 * setup-airtable-schema.mjs
 *
 * Creates all missing fields in the Airtable "Submissions" table needed for
 * contractor data enrichment. Safe to re-run — skips fields that already exist.
 *
 * Requires API token with scope: schema.bases:write
 * → airtable.com/create/tokens
 *
 * Usage:
 *   node scripts/setup-airtable-schema.mjs
 *   node scripts/setup-airtable-schema.mjs --dry-run
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DRY_RUN = process.argv.includes('--dry-run');

// ── Load .env.local ───────────────────────────────────────────────────────────
const candidates = [join(__dirname, '../.env.local'), join(__dirname, '../../../../.env.local')];
for (const p of candidates) {
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
const TABLE_NAME = 'Submissions';

if (!API_KEY || !BASE_ID) {
  console.error('❌  Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID');
  process.exit(1);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Fields to create ──────────────────────────────────────────────────────────
// Airtable field type reference:
//   singleLineText, multilineText, url, number, checkbox,
//   singleSelect, multipleSelects, date, email, phoneNumber
const DESIRED_FIELDS = [
  { name: 'Province',          type: 'singleLineText' },
  { name: 'Website',           type: 'url' },
  { name: 'FSR License',       type: 'singleLineText' },
  { name: 'Gas Fitter License',type: 'singleLineText' },
  { name: 'Electrical License',type: 'singleLineText' },
  { name: 'Notes',             type: 'multilineText' },
  {
    name: 'Services',
    type: 'multipleSelects',
    options: {
      choices: [
        { name: 'Heat Pumps' },
        { name: 'Boilers' },
        { name: 'Hybrid Systems' },
        { name: 'Air-to-Water' },
        { name: 'Ground Source' },
        { name: 'Pool Heating' },
      ],
    },
  },
  {
    name: 'Audience',
    type: 'multipleSelects',
    options: {
      choices: [
        { name: 'Residential' },
        { name: 'Commercial' },
      ],
    },
  },
];

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🔧  Airtable Schema Setup');
  if (DRY_RUN) console.log('    DRY RUN — no changes will be made\n');

  // Step 1: get table ID and existing fields via meta API
  console.log('Fetching schema from Airtable meta API...');
  const metaRes = await fetch(
    `https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables`,
    { headers: { Authorization: `Bearer ${API_KEY}` } }
  );
  const meta = await metaRes.json();

  if (!metaRes.ok || !meta.tables) {
    if (meta.error?.type === 'INVALID_PERMISSIONS_OR_MODEL_NOT_FOUND') {
      console.error('\n❌  Token missing schema.bases:read scope.');
      console.error('    → airtable.com/create/tokens — add schema.bases:write and try again.');
    } else {
      console.error('\n❌  Meta API error:', JSON.stringify(meta).slice(0, 300));
    }
    process.exit(1);
  }

  const table = meta.tables.find(t => t.name === TABLE_NAME);
  if (!table) {
    console.error(`❌  Table "${TABLE_NAME}" not found. Tables: ${meta.tables.map(t => t.name).join(', ')}`);
    process.exit(1);
  }

  const tableId = table.id;
  const existingNames = new Set(table.fields.map(f => f.name));
  console.log(`  Table ID: ${tableId}`);
  console.log(`  Existing fields (${existingNames.size}): ${[...existingNames].join(', ')}\n`);

  // Step 2: create missing fields
  const missing = DESIRED_FIELDS.filter(f => !existingNames.has(f.name));
  if (missing.length === 0) {
    console.log('✅  All required fields already exist — nothing to do.');
    return;
  }

  console.log(`Creating ${missing.length} missing field(s):`);

  for (const field of missing) {
    const body = { name: field.name, type: field.type };
    if (field.options) body.options = field.options;

    process.stdout.write(`  [${field.type.padEnd(18)}] ${field.name} ... `);

    if (DRY_RUN) {
      console.log('(skipped — dry run)');
      continue;
    }

    const res = await fetch(
      `https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables/${tableId}/fields`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (res.ok) {
      const created = await res.json();
      console.log(`✓ (id: ${created.id})`);
    } else {
      const err = await res.json();
      console.log(`⚠️  ${err.error?.message ?? JSON.stringify(err).slice(0, 100)}`);
    }

    await sleep(300); // stay under rate limit
  }

  console.log('\n✅  Schema setup complete.');
  console.log('    Now run: node scripts/enrich-airtable.mjs\n');
}

main().catch(err => {
  console.error('\n❌  Script failed:', err.message);
  process.exit(1);
});
