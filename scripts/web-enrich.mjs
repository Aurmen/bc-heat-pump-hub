/**
 * web-enrich.mjs
 *
 * Full web-scraping enrichment pipeline for BC Heat Pump Hub contractor data.
 * Reads from Airtable (read-only — no schema changes needed), cross-references
 * local license data, then scrapes each contractor's website for email, brands,
 * phone, and services. Saves everything to scripts/enriched-contractors.csv.
 *
 * When Airtable schema is ready, run push-enrichment.mjs to write the CSV back.
 *
 * Features:
 *   - Checkpoint/resume: skips already-processed records (safe to re-run)
 *   - 2 concurrent Puppeteer pages for ~2x throughput
 *   - Progress saved every 25 records in case of crash
 *   - --limit=N   process first N missing records
 *   - --resume    skip records already in the output CSV
 *   - --dry-run   fetch + plan but don't visit websites
 *
 * Usage:
 *   node scripts/web-enrich.mjs                # full run (hours)
 *   node scripts/web-enrich.mjs --limit=50     # first 50
 *   node scripts/web-enrich.mjs --resume       # continue after crash
 */

import puppeteer from 'puppeteer';
import { readFileSync, writeFileSync, existsSync, appendFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── CLI flags ─────────────────────────────────────────────────────────────────
const argv    = process.argv.slice(2);
const DRY_RUN = argv.includes('--dry-run');
const RESUME  = argv.includes('--resume');
const limitArg = argv.find(a => a.startsWith('--limit='));
const LIMIT   = limitArg ? parseInt(limitArg.split('=')[1]) : Infinity;

// ── Paths ─────────────────────────────────────────────────────────────────────
const OUT_CSV   = join(__dirname, 'enriched-contractors.csv');
const LOCAL_DISCOVERIES = join(__dirname, 'discovered-contractors.json');
const MASTER_CSV = join(__dirname, 'bc_contractors_master.csv');

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

// ── CSV helpers ───────────────────────────────────────────────────────────────
const CSV_HEADERS = [
  'airtable_id', 'company_name', 'phone', 'city', 'province',
  'website', 'email', 'fsr_license', 'gas_license', 'license_status',
  'services', 'audience', 'brands', 'notes', 'scrape_status',
];

function csvCell(v) {
  const s = Array.isArray(v) ? v.join('; ') : String(v ?? '');
  return `"${s.replace(/"/g, '""')}"`;
}
function rowToCSV(row) {
  return CSV_HEADERS.map(h => csvCell(row[h])).join(',');
}

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

function loadExistingOutput() {
  if (!existsSync(OUT_CSV)) return new Set();
  const lines = readFileSync(OUT_CSV, 'utf-8').trim().split('\n');
  const headers = parseCSVLine(lines[0]);
  const idIdx = headers.indexOf('airtable_id');
  const done = new Set();
  for (const line of lines.slice(1)) {
    const fields = parseCSVLine(line);
    if (fields[idIdx]) done.add(fields[idIdx]);
  }
  return done;
}

// ── Airtable fetch ────────────────────────────────────────────────────────────
async function fetchVerifiedRecords() {
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
    process.stdout.write(`  fetched ${records.length}...\r`);
  } while (offset);
  console.log(`  fetched ${records.length} total.   `);
  return records.filter(r => r.fields['TSBC Verification Status'] === 'Verified');
}

// ── Local license data ────────────────────────────────────────────────────────
function loadLocalLicenses() {
  // discovered-contractors.json: 54 records with FSR/Gas license info
  // Key by normalized phone for cross-referencing
  const byPhone = new Map();
  const byName  = new Map();

  if (existsSync(LOCAL_DISCOVERIES)) {
    const data = JSON.parse(readFileSync(LOCAL_DISCOVERIES, 'utf-8'));
    for (const c of data) {
      const phone = (c.phone ?? '').replace(/\D/g, '').replace(/^1/, '');
      if (phone.length >= 7) byPhone.set(phone, c);
      byName.set((c.company_name ?? '').toLowerCase().trim(), c);
    }
  }

  // Also load bc_contractors_master.csv for additional coverage
  if (existsSync(MASTER_CSV)) {
    const lines = readFileSync(MASTER_CSV, 'utf-8').trim().split('\n');
    const headers = parseCSVLine(lines[0]);
    const idx = h => headers.indexOf(h);
    for (const line of lines.slice(1)) {
      const f = parseCSVLine(line);
      const phone = (f[idx('Phone')] ?? '').replace(/\D/g, '').replace(/^1/, '');
      const name  = (f[idx('Company_Name')] ?? '').toLowerCase().trim();
      const entry = {
        website:         f[idx('Website')] ?? '',
        email:           f[idx('Email')] ?? '',
        brands_supported: (f[idx('Brands_Installed')] ?? '').split(',').map(s => s.trim()).filter(Boolean),
      };
      if (phone.length >= 7 && !byPhone.has(phone)) byPhone.set(phone, entry);
      if (!byName.has(name)) byName.set(name, entry);
    }
  }

  return { byPhone, byName };
}

