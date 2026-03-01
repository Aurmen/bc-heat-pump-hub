/**
 * tsbc-verify-airtable.mjs
 *
 * Matches Airtable contractors to TSBC records by PHONE NUMBER (more reliable
 * than name matching because legal entity names often differ).
 *
 * Flow:
 *   1. Fetch all Published Airtable records
 *   2. Collect unique cities where those contractors operate
 *   3. Search TSBC by city (Boiler/Refrigeration category)
 *   4. Extract name + phone + detail URL from each result card
 *   5. Build a phone-number lookup map
 *   6. For each Airtable record, look up by normalized phone
 *   7. Visit matched contractor's TSBC detail page → extract license data
 *   8. PATCH Airtable record with verified data
 *
 * Usage:
 *   node scripts/tsbc-verify-airtable.mjs              # all Published records
 *   node scripts/tsbc-verify-airtable.mjs --dry-run    # print only, no writes
 *   node scripts/tsbc-verify-airtable.mjs --unverified # only unverified records
 *   node scripts/tsbc-verify-airtable.mjs --limit 5    # test with first 5 records
 */

import puppeteer from 'puppeteer';
import { readFileSync, existsSync, writeFileSync } from 'fs';
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

const API_KEY  = process.env.AIRTABLE_API_KEY;
const BASE_ID  = process.env.AIRTABLE_BASE_ID;
const TABLE    = 'Submissions';
const TSBC_URL = 'https://www.technicalsafetybc.ca/regulatory-resources/find-a-licensed-contractor/';

if (!API_KEY || !BASE_ID) {
  console.error('❌  Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID');
  process.exit(1);
}

// ── CLI args ──────────────────────────────────────────────────────────────────
const args     = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const unverOnly = args.includes('--unverified');
const limitIdx = args.indexOf('--limit');
const limit    = limitIdx >= 0 ? parseInt(args[limitIdx + 1]) : Infinity;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Normalize phone numbers for comparison: keep digits only
function normalizePhone(phone) {
  return (phone ?? '').replace(/\D/g, '').replace(/^1/, ''); // strip country code
}

// ── Airtable helpers ──────────────────────────────────────────────────────────
async function fetchAllRecords() {
  const records = [];
  let offset = null;
  do {
    const url = new URL(`https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE)}`);
    if (offset) url.searchParams.set('offset', offset);
    const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${API_KEY}` } });
    if (!res.ok) throw new Error(`Airtable ${res.status}: ${await res.text()}`);
    const data = await res.json();
    records.push(...data.records);
    offset = data.offset ?? null;
    process.stdout.write(`  fetched ${records.length} records...\r`);
  } while (offset);
  console.log(`  fetched ${records.length} records total.   `);
  return records;
}

async function flushUpdates(updates) {
  const BATCH = 10;
  let count = 0;
  for (let i = 0; i < updates.length; i += BATCH) {
    const batch = updates.slice(i, i + BATCH);
    const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE)}`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ records: batch }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error(`  ⚠️  PATCH failed: ${body.slice(0, 200)}`);
    } else {
      count += batch.length;
    }
    await sleep(250); // Airtable rate limit
  }
  return count;
}

// ── TSBC browser helpers ──────────────────────────────────────────────────────
async function initPage(browser) {
  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
  );

  // Load page once and dismiss cookie banner
  await page.goto(TSBC_URL, { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(3000);
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button'))
      .find(b => b.textContent.includes('I understand'));
    if (btn) btn.click();
  });
  await sleep(1500);

  return page;
}

