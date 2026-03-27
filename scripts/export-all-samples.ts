/**
 * Export all sample PDFs to docs/ for review.
 * Run: npx tsx --require ./scripts/stub-server-only.cjs scripts/export-all-samples.ts
 */
import { writeFileSync, mkdirSync } from 'fs';
import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';

import { runAudit } from '../src/lib/audit-engine';
import { AuditReportDocument } from '../src/lib/AuditReportPDF';
import { runNecAudit } from '../src/lib/nec-engine';
import { NecReportDocument } from '../src/lib/NecReportPDF';

const OUT = 'docs/sample-reports';

async function pdf(el: React.ReactElement, file: string) {
  const buf = await renderToBuffer(el as unknown as Parameters<typeof renderToBuffer>[0]);
  writeFileSync(`${OUT}/${file}`, buf);
  console.log(`  ${file} (${(buf.length / 1024).toFixed(1)} KB)`);
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const now = new Date().toISOString();

  // ── CEC samples ─────────────────────────────────────────────────────────
  console.log('CEC (Canada) — Rule 8-200:');

  // 1. PASS — 200A, modest loads
  const cecPass = runAudit({
    sqft: 1800, serviceAmps: 200,
    rangeW: 12000, dryerW: 5400, waterHeaterW: 4500, muaW: 0,
    heatingW: 12000, coolingW: 0, evW: 7200, loadManagement: false,
  });
  await pdf(React.createElement(AuditReportDocument, {
    reportId: 'GL-CEC-PASS', generatedAt: now,
    inputs: { sqft: 1800, serviceAmps: 200, rangeW: 12000, dryerW: 5400, waterHeaterW: 4500, muaW: 0, heatingW: 12000, coolingW: 0, evW: 7200, loadManagement: false },
    result: cecPass,
  }), 'CEC-PASS-200A.pdf');

  // 2. WARN — 100A, heat pump + AC
  const cecWarn = runAudit({
    sqft: 1200, serviceAmps: 100,
    rangeW: 12000, dryerW: 5400, waterHeaterW: 4500, muaW: 0,
    heatingW: 8000, coolingW: 3500, evW: 0, loadManagement: false,
  });
  await pdf(React.createElement(AuditReportDocument, {
    reportId: 'GL-CEC-WARN', generatedAt: now,
    inputs: { sqft: 1200, serviceAmps: 100, rangeW: 12000, dryerW: 5400, waterHeaterW: 4500, muaW: 0, heatingW: 8000, coolingW: 3500, evW: 0, loadManagement: false },
    result: cecWarn,
  }), 'CEC-WARN-100A.pdf');

  // 3. FAIL — 100A, full load + thermal
  const cecFailInputs = {
    sqft: 2200, serviceAmps: 100,
    rangeW: 12000, dryerW: 5400, waterHeaterW: 4500, muaW: 3000,
    heatingW: 15000, coolingW: 5000, evW: 7200, loadManagement: false,
    elevation: 450, isDualFuel: true, balancePoint: 2,
    gasNameplateBtu: 80000, gasRatePerGj: 12.50, elecRatePerKwh: 0.14, furnaceAfue: 0.96,
  };
  const cecFail = runAudit(cecFailInputs);
  await pdf(React.createElement(AuditReportDocument, {
    reportId: 'GL-CEC-FAIL', generatedAt: now,
    inputs: cecFailInputs, result: cecFail,
  }), 'CEC-FAIL-100A-thermal.pdf');

  // 4. PASS w/ EVEMS — 125A
  const cecEvems = runAudit({
    sqft: 1200, serviceAmps: 125,
    rangeW: 12000, dryerW: 5400, waterHeaterW: 4500, muaW: 0,
    heatingW: 8000, coolingW: 3500, evW: 7200, loadManagement: true,
  });
  await pdf(React.createElement(AuditReportDocument, {
    reportId: 'GL-CEC-EVEMS', generatedAt: now,
    inputs: { sqft: 1200, serviceAmps: 125, rangeW: 12000, dryerW: 5400, waterHeaterW: 4500, muaW: 0, heatingW: 8000, coolingW: 3500, evW: 7200, loadManagement: true },
    result: cecEvems,
  }), 'CEC-PASS-125A-EVEMS.pdf');

  // ── NEC samples ─────────────────────────────────────────────────────────
  console.log('\nNEC (US) — Article 220.82:');

  // 5. PASS — 200A, heat pump (moderate loads to stay under 80% with motor surcharge)
  const necPass = runNecAudit({
    sqft: 2000, serviceAmps: 200,
    rangeW: 12000, dryerW: 5400, waterHeaterW: 4500, dishwasherW: 1400,
    heatingW: 8000, coolingW: 3500,
    heatingType: 'heat_pump', heatingUnits: 1,
    evW: 7680, hasElms: false, elmsLoadW: 0,
    smallApplianceCircuits: 2, hasLaundryCircuit: true, otherFixedW: 0,
  });
  await pdf(React.createElement(NecReportDocument, {
    reportId: 'GL-NEC-PASS', generatedAt: now,
    inputs: { sqft: 2000, serviceAmps: 200, rangeW: 12000, dryerW: 5400, waterHeaterW: 4500, dishwasherW: 1400, heatingW: 8000, coolingW: 3500, heatingType: 'heat_pump' as const, heatingUnits: 1, evW: 7680, hasElms: false, elmsLoadW: 0, smallApplianceCircuits: 2, hasLaundryCircuit: true, otherFixedW: 0 },
    result: necPass,
  }), 'NEC-PASS-200A.pdf');

  // 6. FAIL — 100A, full load
  const necFail = runNecAudit({
    sqft: 2400, serviceAmps: 100,
    rangeW: 12000, dryerW: 5400, waterHeaterW: 4500, dishwasherW: 1400,
    heatingW: 15000, coolingW: 5000,
    heatingType: 'heat_pump', heatingUnits: 1,
    evW: 9600, hasElms: false, elmsLoadW: 0,
    smallApplianceCircuits: 2, hasLaundryCircuit: true, otherFixedW: 1200,
  });
  await pdf(React.createElement(NecReportDocument, {
    reportId: 'GL-NEC-FAIL', generatedAt: now,
    inputs: { sqft: 2400, serviceAmps: 100, rangeW: 12000, dryerW: 5400, waterHeaterW: 4500, dishwasherW: 1400, heatingW: 15000, coolingW: 5000, heatingType: 'heat_pump' as const, heatingUnits: 1, evW: 9600, hasElms: false, elmsLoadW: 0, smallApplianceCircuits: 2, hasLaundryCircuit: true, otherFixedW: 1200 },
    result: necFail,
  }), 'NEC-FAIL-100A.pdf');

  // 7. WARN w/ ELMS — 150A
  const necElms = runNecAudit({
    sqft: 1800, serviceAmps: 150,
    rangeW: 12000, dryerW: 5400, waterHeaterW: 4500, dishwasherW: 1400,
    heatingW: 10000, coolingW: 5000,
    heatingType: 'heat_pump', heatingUnits: 1,
    evW: 9600, hasElms: true, elmsLoadW: 1440,
    smallApplianceCircuits: 2, hasLaundryCircuit: true, otherFixedW: 0,
  });
  await pdf(React.createElement(NecReportDocument, {
    reportId: 'GL-NEC-ELMS', generatedAt: now,
    inputs: { sqft: 1800, serviceAmps: 150, rangeW: 12000, dryerW: 5400, waterHeaterW: 4500, dishwasherW: 1400, heatingW: 10000, coolingW: 5000, heatingType: 'heat_pump' as const, heatingUnits: 1, evW: 9600, hasElms: true, elmsLoadW: 1440, smallApplianceCircuits: 2, hasLaundryCircuit: true, otherFixedW: 0 },
    result: necElms,
  }), 'NEC-WARN-150A-ELMS.pdf');

  // 8. Resistance heating — 200A, 65% factor
  const necResistance = runNecAudit({
    sqft: 2200, serviceAmps: 200,
    rangeW: 12000, dryerW: 5400, waterHeaterW: 4500, dishwasherW: 1400,
    heatingW: 20000, coolingW: 5000,
    heatingType: 'central_resistance', heatingUnits: 5,
    evW: 0, hasElms: false, elmsLoadW: 0,
    smallApplianceCircuits: 3, hasLaundryCircuit: true, otherFixedW: 800,
  });
  await pdf(React.createElement(NecReportDocument, {
    reportId: 'GL-NEC-RESIST', generatedAt: now,
    inputs: { sqft: 2200, serviceAmps: 200, rangeW: 12000, dryerW: 5400, waterHeaterW: 4500, dishwasherW: 1400, heatingW: 20000, coolingW: 5000, heatingType: 'central_resistance' as const, heatingUnits: 5, evW: 0, hasElms: false, elmsLoadW: 0, smallApplianceCircuits: 3, hasLaundryCircuit: true, otherFixedW: 800 },
    result: necResistance,
  }), 'NEC-PASS-200A-resistance.pdf');

  console.log(`\nAll 8 PDFs exported to ${OUT}/`);
}

main().catch(err => { console.error(err); process.exit(1); });
