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
const K=process.env.AIRTABLE_API_KEY, B=process.env.AIRTABLE_BASE_ID;
const res = await fetch(`https://api.airtable.com/v0/${B}/Submissions?maxRecords=1`,{headers:{Authorization:'Bearer '+K}});
const data = await res.json();
const fields = Object.keys(data.records[0].fields);
console.log('Fields in Airtable Submissions table:');
fields.forEach(f => console.log('  ' + JSON.stringify(f)));