// ── Audience inference ────────────────────────────────────────────────────────
const COMMERCIAL_KW = [
  'commercial', 'industrial', 'mechanical', 'contracting', 'systems',
  'solutions', 'enterprises', 'group', 'corp', 'services ltd',
];
function inferAudience(name) {
  const lo = name.toLowerCase();
  return COMMERCIAL_KW.some(k => lo.includes(k)) ? 'Residential; Commercial' : 'Residential';
}

// ── Services inference ────────────────────────────────────────────────────────
function inferServices(fsrLicense, gasLicense, websiteText = '') {
  const svcs = new Set();
  if (fsrLicense) svcs.add('Boilers');
  if (gasLicense) { svcs.add('Heat Pumps'); svcs.add('Hybrid Systems'); }

  // Fallback: scan website text for service keywords
  if (svcs.size === 0 && websiteText) {
    const lo = websiteText.toLowerCase();
    if (/heat pump|heat-pump|mini.?split|ductless/i.test(lo)) svcs.add('Heat Pumps');
    if (/boiler|hydronic/i.test(lo)) svcs.add('Boilers');
    if (/hybrid|dual.?fuel/i.test(lo)) svcs.add('Hybrid Systems');
    if (/ground.?source|geotherm/i.test(lo)) svcs.add('Ground Source');
    if (/air.?to.?water/i.test(lo)) svcs.add('Air-to-Water');
  }
  return [...svcs].join('; ');
}

// ── Email extraction ──────────────────────────────────────────────────────────
const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const EMAIL_IGNORE = [/example\.com/, /sentry\.io/, /wix\./, /squarespace\./,
  /schema\.org/, /noreply/, /no-reply/, /donotreply/, /\.png$/, /\.jpg$/, /\.svg$/,
  /privacy@/, /legal@/, /dmca@/];
function validEmail(e) {
  if (EMAIL_IGNORE.some(p => p.test(e))) return false;
  return /\.(com|ca|net|org|biz|co|info|io)$/i.test(e);
}

// ── Brand extraction ──────────────────────────────────────────────────────────
const BRANDS = ['Mitsubishi', 'Daikin', 'Fujitsu', 'LG', 'Lennox', 'Carrier', 'Trane',
  'Bosch', 'Bryant', 'Goodman', 'Rheem', 'Ruud', 'York', 'Napoleon', 'Gree',
  'Midea', 'Panasonic', 'Samsung', 'Hitachi', 'Heil', 'Amana', 'Keeprite', 'Armstrong'];
function extractBrands(text) {
  return BRANDS.filter(b => new RegExp(`\\b${b}\\b`, 'i').test(text));
}

// ── Bing search ───────────────────────────────────────────────────────────────
const DIRECTORY_DOMAINS = [
  'yelp.', 'yp.ca', 'yellowpages', 'homestars.com', 'houzz.com',
  'facebook.com', 'linkedin.com', 'google.com', 'maps.google', 'bbb.org',
  'canadianheatpumphub.ca', 'kijiji.ca', 'craigslist.org', 'angieslist.com',
  'thumbtack.com', 'bark.com', 'trustedpros.ca', 'canpages.ca', 'porch.com',
  'angi.com', 'homeadvisor.com', 'wikipedia.org', 'bing.com', 'microsoft.com',
  'twitter.com', 'instagram.com', 'reddit.com', 'nextdoor.com', 'wikidata.org',
];
function isDirectory(url) { return DIRECTORY_DOMAINS.some(d => url.toLowerCase().includes(d)); }

