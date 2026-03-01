/**
 * clean-enrichment.mjs
 * Removes rows with known-bad website matches from enriched-contractors.csv
 * so they get re-processed on the next --resume run.
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
const PATH = join(__dirname, 'enriched-contractors.csv');

const BAD = ['baidu.', 'amazon.', 'canadiantire.', '.com.br', '.com.cn', '.cn', '.ru'];

const lines = readFileSync(PATH, 'utf-8').trim().split('\n');
const header = lines[0];
const before = lines.length - 1;

const clean = lines.slice(1).filter(line => {
  return !BAD.some(bad => line.toLowerCase().includes(bad));
});

writeFileSync(PATH, [header, ...clean].join('\n') + '\n', 'utf-8');
console.log(`Removed ${before - clean.length} bad rows. ${clean.length} rows kept.`);
