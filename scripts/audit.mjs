import { readFileSync } from 'fs';
const data = JSON.parse(readFileSync('src/data/directory.json', 'utf-8'));

const cities = {};
for (const l of data) cities[l.city] = (cities[l.city] || 0) + 1;
console.log('=== City distribution ===');
for (const [c, n] of Object.entries(cities).sort((a,b) => b[1]-a[1]))
  console.log(`  ${String(n).padStart(3)}  ${c || '(blank)'}`);

const regions = {};
for (const l of data) regions[l.region] = (regions[l.region] || 0) + 1;
console.log('\n=== Region distribution ===');
for (const [r, n] of Object.entries(regions))
  console.log(`  ${String(n).padStart(3)}  ${r || '(blank)'}`);

const noWebsite = data.filter(l => !l.website).length;
const noPhone   = data.filter(l => !l.phone).length;
const noServices = data.filter(l => !l.services?.length).length;
console.log('\n=== Data quality ===');
console.log(`  No website:  ${noWebsite}`);
console.log(`  No phone:    ${noPhone}`);
console.log(`  No services: ${noServices}`);
