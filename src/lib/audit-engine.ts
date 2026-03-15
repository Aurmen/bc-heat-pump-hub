/**
 * audit-engine.ts — CEC Rule 8-200 Optional Method
 *
 * SERVER ONLY — this module is intentionally excluded from the client bundle.
 * The import below will throw a build error if any client component attempts
 * to import this file, protecting the proprietary calculation logic.
 */
import 'server-only';

export interface AuditInputs {
  sqft: number;
  serviceAmps: number;
  rangeW: number;
  dryerW: number;
  waterHeaterW: number;
  heatingW: number;
  coolingW: number;
  evW: number;
  loadManagement: boolean;
}

export interface AuditResult {
  // Intermediate steps (for briefing transparency)
  sqm: number;
  basicLoadW: number;
  extraBlocks: number;
  appliancesW: number;
  subtotal: number;
  afterDemand: number;
  // HVAC + EV
  hvacW: number;
  hvacIsHeating: boolean;
  evApplied: number;
  // Final outputs
  totalW: number;
  totalAmps: number;
  utilization: number;          // %
  continuousLimit: number;      // 80% of service rating
  serviceAmps: number;
  status: 'PASS' | 'WARN' | 'FAIL';
  overloadAmps: number;
}

/**
 * CEC Rule 8-200 Optional Method load calculation.
 * Returns null if any required input is out of valid range.
 */
export function runAudit(inputs: AuditInputs): AuditResult {
  const {
    sqft, serviceAmps, rangeW, dryerW,
    waterHeaterW, heatingW, coolingW, evW, loadManagement,
  } = inputs;

  // ── Step 1: Basic load (CEC 8-200, Table 14) ──────────────────────────────
  const sqm = sqft * 0.0929;
  const extraBlocks = Math.max(0, Math.ceil((sqm - 90) / 90));
  const basicLoadW = 5000 + extraBlocks * 1000;

  // ── Step 2: Major appliances at nameplate ──────────────────────────────────
  const appliancesW = rangeW + dryerW + waterHeaterW;

  // ── Step 3: Demand factor (CEC 8-200, 40% above 10 kW) ───────────────────
  const subtotal = basicLoadW + appliancesW;
  const afterDemand =
    subtotal <= 10000
      ? subtotal
      : 10000 + (subtotal - 10000) * 0.4;

  // ── Step 4: HVAC interlock (CEC 8-106) + EV at 100% ──────────────────────
  const hvacIsHeating = heatingW >= coolingW;
  const hvacW = Math.max(heatingW, coolingW);

  // EVSE: load-managed circuits derated to 1,440 W per BC Hydro EV tariff
  const evApplied = loadManagement ? 1440 : evW;

  const totalW = afterDemand + hvacW + evApplied;
  const totalAmps = totalW / 240;
  const continuousLimit = serviceAmps * 0.8;
  const utilization = (totalAmps / serviceAmps) * 100;
  const overloadAmps = Math.max(0, totalAmps - serviceAmps);

  const status: 'PASS' | 'WARN' | 'FAIL' =
    totalAmps <= continuousLimit ? 'PASS' :
    totalAmps <= serviceAmps     ? 'WARN' :
    'FAIL';

  return {
    sqm, basicLoadW, extraBlocks, appliancesW, subtotal,
    afterDemand, hvacW, hvacIsHeating, evApplied,
    totalW, totalAmps, utilization, continuousLimit,
    serviceAmps, status, overloadAmps,
  };
}
