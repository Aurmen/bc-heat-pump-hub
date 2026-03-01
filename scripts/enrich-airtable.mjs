/**
 * enrich-airtable.mjs
 *
 * Enriches Airtable "Submissions" records where TSBC Verification Status = "Verified".
 *
 * Steps (all run by default, or pick one with --step=N):
 *   1  Province → "BC" for all Verified records
 *   2  Services → infer from FSR License (Boilers) / Gas Fitter License (Heat Pumps, Hybrid Systems)
 *   3  Audience → "Residential" by default; add "Commercial" if company name has commercial keywords
 *   4  Website  → search Bing for "{company} {city} BC HVAC", skip directory sites, save CSV first
 *
 * Usage:
 *   node scripts/enrich-airtable.mjs              # all 4 steps
 *   node scripts/enrich-airtable.mjs --step=1     # Province only
 *   node scripts/enrich-airtable.mjs --step=4     # Website only
 *   node scripts/enrich-airtable.mjs --dry-run    # preview without writing
 *   node scripts/enrich-airtable.mjs --limit=20   # first N verified records
 */

import puppeteer from 'puppeteer';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Load .env.local (try multiple paths — supports worktree layout) ───────────
function loadEnv() {
  const candidates = [
    join(__dirname, '../.env.local'),                // standard: project root
    join(__dirname, '../../../../.env.local'),       // from worktree/scripts → project root
    join(__dirname, '../../../.env.local'),
  ];
  for (const p of candidates) {
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, 'utf-8').split('\n')) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      const eq = t.indexOf('=');
      if (eq < 0) continue;
      const key = t.slice(0, eq).trim();
      const val = t.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
      if (key && !process.env[key]) process.env[key] = val;
    }
    console.log(`  Loaded env from ${p}`);
    return;
  }
  console.warn('  ⚠️  No .env.local found — relying on existing env vars');
}
loadEnv();

const API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_BASE_ID;
const TABLE   = 'Submissions';

if (!API_KEY || !BASE_ID) {
  console.error('❌  Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID');
  process.exit(1);
}

// ── CLI flags ─────────────────────────────────────────────────────────────────
const argv      = process.argv.slice(2);
const DRY_RUN   = argv.includes('--dry-run');
const stepArg   = argv.find(a => a.startsWith('--step='));
const ONLY_STEP = stepArg ? parseInt(stepArg.split('=')[1]) : null;
const limitArg  = argv.find(a => a.startsWith('--limit='));
const LIMIT     = limitArg ? parseInt(limitArg.split('=')[1]) : Infinity;

function runStep(n) { return ONLY_STEP === null || ONLY_STEP === n; }
function sleep(ms)  { return new Promise(r => setTimeout(r, ms)); }

// ── Airtable helpers ──────────────────────────────────────────────────────────
async function fetchAllRecords() {
  const records = [];
  let offset = null;
  do {
    const url = new URL(`https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE)}`);
    if (offset) url.searchParams.set('offset', offset);
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });
    if (!res.ok) throw new Error(`Airtable fetch ${res.status}: ${await res.text()}`);
    const data = await res.json();
    records.push(...data.records);
    offset = data.offset ?? null;
    process.stdout.write(`  fetched ${records.length} records...\r`);
  } while (offset);
  console.log(`  fetched ${records.length} total.             `);
  return records;
}

/** PATCH up to 10 records per request, respecting rate limit. */
async function flushUpdates(updates, label = '') {
  const BATCH = 10;
  let patched = 0;
  for (let i = 0; i < updates.length; i += BATCH) {
    const batch = updates.slice(i, i + BATCH);
    const res = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE)}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ typecast: true, records: batch }),
      }
    );
    if (!res.ok) {
      console.error(`  ⚠️  PATCH failed [${label} batch ${i / BATCH + 1}]: ${(await res.text()).slice(0, 200)}`);
    } else {
      patched += batch.length;
      process.stdout.write(`  ${label}: patched ${patched}/${updates.length}...\r`);
    }
    await sleep(250); // Airtable: 5 req/s limit
  }
  console.log(`  ${label}: patched ${patched}/${updates.length} records.   `);
  return patched;
}

// ── Services inference ────────────────────────────────────────────────────────
// FSR License (LBP / LRA) → Boilers
// Gas Fitter License (LGA) → Heat Pumps + Hybrid Systems
function inferServices(fields) {
  const fsr = fields['FSR License']?.trim() ?? '';
  const gas = fields['Gas Fitter License']?.trim() ?? '';
  const svcs = new Set();

  // Preserve anything already set
  const existing = fields['Services'];
  if (Array.isArray(existing)) existing.forEach(s => svcs.add(s));

  if (/^L[BR][AP]\d/i.test(fsr) || fsr.length > 0) svcs.add('Boilers');
  if (/^LGA\d/i.test(gas) || gas.length > 0) {
    svcs.add('Heat Pumps');
    svcs.add('Hybrid Systems');
  }

  return [...svcs];
}

