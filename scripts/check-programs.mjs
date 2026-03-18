#!/usr/bin/env node
/**
 * check-programs.mjs — Automated rebate program status checker
 *
 * Reads all programs from src/data/programs.ts, fetches each sourceUrl,
 * and flags programs whose pages show signs of being ended/unavailable.
 *
 * Usage:
 *   node scripts/check-programs.mjs
 *
 * Exit codes:
 *   0 = all programs verified OK
 *   1 = one or more programs may have changed status
 *
 * Add to CI/CD or run monthly to catch stale program data.
 */

const PROGRAMS_FILE = new URL('../src/data/programs.ts', import.meta.url);

// Keywords that indicate a program page is no longer available
const DEAD_KEYWORDS = [
  'unavailable',
  'no longer available',
  'program has ended',
  'program is closed',
  'not accepting',
  'discontinued',
  'expired',
  'this rebate is unavailable',
  'that rebate is unavailable',
  'page not found',
  '404',
];

// Keywords that indicate a program is still live
const ALIVE_KEYWORDS = [
  'apply now',
  'get started',
  'check eligibility',
  'submit your application',
  'rebate amount',
  'how to apply',
];

async function fetchWithTimeout(url, timeoutMs = 15000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ProgramChecker/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    });
    const text = await res.text();
    clearTimeout(timeout);
    return { status: res.status, url: res.url, text: text.toLowerCase() };
  } catch (err) {
    clearTimeout(timeout);
    return { status: 0, url, text: '', error: err.message };
  }
}

async function parsePrograms() {
  const fs = await import('fs');
  const content = fs.readFileSync(PROGRAMS_FILE, 'utf-8');

  // Extract program objects using regex (simple but effective for this structure)
  const programs = [];
  const idRegex = /id:\s*'([^']+)'/g;
  const nameRegex = /name:\s*'([^']+)'/g;
  const statusRegex = /status:\s*'([^']+)'/g;
  const urlRegex = /sourceUrl:\s*'([^']+)'/g;
  const verifiedRegex = /lastVerified:\s*'([^']+)'/g;

  // Split by export const to get individual program blocks
  const blocks = content.split(/export const \w+: RebateProgram = \{/);

  for (const block of blocks) {
    const idMatch = block.match(/id:\s*'([^']+)'/);
    const nameMatch = block.match(/name:\s*'([^']+)'/);
    const statusMatch = block.match(/status:\s*'([^']+)'/);
    const urlMatch = block.match(/sourceUrl:\s*'([^']+)'/);
    const verifiedMatch = block.match(/lastVerified:\s*'([^']+)'/);

    if (idMatch && nameMatch && statusMatch && urlMatch) {
      programs.push({
        id: idMatch[1],
        name: nameMatch[1],
        status: statusMatch[1],
        sourceUrl: urlMatch[1],
        lastVerified: verifiedMatch?.[1] || 'unknown',
      });
    }
  }

  return programs;
}

function daysSince(dateStr) {
  const then = new Date(dateStr);
  const now = new Date();
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║           REBATE PROGRAM STATUS CHECKER                     ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const programs = await parsePrograms();
  console.log(`Found ${programs.length} programs in programs.ts\n`);

  let issues = 0;

  for (const prog of programs) {
    const age = daysSince(prog.lastVerified);
    const stale = age > 30;

    process.stdout.write(`  Checking: ${prog.name}...`);

    const result = await fetchWithTimeout(prog.sourceUrl);

    // Check for redirect to "unavailable" page
    const redirectedToUnavailable = result.url?.includes('unavailable') ||
      result.url?.includes('not-found') ||
      result.url?.includes('404');

    // Check page content for dead keywords
    const foundDead = DEAD_KEYWORDS.filter(kw => result.text.includes(kw));
    const foundAlive = ALIVE_KEYWORDS.filter(kw => result.text.includes(kw));

    // Determine verdict
    let verdict = 'OK';
    let flag = '';

    if (result.error) {
      verdict = 'FETCH_ERROR';
      flag = `  ⚠️  ${result.error}`;
      issues++;
    } else if (result.status === 404) {
      verdict = 'PAGE_GONE';
      flag = `  🔴 Page returns 404 — program may have been removed`;
      issues++;
    } else if (redirectedToUnavailable) {
      verdict = 'UNAVAILABLE';
      flag = `  🔴 Redirects to "${result.url}" — program likely ended`;
      issues++;
    } else if (foundDead.length > 0 && foundAlive.length === 0) {
      verdict = 'LIKELY_ENDED';
      flag = `  🟡 Found: "${foundDead[0]}" — no active indicators found`;
      issues++;
    } else if (stale) {
      verdict = 'STALE';
      flag = `  🟡 Last verified ${age} days ago — needs manual review`;
      issues++;
    }

    // Status indicator
    const statusIcon = prog.status === 'active' ? '🟢' :
                        prog.status === 'ended' ? '🔴' : '🟡';

    console.log('');
    console.log(`  ${statusIcon} ${prog.name}`);
    console.log(`     Status in code: ${prog.status} | Last verified: ${prog.lastVerified} (${age}d ago)`);
    console.log(`     URL: ${prog.sourceUrl}`);

    if (verdict !== 'OK') {
      console.log(flag);

      // Extra warning if code says active but page says dead
      if (prog.status === 'active' && ['UNAVAILABLE', 'PAGE_GONE', 'LIKELY_ENDED'].includes(verdict)) {
        console.log(`  🚨 MISMATCH: Code says ACTIVE but page indicates program may have ended!`);
      }
    } else {
      console.log(`     ✅ Page appears live`);
    }
    console.log('');
  }

  // Summary
  console.log('─'.repeat(62));
  if (issues === 0) {
    console.log(`\n  ✅ All ${programs.length} programs verified — no issues found.\n`);
  } else {
    console.log(`\n  ⚠️  ${issues} of ${programs.length} programs flagged for review.\n`);
    console.log(`  Action: Update src/data/programs.ts for any confirmed changes,`);
    console.log(`  then run 'npm run build' to propagate site-wide.\n`);
  }

  process.exit(issues > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(2);
});