// Search TSBC by city — returns all result cards on all pages
async function searchByCity(page, city) {
  await page.goto(TSBC_URL, { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(3000);

  // Select Boiler / Pressure Vessel / Refrigeration chip using attribute selector
  // (avoids CSS comma-escaping issues; Puppeteer's .click() auto-scrolls into view)
  const chip = await page.$('[id="technical-system-boiler,-pressure-vessel,-refrigeration"]');
  if (!chip) { console.log(`    ⚠️  chip not found for ${city}`); return []; }
  await chip.click();
  await sleep(800);

  // Type city into City 1 input
  const cityInput = await page.$('#city-0');
  if (!cityInput) { console.log(`    ⚠️  city input not found for ${city}`); return []; }
  await cityInput.click({ clickCount: 3 });
  await cityInput.type(city);
  await sleep(400);

  // Submit
  await page.click('button[type="submit"]');

  // Poll for results
  const results = await pollForResults(page);
  if (!results.length) return [];

  // Collect all pages
  return results;
}

async function pollForResults(page, timeoutMs = 10000) {
  for (let elapsed = 0; elapsed < timeoutMs; elapsed += 500) {
    await sleep(500);
    const state = await page.evaluate(() => {
      const text = document.body.innerText.toLowerCase();
      const links = document.querySelectorAll('a[href*="contractor?id="]');
      return {
        linkCount: links.length,
        noResults: text.includes('no results'),
      };
    });
    if (state.noResults) return [];
    if (state.linkCount > 0) return extractResultCards(page);
  }
  return [];
}

async function extractResultCards(page) {
  // Collect all cards across all pages
  const allCards = [];
  let currentPage = 1;

  while (true) {
    const cards = await page.evaluate(() =>
      Array.from(document.querySelectorAll('a[href*="contractor?id="]')).map(a => {
        const text = a.innerText.trim();
        // Extract phone from card text: "Office: (604) 123-4567"
        const phoneMatch = text.match(/Office:\s*([\d\s()\-+.]+)/i);
        return {
          name: text.split('\n')[0].trim(),
          phone: phoneMatch?.[1]?.trim() ?? '',
          detailUrl: a.href,
        };
      }).filter(c => c.name && c.detailUrl)
    );
    allCards.push(...cards);

    // Check for next page
    const hasNext = await page.evaluate((pg) => {
      const buttons = document.querySelectorAll('.MuiPaginationItem-root');
      const nextPg = pg + 1;
      for (const btn of buttons) {
        if (btn.textContent.trim() === String(nextPg)) {
          btn.click();
          return true;
        }
      }
      return false;
    }, currentPage);

    if (!hasNext) break;
    await sleep(1500);
    currentPage++;
  }

  return allCards;
}

// Visit TSBC contractor detail page and extract license data
async function extractLicenseData(page, detailUrl) {
  await page.goto(detailUrl, { waitUntil: 'networkidle2', timeout: 20000 });
  await sleep(800);

  return page.evaluate(() => {
    const text = document.body.innerText;

    const lbp = text.match(/LBP\d{7}/)?.[0] ?? '';
    const lga = text.match(/LGA\d{7}/)?.[0] ?? '';
    const lel = text.match(/LEL\d{7}/)?.[0] ?? '';
    const lra = text.match(/LRA\d{7}/)?.[0] ?? '';

    const status = text.match(/Licence Status:\s*(Active|Expired|Suspended)/i)?.[1]?.toLowerCase() ?? '';
    const expiry = text.match(/Expiry Date:\s*(\d{4}-\d{2}-\d{2})/i)?.[1] ?? '';
    const enforcement = parseInt(text.match(/Enforcement Actions:\s*(\d+)/i)?.[1] ?? '0');

    return {
      fsr_license:         lbp || lra,
      gas_license:         lga,
      electrical_license:  lel,
      license_status:      status,
      license_expiry:      expiry,
      enforcement_actions: enforcement,
    };
  });
}

// Build Airtable fields from TSBC license data.
// NOTE: 'TSBC Verification Status' and 'License Status' are single-select fields.
// They require the options to be pre-created in Airtable before the API can set them.
// Until those options exist, we write only the text/number fields (license numbers,
// enforcement count) which are always writable.
function buildAirtableFields(data) {
  const fields = {};

  // Text fields — always writable
  if (data.fsr_license)        fields['FSR License']        = data.fsr_license;
  if (data.gas_license)        fields['Gas Fitter License'] = data.gas_license;
  if (data.electrical_license) fields['Electrical License'] = data.electrical_license;
  fields['Enforcement Actions'] = data.enforcement_actions ?? 0;

  // Single-select fields — only include if options exist in Airtable
  // Add these after creating the options in Airtable field settings:
  //   'TSBC Verification Status' options: Verified, Not Found
  //   'License Status' options: active, expired, suspended, unknown
  if (process.env.AIRTABLE_SELECTS_READY === '1') {
    fields['TSBC Verification Status'] = 'Verified';
    const statusMap = { active: 'active', expired: 'expired', suspended: 'suspended' };
    if (data.license_status) {
      fields['License Status'] = statusMap[data.license_status] ?? 'unknown';
    }
  }

  return fields;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🔍  TSBC → Airtable Verification Sync (city + phone matching)');
  if (isDryRun) console.log('    DRY RUN — no Airtable writes\n');

  console.log('\nFetching Airtable records...');
  const allRecords = await fetchAllRecords();

  let records = allRecords.filter(r => (r.fields['Status'] ?? '').includes('Published'));
  console.log(`  ${records.length} Published records`);

  if (unverOnly) {
    records = records.filter(r => r.fields['TSBC Verification Status'] !== 'Verified');
    console.log(`  ${records.length} unverified records`);
  }

  if (records.length > limit) {
    records = records.slice(0, limit);
    console.log(`  limited to ${records.length} records`);
  }

  // Build phone lookup map from Airtable records
  const phoneToRecord = new Map();
  for (const record of records) {
    const phone = normalizePhone(record.fields['Phone']);
    if (phone && phone.length >= 7) {
      phoneToRecord.set(phone, record);
    }
  }
  console.log(`  ${phoneToRecord.size} records have phone numbers to match`);

  // Collect unique cities from Airtable
  const cities = [...new Set(records.map(r => r.fields['City']).filter(Boolean))];
  console.log(`  ${cities.length} unique cities to search on TSBC`);

  console.log('\n🌐  Launching Puppeteer...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  // Build phone → TSBC card map by searching each city
  const phoneToTSBC = new Map(); // normalized_phone → { name, phone, detailUrl }

  const page = await initPage(browser);

  try {
    console.log('\n📍  Searching TSBC by city...');
    for (let i = 0; i < cities.length; i++) {
      const city = cities[i];
      process.stdout.write(`  [${i + 1}/${cities.length}] ${city}...`);

      try {
        const cards = await searchByCity(page, city);
        let newCards = 0;
        for (const card of cards) {
          const phone = normalizePhone(card.phone);
          if (phone && phone.length >= 7 && !phoneToTSBC.has(phone)) {
            phoneToTSBC.set(phone, card);
            newCards++;
          }
        }
        console.log(` ${cards.length} results, ${newCards} new`);
      } catch (err) {
        console.log(` ⚠️  ${err.message.slice(0, 60)}`);
      }

      await sleep(1000);
    }

    console.log(`\n  TSBC discovery complete: ${phoneToTSBC.size} unique phone-matched entries`);

    // Match Airtable records to TSBC entries by phone
    console.log('\n🔗  Matching Airtable records to TSBC data...');
    let matched = 0, unmatched = 0, errors = 0;
    const updates = [];

    for (const record of records) {
      const f = record.fields;
      const phone = normalizePhone(f['Phone']);
      const name = f['Company Name'] ?? '';

      const tsbcCard = phoneToTSBC.get(phone);
      if (!tsbcCard) {
        unmatched++;
        continue;
      }

      console.log(`  ✓ MATCH: ${name} ↔ ${tsbcCard.name} (phone: ${f['Phone']})`);

      try {
        const licenseData = await extractLicenseData(page, tsbcCard.detailUrl);
        console.log(`    FSR: ${licenseData.fsr_license || '—'}  Gas: ${licenseData.gas_license || '—'}  Status: ${licenseData.license_status || '—'}`);

        const fields = buildAirtableFields(licenseData);
        updates.push({ id: record.id, fields });
        matched++;
      } catch (err) {
        console.error(`    ⚠️  ${err.message.slice(0, 80)}`);
        errors++;
      }

      await sleep(800);
    }

    // Write to Airtable
    console.log(`\n📤  ${updates.length} records to update in Airtable`);
    if (!isDryRun && updates.length > 0) {
      const patched = await flushUpdates(updates);
      console.log(`    ✓ patched ${patched} records`);
    } else if (isDryRun && updates.length > 0) {
      console.log('    (dry run — skipped)');
      for (const u of updates) {
        console.log(`    ${u.id}: ${JSON.stringify(u.fields)}`);
      }
    }

    console.log(`
✅  Done
    TSBC city entries found:  ${phoneToTSBC.size}
    Airtable records matched: ${matched}
    Not matched:              ${unmatched}
    Errors:                   ${errors}
`);

  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error('\n❌  Script failed:', err.message);
  process.exit(1);
});