// ── Audience inference ────────────────────────────────────────────────────────
const COMMERCIAL_KEYWORDS = [
  'commercial', 'industrial', 'mechanical', 'contracting', 'systems',
  'solutions', 'services ltd', 'enterprises', 'group', 'corp',
];

function inferAudience(companyName) {
  const lower = companyName.toLowerCase();
  const isCommercial = COMMERCIAL_KEYWORDS.some(kw => lower.includes(kw));
  return isCommercial ? ['Residential', 'Commercial'] : ['Residential'];
}

// ── Website search via Bing (avoids Google CAPTCHA) ──────────────────────────
const DIRECTORY_DOMAINS = [
  'yelp.com', 'yp.ca', 'yellowpages', 'homestars.com', 'houzz.com',
  'facebook.com', 'linkedin.com', 'google.com', 'maps.google', 'bbb.org',
  'canadianheatpumphub.ca', 'kijiji.ca', 'craigslist.org', 'angieslist.com',
  'thumbtack.com', 'bark.com', 'hipages.com', 'trustatrader.com',
  'porch.com', 'angi.com', 'contractorfinder', 'homeadvisor.com',
  'wikipedia.org', 'wikidata.org',
];

function isDirectorySite(url) {
  return DIRECTORY_DOMAINS.some(d => url.toLowerCase().includes(d));
}

