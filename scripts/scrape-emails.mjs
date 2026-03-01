/**
 * scrape-emails.mjs
 * One-pass Puppeteer scraper for all missing contractor data:
 *   - Email addresses
 *   - Brands installed (Mitsubishi, Daikin, Lennox, etc.)
 *   - Phone numbers
 *
 * Only fills fields that are currently empty — never overwrites existing data.
 * Writes results back to bc_contractors_master.csv and email-scrape-report.json.
 *
 * Usage: node scripts/scrape-emails.mjs [--dry-run] [--limit=N]
 */

import puppeteer from 'puppeteer';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CSV_PATH  = join(__dirname, 'bc_contractors_master.csv');
const REPORT_PATH = join(__dirname, 'email-scrape-report.json');

const DRY_RUN = process.argv.includes('--dry-run');
const LIMIT_ARG = process.argv.find(a => a.startsWith('--limit='));
const LIMIT = LIMIT_ARG ? parseInt(LIMIT_ARG.split('=')[1]) : Infinity;

// ── Email ──────────────────────────────────────────────────────────────────
const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const EMAIL_IGNORE = [
  /example\.com/, /sentry\.io/, /wix\.com/, /squarespace\.com/,
  /wordpress\./, /schema\.org/, /yoursite\./, /noreply/, /no-reply/,
  /donotreply/, /\.png$/, /\.jpg$/, /\.gif$/, /\.svg$/, /\.webp$/,
  /privacy@/, /legal@/, /dmca@/, /abuse@/,
];
function validEmail(e) {
  if (EMAIL_IGNORE.some(p => p.test(e))) return false;
  return /\.(com|ca|net|org|biz|co|info|io)$/i.test(e);
}

// ── Brands ─────────────────────────────────────────────────────────────────
const KNOWN_BRANDS = [
  'Mitsubishi', 'Daikin', 'Fujitsu', 'LG', 'Lennox', 'Carrier', 'Trane',
  'Bosch', 'Bryant', 'Goodman', 'Rheem', 'Ruud', 'York', 'Coleman',
  'Napoleon', 'Gree', 'Midea', 'Panasonic', 'Samsung', 'Hitachi',
  'Nortek', 'Heil', 'Amana', 'Comfortmaker', 'Keeprite', 'Armstrong',
];

function extractBrands(text) {
  const found = new Set();
  for (const brand of KNOWN_BRANDS) {
    // Word-boundary match, case-insensitive
    if (new RegExp(`\\b${brand}\\b`, 'i').test(text)) {
      found.add(brand);
    }
  }
  return [...found];
}

// ── Phone ──────────────────────────────────────────────────────────────────
// Matches Canadian/US phone formats
const PHONE_REGEX = /(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}/g;
const BC_PREFIXES = ['604', '778', '236', '250', '672'];

function extractPhones(text) {
  const raw = text.match(PHONE_REGEX) ?? [];
  return raw
    .map(p => p.trim())
    .filter(p => BC_PREFIXES.some(pfx => p.replace(/\D/g, '').includes(pfx)));
}

// ── CSV helpers ────────────────────────────────────────────────────────────
function parseCSVLine(line) {
  const fields = [];
  let field = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQ && line[i + 1] === '"') { field += '"'; i++; }
      else inQ = !inQ;
    } else if (ch === ',' && !inQ) {
      fields.push(field); field = '';
    } else field += ch;
  }
  fields.push(field);
  return fields;
}

function parseCSV(text) {
  const lines = text.split('\n');
  const headers = parseCSVLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const fields = parseCSVLine(line);
    const row = {};
    headers.forEach((h, idx) => { row[h] = fields[idx] ?? ''; });
    rows.push(row);
  }
  return { headers, rows };
}

function serializeCSV(headers, rows) {
  const esc = v => (v.includes(',') || v.includes('"') || v.includes('\n'))
    ? '"' + v.replace(/"/g, '""') + '"' : v;
  return [
    headers.join(','),
    ...rows.map(r => headers.map(h => esc(r[h] ?? '')).join(',')),
  ].join('\n');
}

// ── Scraper ────────────────────────────────────────────────────────────────
async function scrapePage(page, url) {
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1200));
    return await page.evaluate(() => {
      const text = document.body?.innerText ?? '';
      const html = document.body?.innerHTML ?? '';
      const mailtos = Array.from(document.querySelectorAll('a[href^="mailto:"]'))
        .map(a => a.getAttribute('href').replace('mailto:', '').split('?')[0].trim());
      return { text, html, mailtos };
    });
  } catch {
    return null;
  }
}