async function bingSearch(page, query) {
  await page.goto(`https://www.bing.com/search?q=${encodeURIComponent(query)}`,
    { waitUntil: 'domcontentloaded', timeout: 15000 });
  await sleep(1200);
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('#b_results .b_algo')).map(el => {
      const cite = el.querySelector('cite')?.innerText?.trim() ?? '';
      return cite.split('›')[0].trim().replace(/^https?:\/\//i, '').replace(/\/$/, '');
    }).filter(d => d && d.includes('.') && !d.startsWith('bing'))
  );
}

async function findWebsite(page, name, city) {
  // Pass 1: quoted exact name
  let domains = await bingSearch(page, `"${name}" ${city} BC HVAC`);
  let hit = domains.find(d => !isDirectory(`https://${d}`));
  if (hit) return `https://${hit}`;

  // Pass 2: unquoted broader search
  await sleep(500);
  domains = await bingSearch(page, `${name} ${city} BC heating cooling contractor`);
  hit = domains.find(d => !isDirectory(`https://${d}`));
  return hit ? `https://${hit}` : null;
}

// ── Website scrape ────────────────────────────────────────────────────────────
async function scrapeWebsite(page, url) {
  const result = { email: '', brands: [], bodyText: '' };
  const urls = [url, `${url}/contact`, `${url}/contact-us`];
  for (const u of urls) {
    try {
      await page.goto(u, { waitUntil: 'domcontentloaded', timeout: 12000 });
      await sleep(800);
      const data = await page.evaluate(() => ({
        text: document.body?.innerText ?? '',
        mailtos: Array.from(document.querySelectorAll('a[href^="mailto:"]'))
          .map(a => a.href.replace('mailto:', '').split('?')[0].trim()),
      }));
      // Emails
      if (!result.email) {
        const mailtoEmail = data.mailtos.find(validEmail);
        const textEmail   = (data.text.match(EMAIL_RE) ?? []).find(validEmail);
        result.email = mailtoEmail ?? textEmail ?? '';
        // Prefer business domain over gmail/hotmail
        const all = [...new Set([...data.mailtos, ...(data.text.match(EMAIL_RE) ?? [])])].filter(validEmail);
        const biz = all.find(e => !/@(gmail|hotmail|yahoo|outlook)\.com$/.test(e));
        if (biz) result.email = biz;
      }
      // Brands (aggregate across pages)
      extractBrands(data.text).forEach(b => result.brands.push(b));
      result.bodyText += ' ' + data.text;

      if (result.email) break; // stop once we have email
    } catch { /* page load failed — continue */ }
  }
  result.brands = [...new Set(result.brands)];
  return result;
}

