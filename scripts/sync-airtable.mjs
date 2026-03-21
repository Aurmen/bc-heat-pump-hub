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

// ── Load CSV fallback for services/notes data (lost during Airtable import) ───
function loadCSVFallback(csvPath) {
  if (!existsSync(csvPath)) return {};
  const lines = readFileSync(csvPath, 'utf-8').trim().split('\n');
  const headers = parseCSVLine(lines[0]);
  const map = {};
  for (const line of lines.slice(1)) {
    const vals = parseCSVLine(line);
    const row = {};
    headers.forEach((h, i) => { row[h] = vals[i] ?? ''; });
    if (row.company_name) map[row.company_name.toLowerCase().trim()] = row;
  }
  return map;
}

function parseCSVLine(line) {
  const fields = [];
  let cur = '', inQ = false;
  for (const ch of line) {
    if (ch === '"') { inQ = !inQ; }
    else if (ch === ',' && !inQ) { fields.push(cur); cur = ''; }
    else { cur += ch; }
  }
  fields.push(cur);
  return fields;
}

const CSV_SERVICE_MAP = {
  'heat_pumps': 'heat_pumps', 'hybrid': 'hybrid',
  'boilers': 'boilers', 'air_to_water': 'air_to_water',
};

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

function mapRecord(record, csvFallback) {
  const f = record.fields;
  const csvRow = csvFallback[(f['Company Name'] ?? '').toLowerCase().trim()] ?? {};

  // Services: Airtable multi-select got scrambled during import ("Multiple") —
  // fall back to original CSV data if Airtable has no valid values.
  const rawAirtable = Array.isArray(f['Heat Pumps, Air-to-Water, Boilers, Hybrid Systems, Ground Source, Pool Heating, Snow Melt'])
    ? f['Heat Pumps, Air-to-Water, Boilers, Hybrid Systems, Ground Source, Pool Heating, Snow Melt']
    : [];
  const airtableServices = [...new Set(rawAirtable.map(s => SERVICE_MAP[s]).filter(Boolean))];
  const csvServices = csvRow.services
    ? csvRow.services.split(',').map(s => CSV_SERVICE_MAP[s.trim()]).filter(Boolean)
    : [];
  const services = airtableServices.length ? airtableServices : [...new Set(csvServices)];

  // Region: ended up in the Address field after CSV import mapping error.
  // Fall back to CSV if Address is missing or "unknown".
  const regionRaw = f['Address'] ?? '';
  const region = (regionRaw && regionRaw !== 'unknown') ? regionRaw : (csvRow.region ?? '');

  // Notes: ended up in Emergency Service field after CSV import mapping error.
  const notesFromAirtable = f['Emergency Service'] ?? '';
  const notesValid = notesFromAirtable && notesFromAirtable !== 'unknown' && notesFromAirtable.length > 5;
  const notes = notesValid ? notesFromAirtable : (csvRow.notes ?? '');

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
    region,
    province:                 'BC',
    services,
    emergency_service:        f['Emergency Service']     ?? 'unknown',
    brands_supported:         typeof f['Brand Support'] === 'string'
                                ? f['Brand Support'].split(',').map(s => s.trim()).filter(Boolean)
                                : (f['Brand Support'] ?? []),
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

// ── Geographic buckets — city keyword → {region, cap} ────────────────────────
//
// City names in Airtable are free-text, so we match by substring (lowercase).
// Order matters: more specific entries should come before broad ones.
const CITY_BUCKETS = [
  // Lower Mainland — 275 total
  { keywords: ['vancouver'],          region: 'lower-mainland', cap: 80  },
  { keywords: ['surrey'],             region: 'lower-mainland', cap: 55  },
  { keywords: ['burnaby'],            region: 'lower-mainland', cap: 35  },
  { keywords: ['richmond'],           region: 'lower-mainland', cap: 30  },
  { keywords: ['coquitlam', 'port coquitlam', 'port moody'], region: 'lower-mainland', cap: 20 },
  { keywords: ['north vancouver', 'west vancouver', 'north van'], region: 'lower-mainland', cap: 20 },
  { keywords: ['langley'],            region: 'lower-mainland', cap: 15  },
  { keywords: ['abbotsford'],         region: 'lower-mainland', cap: 8   },
  { keywords: ['chilliwack'],         region: 'lower-mainland', cap: 4   },
  { keywords: ['delta', 'maple ridge', 'new westminster', 'white rock', 'mission', 'pitt meadows', 'aldergrove', 'cloverdale'],
                                      region: 'lower-mainland', cap: 8   },
  // Vancouver Island — 100 total
  { keywords: ['victoria', 'saanich', 'oak bay', 'esquimalt', 'langford', 'colwood', 'sidney', 'view royal', 'sooke'],
                                      region: 'vancouver-island', cap: 45 },
  { keywords: ['nanaimo'],            region: 'vancouver-island', cap: 25 },
  { keywords: ['courtenay', 'comox'], region: 'vancouver-island', cap: 10 },
  { keywords: ['campbell river'],     region: 'vancouver-island', cap: 10 },
  { keywords: ['duncan', 'parksville', 'qualicum', 'port alberni', 'ladysmith', 'chemainus'],
                                      region: 'vancouver-island', cap: 10 },
  // Interior BC — 100 total
  { keywords: ['kelowna', 'west kelowna', 'lake country', 'rutland'],
                                      region: 'interior', cap: 35 },
  { keywords: ['kamloops'],           region: 'interior', cap: 25 },
  { keywords: ['vernon'],             region: 'interior', cap: 15 },
  { keywords: ['penticton'],          region: 'interior', cap: 15 },
  { keywords: ['salmon arm', 'revelstoke', 'merritt', 'trail', 'cranbrook', 'castlegar', 'nelson'],
                                      region: 'interior', cap: 10 },
  // Northern BC — 25 total
  { keywords: ['prince george'],      region: 'northern', cap: 15 },
  { keywords: ['fort st. john', 'fort st john', 'dawson creek', 'terrace', 'smithers', 'quesnel', 'williams lake', 'prince rupert'],
                                      region: 'northern', cap: 10 },
];

/** Score a listing by data completeness (higher = more complete) */
function scoreListings(listing) {
  let score = 0;
  if (listing.phone)                    score += 2;
  if (listing.website)                  score += 2;
  if (listing.services?.length)         score += 1;
  if (listing.notes?.length > 5)        score += 1;
  return score;
}

/** Assign a bucket index (priority order) to a listing based on its city */
function assignBucket(city) {
  const c = (city ?? '').toLowerCase();
  for (let i = 0; i < CITY_BUCKETS.length; i++) {
    if (CITY_BUCKETS[i].keywords.some(k => c.includes(k))) return i;
  }
  return -1; // unmatched — goes to overflow pool
}

/**
 * Select the top 500 listings using geographic bucketing.
 * Within each bucket, listings are ranked by data completeness score.
 * Any remaining slots after all buckets are filled go to best-scored overflow.
 */
function selectTop500(listings) {
  const TOTAL_CAP = 500;
  const scored = listings.map(l => ({ ...l, _score: scoreListings(l), _bucket: assignBucket(l.city) }));

  // Group by bucket index
  const buckets = {};
  const overflow = [];
  for (const l of scored) {
    if (l._bucket === -1) { overflow.push(l); continue; }
    (buckets[l._bucket] ??= []).push(l);
  }

  const selected = [];

  // Fill each bucket up to its cap (best-scored first)
  for (let i = 0; i < CITY_BUCKETS.length; i++) {
    const pool = (buckets[i] ?? []).sort((a, b) => b._score - a._score);
    const take = Math.min(pool.length, CITY_BUCKETS[i].cap);
    selected.push(...pool.slice(0, take));
  }

  // Fill remaining slots from overflow (unmatched cities), best-scored first
  const remaining = TOTAL_CAP - selected.length;
  if (remaining > 0) {
    const pool = overflow.sort((a, b) => b._score - a._score);
    selected.push(...pool.slice(0, remaining));
  }

  // Log summary
  const byRegion = {};
  for (const l of selected) {
    const r = l._bucket === -1 ? 'other' : CITY_BUCKETS[l._bucket].region;
    byRegion[r] = (byRegion[r] ?? 0) + 1;
  }
  console.log(`  Geographic distribution (${selected.length} selected):`);
  for (const [region, count] of Object.entries(byRegion)) {
    console.log(`    ${region}: ${count}`);
  }

  // Strip internal scoring fields before writing
  return selected.map(({ _score, _bucket, ...l }) => l);
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\nSyncing contractors from Airtable base ${BASE_ID}...`);

  const records = await fetchAllRecords();

  // Include any record that is TSBC-verified (regardless of Published/Needs Review status)
  // TSBC verification is the source of truth — if they're licensed, they're on the site.
  // Explicitly excluded: records with Status = "Rejected" or "Spam".
  const excluded = ['Rejected', 'Spam'];
  const candidates = records.filter(r => {
    const status = r.fields['Status'] ?? '';
    return !excluded.some(s => status.includes(s));
  });
  console.log(`  ${candidates.length} of ${records.length} records are eligible (not Rejected/Spam)`);

  // Load CSV fallback for services/region lost during Airtable import
  const csvFallback = loadCSVFallback(join(__dirname, 'airtable-import.csv'));
  if (Object.keys(csvFallback).length) {
    console.log(`  loaded CSV fallback with ${Object.keys(csvFallback).length} entries`);
  }

  // Map to listings — only include TSBC-verified contractors with clean records
  const listings = candidates
    .map(r => mapRecord(r, csvFallback))
    .filter(l => l.company_name)
    .filter(l => l.tsbc_verified)
    .filter(l => (l.tsbc_enforcement_actions ?? 0) === 0);

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

  // ── Geographic bucketing — keep top 500 by region/city priority ─────────────
  const selected = selectTop500(listings);
  selected.sort((a, b) => a.company_name.localeCompare(b.company_name));

  // ── Merge pinned listings (never overwritten by Airtable sync) ───────────────
  const pinnedPath = join(__dirname, '../src/data/pinned-listings.json');
  const pinned = existsSync(pinnedPath) ? JSON.parse(readFileSync(pinnedPath, 'utf-8')) : [];
  // Remove any Airtable entries whose slug collides with a pinned slug
  const pinnedSlugs = new Set(pinned.map(p => p.slug));
  const deduped = selected.filter(l => !pinnedSlugs.has(l.slug));
  const final = [...pinned, ...deduped];

  const outputPath = join(__dirname, '../src/data/directory.json');
  writeFileSync(outputPath, JSON.stringify(final, null, 2));

  console.log(`✓ Wrote ${final.length} listings (${pinned.length} pinned + ${deduped.length} TSBC-verified) → src/data/directory.json\n`);
}

main().catch(err => {
  console.error('\n❌ Sync failed:', err.message);
  process.exit(1);
});