async function scrapeContractor(browser, row) {
  const domain = row['Website']?.trim();
  if (!domain) return null;

  const base = domain.startsWith('http') ? domain : `https://${domain}`;
  const urls = [base, `${base}/contact`, `${base}/contact-us`, `${base}/about`];

  const needEmail  = !row['Email']?.trim();
  const needBrands = !row['Brands_Installed']?.trim();
  const needPhone  = !row['Phone']?.trim();

  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
    'KHTML, like Gecko Chrome/120.0.0.0 Safari/537.36'
  );
  await page.setRequestInterception(true);
  page.on('request', req => {
    ['image', 'font', 'media'].includes(req.resourceType()) ? req.abort() : req.continue();
  });

  const result = { emails: new Set(), brands: new Set(), phones: new Set() };

  for (const url of urls) {
    const data = await scrapePage(page, url);
    if (!data) continue;

    const { text, mailtos } = data;

    if (needEmail) {
      (text.match(EMAIL_REGEX) ?? []).filter(validEmail).forEach(e => result.emails.add(e.toLowerCase()));
      mailtos.filter(validEmail).forEach(e => result.emails.add(e.toLowerCase()));
    }
    if (needBrands) {
      extractBrands(text).forEach(b => result.brands.add(b));
    }
    if (needPhone) {
      extractPhones(text).forEach(p => result.phones.add(p));
    }
  }

  await page.close();
  return {
    emails: [...result.emails],
    brands: [...result.brands],
    phones: [...result.phones],
  };
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  const csvText = readFileSync(CSV_PATH, 'utf-8');
  const { headers, rows } = parseCSV(csvText);

  // Only process rows that are missing at least one field
  const targets = rows
    .filter(r => !r['Email']?.trim() || !r['Brands_Installed']?.trim() || !r['Phone']?.trim())
    .slice(0, LIMIT);

  console.log(`Rows needing data: ${targets.length} (of ${rows.length} total)`);
  if (DRY_RUN) console.log('DRY RUN — CSV will not be saved.\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const report = [];
  let emailsFilled = 0, brandsFilled = 0, phonesFilled = 0;

  for (let i = 0; i < targets.length; i++) {
    const row = targets[i];
    const name   = row['Company_Name'];
    const domain = row['Website'];
    const needEmail  = !row['Email']?.trim();
    const needBrands = !row['Brands_Installed']?.trim();
    const needPhone  = !row['Phone']?.trim();

    const needs = [needEmail && 'email', needBrands && 'brands', needPhone && 'phone']
      .filter(Boolean).join(', ');

    process.stdout.write(`[${i + 1}/${targets.length}] ${name.substring(0, 40).padEnd(40)} needs: ${needs} ... `);

    const found = await scrapeContractor(browser, row);
    const entry = { company: name, website: domain, found: {} };

    if (!found) {
      console.log('ERROR (unreachable)');
      entry.found = { error: true };
      report.push(entry);
      continue;
    }

    const updates = [];

    // Email
    if (needEmail && found.emails.length > 0) {
      const preferred = found.emails.find(e => !/@(gmail|hotmail|yahoo|outlook)\.com$/.test(e)) ?? found.emails[0];
      if (!DRY_RUN) row['Email'] = preferred;
      emailsFilled++;
      updates.push(`email=${preferred}`);
      entry.found.emails = found.emails;
      entry.found.email_selected = preferred;
    }

    // Brands
    if (needBrands && found.brands.length > 0) {
      const brandsStr = found.brands.join(', ');
      if (!DRY_RUN) row['Brands_Installed'] = brandsStr;
      brandsFilled++;
      updates.push(`brands=${brandsStr}`);
      entry.found.brands = found.brands;
    }

    // Phone
    if (needPhone && found.phones.length > 0) {
      const phone = found.phones[0];
      if (!DRY_RUN) row['Phone'] = phone;
      phonesFilled++;
      updates.push(`phone=${phone}`);
      entry.found.phones = found.phones;
    }

    if (updates.length > 0) {
      console.log('✓ ' + updates.join(' | '));
    } else {
      console.log('nothing found');
    }

    report.push(entry);
    await new Promise(r => setTimeout(r, 400));
  }

  await browser.close();

  if (!DRY_RUN) {
    writeFileSync(CSV_PATH, serializeCSV(headers, rows), 'utf-8');
    writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), 'utf-8');
    console.log(`\nCSV updated → ${CSV_PATH}`);
    console.log(`Report saved → ${REPORT_PATH}`);
  }

  console.log(`\n── Results ──────────────────────`);
  console.log(`Emails filled:  ${emailsFilled}`);
  console.log(`Brands filled:  ${brandsFilled}`);
  console.log(`Phones filled:  ${phonesFilled}`);
  console.log(`─────────────────────────────────`);
}

main().catch(err => { console.error(err); process.exit(1); });