async function searchWebsite(page, companyName, city) {
  const query = encodeURIComponent(`"${companyName}" ${city} BC HVAC heat pump`);
  const searchUrl = `https://www.bing.com/search?q=${query}`;

  try {
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await sleep(1000);

    const results = await page.evaluate(() =>
      Array.from(document.querySelectorAll('#b_results .b_algo h2 a'))
        .map(a => ({ href: a.href, text: a.innerText }))
        .filter(r => r.href.startsWith('http'))
    );

    for (const r of results) {
      if (!isDirectorySite(r.href)) {
        // Extract base domain
        try {
          const url = new URL(r.href);
          return url.origin; // e.g. https://example.com
        } catch { continue; }
      }
    }
  } catch (err) {
    console.error(`    Search error for "${companyName}": ${err.message.slice(0, 60)}`);
  }
  return null;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🔧  Airtable Enrichment Script');
  if (DRY_RUN) console.log('    DRY RUN — no Airtable writes\n');
  if (ONLY_STEP) console.log(`    Running step ${ONLY_STEP} only\n`);

  console.log('\nFetching all Airtable records...');
  const all = await fetchAllRecords();

  // Filter to Verified records only
  let verified = all.filter(r => r.fields['TSBC Verification Status'] === 'Verified');
  console.log(`  ${verified.length} Verified records (of ${all.length} total)`);

  if (verified.length > LIMIT) {
    verified = verified.slice(0, LIMIT);
    console.log(`  limited to ${verified.length} records`);
  }

  // ── Step 1: Province ────────────────────────────────────────────────────────
  if (runStep(1)) {
    console.log('\n── Step 1: Province → "BC" ──────────────────────────────');
    const updates = verified
      .filter(r => (r.fields['Province'] ?? '') !== 'BC')
      .map(r => ({ id: r.id, fields: { Province: 'BC' } }));

    console.log(`  ${updates.length} records need Province set`);
    if (!DRY_RUN && updates.length > 0) {
      await flushUpdates(updates, 'Province');
    } else if (DRY_RUN) {
      updates.slice(0, 5).forEach(u => console.log(`  WOULD patch ${u.id} → Province: BC`));
      if (updates.length > 5) console.log(`  ... and ${updates.length - 5} more`);
    }
  }

  // ── Step 2: Services ────────────────────────────────────────────────────────
  if (runStep(2)) {
    console.log('\n── Step 2: Services (inferred from licenses) ────────────');
    const updates = [];

    for (const r of verified) {
      const f = r.fields;
      const fsr = f['FSR License']?.trim() ?? '';
      const gas = f['Gas Fitter License']?.trim() ?? '';

      // Skip records with no license data at all
      if (!fsr && !gas) continue;

      const services = inferServices(f);
      if (services.length === 0) continue;

      // Only patch if Services would actually change
      const existing = Array.isArray(f['Services']) ? [...f['Services']].sort().join(',') : '';
      const computed = [...services].sort().join(',');
      if (existing === computed) continue;

      updates.push({ id: r.id, fields: { Services: services } });
    }

    console.log(`  ${updates.length} records need Services updated`);

    // Preview breakdown
    const boilerOnly = updates.filter(u => u.fields.Services.includes('Boilers') && !u.fields.Services.includes('Heat Pumps'));
    const heatOnly   = updates.filter(u => u.fields.Services.includes('Heat Pumps') && !u.fields.Services.includes('Boilers'));
    const both       = updates.filter(u => u.fields.Services.includes('Boilers') && u.fields.Services.includes('Heat Pumps'));
    console.log(`    Boilers only:              ${boilerOnly.length}`);
    console.log(`    Heat Pumps + Hybrid only:  ${heatOnly.length}`);
    console.log(`    All three:                 ${both.length}`);

    if (!DRY_RUN && updates.length > 0) {
      await flushUpdates(updates, 'Services');
    } else if (DRY_RUN) {
      updates.slice(0, 5).forEach(u => {
        const name = all.find(r => r.id === u.id)?.fields['Company Name'] ?? u.id;
        console.log(`  WOULD patch "${name}" → Services: [${u.fields.Services.join(', ')}]`);
      });
    }
  }

  // ── Step 3: Audience ────────────────────────────────────────────────────────
  if (runStep(3)) {
    console.log('\n── Step 3: Audience (Residential / Commercial) ──────────');
    const updates = [];

    for (const r of verified) {
      const name = r.fields['Company Name'] ?? '';
      const audience = inferAudience(name);

      // Only patch if Audience is missing or would change
      const existing = Array.isArray(r.fields['Audience'])
        ? [...r.fields['Audience']].sort().join(',')
        : (r.fields['Audience'] ?? '');
      const computed = [...audience].sort().join(',');
      if (existing === computed) continue;

      updates.push({ id: r.id, fields: { Audience: audience } });
    }

    console.log(`  ${updates.length} records need Audience set`);
    const commercial = updates.filter(u => u.fields.Audience.includes('Commercial'));
    const resOnly    = updates.filter(u => !u.fields.Audience.includes('Commercial'));
    console.log(`    Residential only:   ${resOnly.length}`);
    console.log(`    Res + Commercial:   ${commercial.length}`);

    if (!DRY_RUN && updates.length > 0) {
      await flushUpdates(updates, 'Audience');
    } else if (DRY_RUN) {
      commercial.slice(0, 10).forEach(u => {
        const name = all.find(r => r.id === u.id)?.fields['Company Name'] ?? u.id;
        console.log(`  WOULD patch "${name}" → Audience: [${u.fields.Audience.join(', ')}]`);
      });
    }
  }

  // ── Step 4: Website ─────────────────────────────────────────────────────────
  if (runStep(4)) {
    console.log('\n── Step 4: Website search (Bing) ────────────────────────');

    const missing = verified.filter(r => !r.fields['Website']?.trim());
    console.log(`  ${missing.length} Verified records missing a website`);

    if (missing.length === 0) {
      console.log('  Nothing to do.');
    } else {
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      });
      const page = await browser.newPage();
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
        'KHTML, like Gecko Chrome/120.0.0.0 Safari/537.36'
      );
      await page.setRequestInterception(true);
      page.on('request', req => {
        ['image', 'font', 'media'].includes(req.resourceType()) ? req.abort() : req.continue();
      });

      const enrichmentRows = []; // saved to CSV regardless of dry-run
      const updates = [];

      for (let i = 0; i < missing.length; i++) {
        const r = missing[i];
        const name = r.fields['Company Name'] ?? '';
        const city = r.fields['City'] ?? '';
        process.stdout.write(`  [${i + 1}/${missing.length}] ${name.slice(0, 45).padEnd(45)} ... `);

        const found = await searchWebsite(page, name, city);

        enrichmentRows.push({
          airtable_id: r.id,
          company_name: name,
          city,
          found_website: found ?? '',
          status: found ? 'found' : 'not_found',
        });

        if (found) {
          updates.push({ id: r.id, fields: { Website: found } });
          console.log(`✓ ${found}`);
        } else {
          console.log('—');
        }

        await sleep(800); // polite delay between searches
      }

      await browser.close();

      // Always save enrichment CSV (even dry-run — it's read-only data)
      const csvPath = join(__dirname, 'website-enrichment.csv');
      const csvHeaders = ['airtable_id', 'company_name', 'city', 'found_website', 'status'];
      const csvLines = [
        csvHeaders.join(','),
        ...enrichmentRows.map(row =>
          csvHeaders.map(h => `"${(row[h] ?? '').replace(/"/g, '""')}"`).join(',')
        ),
      ];
      writeFileSync(csvPath, csvLines.join('\n'), 'utf-8');
      console.log(`\n  💾  Saved ${enrichmentRows.length} rows → scripts/website-enrichment.csv`);
      console.log(`      (${updates.length} found, ${enrichmentRows.length - updates.length} not found)`);

      if (!DRY_RUN && updates.length > 0) {
        await flushUpdates(updates, 'Website');
      } else if (DRY_RUN) {
        console.log(`  DRY RUN — would patch ${updates.length} websites`);
      }
    }
  }

  console.log('\n✅  Enrichment complete.\n');
}

main().catch(err => {
  console.error('\n❌  Script failed:', err.message);
  process.exit(1);
});