// ── Worker: processes one contractor ─────────────────────────────────────────
async function processContractor(page, record, localData) {
  const f    = record.fields;
  const name = f['Company Name'] ?? '';
  const city = f['City'] ?? '';
  const phone = (f['Phone'] ?? '').replace(/\D/g, '').replace(/^1/, '');

  // Look up local data by phone or name
  const local = localData.byPhone.get(phone)
    ?? localData.byName.get(name.toLowerCase().trim())
    ?? {};

  let website = local.website ?? '';
  let email   = local.email   ?? '';
  let brands  = local.brands_supported ?? [];
  let scrapeStatus = 'skipped';

  if (!DRY_RUN) {
    // Step 1: find website via Bing if missing
    if (!website) {
      try { website = (await findWebsite(page, name, city)) ?? ''; }
      catch (e) { website = ''; }
    }

    // Step 2: scrape website for email/brands if we have one
    if (website) {
      try {
        const scraped = await scrapeWebsite(page, website);
        if (!email && scraped.email) email = scraped.email;
        if (brands.length === 0) brands = scraped.brands;
        scrapeStatus = 'scraped';
      } catch { scrapeStatus = 'scrape_error'; }
    } else {
      scrapeStatus = 'no_website';
    }
  }

  return {
    airtable_id:    record.id,
    company_name:   name,
    phone:          f['Phone'] ?? '',
    city,
    province:       'BC',
    website,
    email,
    fsr_license:    local.tsbc_fsr_license ?? '',
    gas_license:    local.tsbc_gas_license ?? '',
    license_status: f['License Status'] ?? local.tsbc_license_status ?? '',
    services:       inferServices(local.tsbc_fsr_license, local.tsbc_gas_license, ''),
    audience:       inferAudience(name),
    brands:         brands.join('; '),
    notes:          local.notes ?? '',
    scrape_status:  scrapeStatus,
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🌐  BC Heat Pump Hub — Web Enrichment Pipeline');
  if (DRY_RUN) console.log('    DRY RUN — no website visits');
  if (RESUME)  console.log('    RESUME — skipping already-processed records');
  console.log('');

  // Load already-done IDs for resume
  const done = RESUME ? loadExistingOutput() : new Set();
  if (done.size) console.log(`  Resuming: ${done.size} records already processed\n`);

  // Airtable fetch
  console.log('Fetching Verified records from Airtable...');
  const allVerified = await fetchVerifiedRecords();
  console.log(`  ${allVerified.length} Verified records\n`);

  // Filter to unprocessed
  let targets = allVerified.filter(r => !done.has(r.id));
  if (targets.length > LIMIT) targets = targets.slice(0, LIMIT);
  console.log(`  ${targets.length} to process (limit: ${LIMIT === Infinity ? 'none' : LIMIT})\n`);

  // Load local license / master CSV data
  const localData = loadLocalLicenses();
  console.log(`  Local license lookup: ${localData.byPhone.size} by phone, ${localData.byName.size} by name\n`);

  // Initialise output CSV
  const isNew = !RESUME || !existsSync(OUT_CSV);
  if (isNew) {
    writeFileSync(OUT_CSV, CSV_HEADERS.join(',') + '\n', 'utf-8');
  }

  if (targets.length === 0) {
    console.log('Nothing to process. All done.');
    return;
  }

  // Launch browser with 2 concurrent pages
  console.log('🚀  Launching browser...\n');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  // Block images/fonts to speed things up
  async function newPage() {
    const p = await browser.newPage();
    await p.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36');
    await p.setRequestInterception(true);
    p.on('request', req => {
      ['image', 'font', 'media'].includes(req.resourceType()) ? req.abort() : req.continue();
    });
    return p;
  }

  const [page1, page2] = await Promise.all([newPage(), newPage()]);

  let processed = 0, found_web = 0, found_email = 0;
  const CHECKPOINT = 25;

  // Process in pairs for 2x throughput
  for (let i = 0; i < targets.length; i += 2) {
    const batch = targets.slice(i, i + 2);
    const label = (r) => {
      const n = r.fields['Company Name'] ?? '';
      return `[${i + batch.indexOf(r) + 1}/${targets.length}] ${n.slice(0, 38).padEnd(38)}`;
    };

    const results = await Promise.all(
      batch.map((r, bi) => {
        const page = bi === 0 ? page1 : page2;
        return processContractor(page, r, localData).catch(err => ({
          airtable_id:  r.id,
          company_name: r.fields['Company Name'] ?? '',
          phone:        r.fields['Phone'] ?? '',
          city:         r.fields['City'] ?? '',
          province:     'BC',
          website: '', email: '', fsr_license: '', gas_license: '',
          license_status: '', services: '', audience: inferAudience(r.fields['Company Name'] ?? ''),
          brands: '', notes: '',
          scrape_status: `error: ${err.message.slice(0, 60)}`,
        }));
      })
    );

    for (const res of results) {
      const r = batch[results.indexOf(res)];
      if (res.website)  found_web++;
      if (res.email)    found_email++;
      processed++;

      const status = [
        res.website  ? `🌐 ${res.website.replace('https://','').slice(0,28)}` : '  no website',
        res.email    ? `✉  ${res.email.slice(0,25)}`                         : '',
        res.services ? `⚙  ${res.services.slice(0,20)}`                      : '',
      ].filter(Boolean).join(' | ');

      console.log(`${label(r)} ${status || '— nothing found'}`);
      appendFileSync(OUT_CSV, rowToCSV(res) + '\n', 'utf-8');
    }

    // Checkpoint log
    if (processed % CHECKPOINT === 0) {
      console.log(`\n  ── Checkpoint: ${processed}/${targets.length} done | websites: ${found_web} | emails: ${found_email} ──\n`);
    }

    await sleep(300);
  }

  await browser.close();

  console.log(`
✅  Enrichment complete
    Processed:     ${processed}
    Websites found: ${found_web}
    Emails found:   ${found_email}
    Output:         scripts/enriched-contractors.csv

Next step (once Airtable schema is set up):
    npm run setup-schema && node scripts/push-enrichment.mjs
`);
}

main().catch(err => { console.error('\n❌ ', err.message); process.exit(1); });
