import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

const candidates = [join(__dirname,'../.env.local'), join(__dirname,'../../../../.env.local')];
for (const p of candidates) {
  if (!existsSync(p)) continue;
  for (const line of readFileSync(p,'utf-8').split('\n')) {
    const t=line.trim(); if(!t||t.startsWith('#')) continue;
    const eq=t.indexOf('='); if(eq<0) continue;
    const k=t.slice(0,eq).trim(), v=t.slice(eq+1).trim().replace(/^["']|["']$/g,'');
    if(k&&!process.env[k]) process.env[k]=v;
  }
  break;
}

const K = process.env.AIRTABLE_API_KEY;
const B = process.env.AIRTABLE_BASE_ID;

const res = await fetch(`https://api.airtable.com/v0/meta/bases/${B}/tables`, {
  headers: { Authorization: 'Bearer ' + K },
});
const data = await res.json();

if (!data.tables) {
  console.log('Meta API response:', JSON.stringify(data).slice(0, 400));
  process.exit(1);
}

const table = data.tables.find(t => t.name === 'Submissions');
if (!table) {
  console.log('Tables found:', data.tables.map(t => t.name).join(', '));
  process.exit(1);
}

console.log('Table ID:', table.id);
console.log('\nAll fields:');
for (const f of table.fields) {
  console.log(`  ${f.type.padEnd(20)} ${f.name}`);
}
