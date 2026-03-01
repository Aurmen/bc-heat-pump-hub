import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

const lines = readFileSync(join(__dirname, 'enriched-contractors.csv'), 'utf-8').trim().split('\n');
const total  = lines.length - 1;
const data   = lines.slice(1);

const scraped = data.filter(l => l.includes('"scraped"')).length;
const noWeb   = data.filter(l => l.includes('"no_website"')).length;
const hasEmail = data.filter(l => {
  const m = l.match(/^(?:"[^"]*",){6}"([^"]+)"/);
  return m && m[1].includes('@');
}).length;

// Sniff bad domain matches — domains that clearly don't belong to an HVAC contractor
const BAD_SIGNALS = ['baidu.', 'canadiantire', 'wikipedia', 'facebook', 'google', 'amazon', 'youtube', 'twitter', 'instagram'];
const badMatches = data.filter(l => {
  const m = l.match(/"(https?:\/\/[^"]+)"/);
  const url = m?.[1] ?? '';
  return url && BAD_SIGNALS.some(s => url.includes(s));
});

console.log('── Enrichment CSV Audit ────────────────────');
console.log(`Total rows:           ${total}`);
console.log(`Scraped (found site): ${scraped}`);
console.log(`No website found:     ${noWeb}`);
console.log(`Has email:            ${hasEmail}`);
console.log(`Clearly wrong sites:  ${badMatches.length}`);
if (badMatches.length) {
  console.log('\nBad matches:');
  badMatches.forEach(l => {
    const cols = l.match(/"([^"]*)"/g)?.map(s => s.replace(/"/g,'')) ?? [];
    console.log(`  ${cols[1]?.slice(0,35).padEnd(35)}  →  ${cols[5]}`);
  });
}
