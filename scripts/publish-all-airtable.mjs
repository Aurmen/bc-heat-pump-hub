/**
 * publish-all-airtable.mjs
 *
 * Sets Status = "Published" on all records in the Submissions table
 * that are not already Published.
 *
 * Run: node scripts/publish-all-airtable.mjs
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

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
const BASE_URL = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}`;
const HEADERS = { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' };

async function fetchAll() {
  const records = [];
  let offset = null;
  do {
    const url = new URL(BASE_URL);
    if (offset) url.searchParams.set('offset', offset);
    const res = await fetch(url.toString(), { headers: HEADERS });
    if (!res.ok) throw new Error(`Airtable ${res.status}: ${await res.text()}`);
    const data = await res.json();
    records.push(...data.records);
    offset = data.offset ?? null;
  } while (offset);
  return records;
}

async function updateBatch(ids) {
  const res = await fetch(BASE_URL, {
    method: 'PATCH',
    headers: HEADERS,
    body: JSON.stringify({
      records: ids.map(id => ({ id, fields: { Status: 'Published' } })),
    }),
  });
  if (!res.ok) throw new Error(`Airtable ${res.status}: ${await res.text()}`);
}

async function main() {
  console.log('\nFetching all records...');
  const all = await fetchAll();
  const toUpdate = all.filter(r => r.fields['Status'] !== 'Published');
  console.log(`  ${all.length} total, ${toUpdate.length} need Status → Published`);

  if (!toUpdate.length) {
    console.log('Nothing to update.\n');
    return;
  }

  let done = 0;
  for (let i = 0; i < toUpdate.length; i += 10) {
    const batch = toUpdate.slice(i, i + 10).map(r => r.id);
    await updateBatch(batch);
    done += batch.length;
    process.stdout.write(`  updated ${done} / ${toUpdate.length}...\r`);
    if (i + 10 < toUpdate.length) await new Promise(r => setTimeout(r, 250));
  }

  console.log(`\n✓ All ${done} records set to Published\n`);
  console.log('Now run: npm run sync-airtable\n');
}

main().catch(err => {
  console.error('\n❌ Failed:', err.message);
  process.exit(1);
});
