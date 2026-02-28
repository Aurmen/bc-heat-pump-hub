/**
 * make-airtable-csv.mjs
 *
 * Converts airtable-import.csv (internal schema) to airtable-ready.csv
 * with Airtable field names as headers, ready to import via Airtable UI.
 *
 * Run: node scripts/make-airtable-csv.mjs
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SERVICE_LABELS = {
  heat_pumps:   'Heat Pumps',
  hybrid:       'Hybrid Systems',
  boilers:      'Boilers',
  air_to_water: 'Air-to-Water',
};

function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = parseLine(lines[0]);
  return lines.slice(1).map(line => {
    const values = parseLine(line);
    const row = {};
    headers.forEach((h, i) => { row[h] = values[i] ?? ''; });
    return row;
  });
}

function parseLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { inQuotes = !inQuotes; }
    else if (ch === ',' && !inQuotes) { fields.push(current); current = ''; }
    else { current += ch; }
  }
  fields.push(current);
  return fields;
}

function escapeCSV(val) {
  if (val === null || val === undefined) return '';
  const s = String(val);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

const csvPath = join(__dirname, 'airtable-import.csv');
const rows = parseCSV(readFileSync(csvPath, 'utf-8'));

const outputRows = rows.map(row => {
  const serviceEnums = row.services ? row.services.split(',').map(s => s.trim()).filter(Boolean) : [];
  const services = serviceEnums.map(e => SERVICE_LABELS[e]).filter(Boolean).join(', ');

  const brands = row.brands_supported || '';

  const notesText = row.notes ?? '';
  const saMatch = notesText.match(/^Service area: ([^.]+)\./);
  const serviceArea = saMatch ? saMatch[1].trim() : '';
  const adminNotes = saMatch ? notesText.slice(saMatch[0].length).trim() : notesText;

  return {
    'Company Name': row.company_name,
    'Website':      row.website,
    'Phone':        row.phone,
    'City':         row.city,
    'Lower Mainland, Vancouver Island, Interior, Northern BC': row.region,
    'Heat Pumps, Air-to-Water, Boilers, Hybrid Systems, Ground Source, Pool Heating, Snow Melt': services,
    'Emergency Service': row.emergency_service === 'yes' ? 'Yes' : row.emergency_service === 'no' ? 'No' : '',
    'Brand Support': brands,
    'Service Area':  serviceArea,
    'Admin Notes':   adminNotes,
    'FSR License':   row.tsbc_fsr_license || '',
    'Gas Fitter License': row.tsbc_gas_license || '',
    'Electrical License': row.tsbc_electrical_license || '',
    'Status':        'Published',
  };
});

const headers = Object.keys(outputRows[0]);
const csvLines = [
  headers.join(','),
  ...outputRows.map(row => headers.map(h => escapeCSV(row[h])).join(',')),
];

const outPath = join(__dirname, 'airtable-ready.csv');
writeFileSync(outPath, csvLines.join('\n'));
console.log(`✓ Wrote ${outputRows.length} rows → scripts/airtable-ready.csv`);
console.log('\nTo import:');
console.log('  1. Open your Airtable base → Submissions table');
console.log('  2. Click the + icon at the far right of the table tabs (or use the toolbar)');
console.log('  3. Choose "Import CSV" (or drag airtable-ready.csv onto the table)');
console.log('  4. Map columns — they should auto-match since names are identical');
console.log('  5. Click Import\n');
