/**
 * nec-engine.ts — NEC Article 220.82 Optional Calculation (2023 NEC / NFPA 70)
 *
 * SERVER ONLY — this module is intentionally excluded from the client bundle.
 *
 * Rules applied:
 *  220.82(a)   General loads subtotal:
 *                - 3 VA per sq ft general lighting & receptacles
 *                - 1,500 VA per small-appliance branch circuit (minimum 2)
 *                - 1,500 VA for laundry circuit
 *                - Nameplate of all fastened-in-place appliances
 *              Demand factor: first 10 kVA at 100%, remainder at 40%
 *
 *  220.82(b)   Add the LARGEST of:
 *                (1) 100% of A/C nameplate
 *                (2) 100% of heat pump compressor + supplemental heat
 *                    (with interlock, non-simultaneous loads excluded)
 *                (3) 65% of central electric space heating (>= 4 units)
 *                (4) 100% of electric thermal storage
 *                → We implement (1), (2)/(3) selection based on heating type
 *
 *  625.41      EV supply equipment at nameplate (no exclusion without ELMS)
 *  625.42      Energy management system (ELMS) can reduce EV to managed load
 *
 * This engine does NOT alter the CEC 8-200 results — it is a parallel
 * US-market calculation for comparison or standalone US audits.
 */
import 'server-only';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface NecInputs {
  sqft: number;
  serviceAmps: number;

  // Appliances (fastened-in-place, nameplate watts)
  rangeW: number;
  dryerW: number;
  waterHeaterW: number;
  dishwasherW: number;

  // HVAC
  heatingW: number;
  coolingW: number;
  /** 'heat_pump' uses 100% of nameplate; 'central_resistance' uses 65% if >= 4 units */
  heatingType: 'heat_pump' | 'central_resistance';
  /** Number of individually controlled heating units (relevant for 65% factor) */
  heatingUnits: number;

  // EV
  evW: number;
  /** Energy Load Management System per NEC 625.42 */
  hasElms: boolean;
  /** Managed EV load in watts when ELMS is present (0 = fully excluded) */
  elmsLoadW: number;

  // Branch circuits
  /** Number of small-appliance 20A branch circuits (minimum 2 per 210.11(C)(1)) */
  smallApplianceCircuits: number;
  /** Whether a dedicated laundry circuit exists per 210.11(C)(2) */
  hasLaundryCircuit: boolean;

  // Additional fastened-in-place loads (garbage disposal, compactor, etc.)
  otherFixedW: number;
}

/** One of the HVAC load options per NEC 220.82(b) */
export interface NecHvacOption {
  id: 'ac_only' | 'heat_pump' | 'resistance_65' | 'resistance_100' | 'no_hvac';
  label: string;
  demandW: number;
  selected: boolean;
  rule: string;
  explanation: string;
}

export interface NecResult {
  // ── General loads 220.82(a) ─────────────────────────────────────────────
  generalLightingVA: number;     // 3 VA x sqft
  smallApplianceVA: number;      // 1,500 x circuits
  laundryVA: number;             // 1,500 or 0
  applianceTotalVA: number;      // sum of all fastened-in-place appliance nameplates
  generalSubtotalVA: number;     // sum of above

  // Demand factor breakdown
  first10kVA: number;            // min(subtotal, 10000) at 100%
  remainderVA: number;           // max(0, subtotal - 10000)
  remainderDemandVA: number;     // remainder x 40%
  generalDemandVA: number;       // first10kVA + remainderDemandVA

  // ── Individual appliance inputs (for PDF line items) ────────────────────
  rangeW: number;
  dryerW: number;
  waterHeaterW: number;
  dishwasherW: number;
  otherFixedW: number;

  // ── HVAC 220.82(b) ─────────────────────────────────────────────────────
  hvacDemandW: number;           // applied HVAC demand (largest of options)
  hvacOptions: NecHvacOption[];

  // ── EV 625.41 / 625.42 ─────────────────────────────────────────────────
  evAppliedW: number;            // full nameplate or ELMS-managed

  // ── Motor surcharge 220.82(c) / 430.24 ────────────────────────────────
  largestMotorW: number;         // nameplate of largest motor (typically HVAC)
  motorSurchargeW: number;       // 25% of largest motor

  // ── Totals ──────────────────────────────────────────────────────────────
  totalDemandVA: number;         // generalDemandVA + hvacDemandW + evAppliedW + motorSurcharge
  totalAmps: number;
  utilization: number;           // % of service rating
  continuousLimit: number;       // 80% of service rating in amps
  serviceAmps: number;
  status: 'PASS' | 'WARN' | 'FAIL';
  overloadAmps: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtW(w: number): string {
  return `${w.toLocaleString()} W`;
}

// ── Engine ────────────────────────────────────────────────────────────────────

export function runNecAudit(inputs: NecInputs): NecResult {
  const {
    sqft, serviceAmps,
    rangeW, dryerW, waterHeaterW, dishwasherW,
    heatingW, coolingW, heatingType, heatingUnits,
    evW, hasElms, elmsLoadW,
    smallApplianceCircuits, hasLaundryCircuit,
    otherFixedW,
  } = inputs;

  // ── 220.82(a) General loads subtotal ────────────────────────────────────
  const circuits = Math.max(2, smallApplianceCircuits);
  const generalLightingVA = 3 * sqft;
  const smallApplianceVA = 1500 * circuits;
  const laundryVA = hasLaundryCircuit ? 1500 : 0;

  // All fastened-in-place appliance nameplates
  const applianceTotalVA = rangeW + dryerW + waterHeaterW + dishwasherW + otherFixedW;

  const generalSubtotalVA = generalLightingVA + smallApplianceVA + laundryVA + applianceTotalVA;

  // Demand factor: first 10 kVA at 100%, remainder at 40%
  const first10kVA = Math.min(generalSubtotalVA, 10000);
  const remainderVA = Math.max(0, generalSubtotalVA - 10000);
  const remainderDemandVA = Math.round(remainderVA * 0.40);
  const generalDemandVA = first10kVA + remainderDemandVA;

  // ── 220.82(b) HVAC — add the LARGEST of the applicable options ─────────
  const hasHeating = heatingW > 0;
  const hasCooling = coolingW > 0;

  // Option 1: AC at 100%
  const acDemand = coolingW;

  // Option 2: Heat pump at 100% (compressor + supplemental)
  const heatPumpDemand = heatingW;

  // Option 3: Central resistance at 65% (if >= 4 individually controlled units)
  const resistance65 = heatingUnits >= 4 ? Math.round(heatingW * 0.65) : 0;

  // Option 4: Central resistance at 100% (if < 4 units)
  const resistance100 = heatingUnits < 4 ? heatingW : 0;

  // Determine which option applies based on heating type + inputs
  let selectedId: NecHvacOption['id'];
  let hvacDemandW: number;

  if (!hasHeating && !hasCooling) {
    selectedId = 'no_hvac';
    hvacDemandW = 0;
  } else if (!hasHeating) {
    selectedId = 'ac_only';
    hvacDemandW = acDemand;
  } else if (!hasCooling) {
    if (heatingType === 'heat_pump') {
      selectedId = 'heat_pump';
      hvacDemandW = heatPumpDemand;
    } else {
      selectedId = heatingUnits >= 4 ? 'resistance_65' : 'resistance_100';
      hvacDemandW = heatingUnits >= 4 ? resistance65 : resistance100;
    }
  } else {
    // Both heating and cooling present — use the LARGEST
    let heatDemand: number;
    if (heatingType === 'heat_pump') {
      heatDemand = heatPumpDemand;
    } else {
      heatDemand = heatingUnits >= 4 ? resistance65 : resistance100;
    }
    if (acDemand >= heatDemand) {
      selectedId = 'ac_only';
      hvacDemandW = acDemand;
    } else {
      if (heatingType === 'heat_pump') {
        selectedId = 'heat_pump';
      } else {
        selectedId = heatingUnits >= 4 ? 'resistance_65' : 'resistance_100';
      }
      hvacDemandW = heatDemand;
    }
  }

  const hvacOptions: NecHvacOption[] = [
    {
      id: 'ac_only',
      label: 'Air Conditioning Only',
      demandW: acDemand,
      selected: selectedId === 'ac_only',
      rule: '220.82(b)(1): 100% of A/C nameplate',
      explanation: hasCooling
        ? `Central air conditioning at 100% of nameplate rating (${fmtW(coolingW)}).`
        : 'No cooling load declared.',
    },
    {
      id: 'heat_pump',
      label: 'Heat Pump (compressor + aux)',
      demandW: heatPumpDemand,
      selected: selectedId === 'heat_pump',
      rule: '220.82(b)(2): 100% of HP compressor + supplemental',
      explanation: heatingType === 'heat_pump' && hasHeating
        ? `Heat pump compressor and supplemental heat at 100% of combined nameplate (${fmtW(heatingW)}). ` +
          `Per 220.82(b)(2), non-simultaneous loads with interlock may be excluded.`
        : 'Not applicable — heating type is not heat pump.',
    },
    {
      id: 'resistance_65',
      label: 'Central Resistance (65%)',
      demandW: resistance65,
      selected: selectedId === 'resistance_65',
      rule: '220.82(b)(3): 65% of central electric heating (>= 4 units)',
      explanation: heatingType === 'central_resistance' && heatingUnits >= 4
        ? `Central electric space heating with ${heatingUnits} individually controlled units. ` +
          `65% demand factor applied: ${fmtW(heatingW)} x 65% = ${fmtW(resistance65)}.`
        : 'Not applicable — fewer than 4 heating units or not resistance heating.',
    },
    {
      id: 'resistance_100',
      label: 'Central Resistance (100%)',
      demandW: resistance100,
      selected: selectedId === 'resistance_100',
      rule: '220.82(b)(3): 100% (fewer than 4 units)',
      explanation: heatingType === 'central_resistance' && heatingUnits < 4
        ? `Central electric space heating with ${heatingUnits} unit(s). ` +
          `Fewer than 4 individually controlled units — 100% demand factor applies.`
        : 'Not applicable — 4+ heating units or not resistance heating.',
    },
    {
      id: 'no_hvac',
      label: 'No HVAC',
      demandW: 0,
      selected: selectedId === 'no_hvac',
      rule: 'N/A — no heating or cooling load declared',
      explanation: 'Neither heating nor cooling loads are included in this calculation.',
    },
  ];

  // ── EV 625.41 / 625.42 ─────────────────────────────────────────────────
  const evAppliedW = evW > 0
    ? (hasElms ? elmsLoadW : evW)
    : 0;

  // ── 220.82(c) / 430.24 Motor surcharge ──────────────────────────────────
  // Add 25% of the largest motor load. For heat pumps and AC, the
  // compressor motor is typically the largest motor in the dwelling.
  const largestMotorW = hvacDemandW;
  const motorSurchargeW = largestMotorW > 0 ? Math.round(largestMotorW * 0.25) : 0;

  // ── Totals ──────────────────────────────────────────────────────────────
  const totalDemandVA = generalDemandVA + hvacDemandW + evAppliedW + motorSurchargeW;
  const totalAmps = totalDemandVA / 240;
  const continuousLimit = serviceAmps * 0.8;
  const utilization = (totalAmps / serviceAmps) * 100;
  const overloadAmps = Math.max(0, totalAmps - serviceAmps);

  const status: 'PASS' | 'WARN' | 'FAIL' =
    totalAmps <= continuousLimit ? 'PASS' :
    totalAmps <= serviceAmps     ? 'WARN' :
    'FAIL';

  return {
    generalLightingVA, smallApplianceVA, laundryVA,
    applianceTotalVA, generalSubtotalVA,
    first10kVA, remainderVA, remainderDemandVA, generalDemandVA,
    rangeW, dryerW, waterHeaterW, dishwasherW, otherFixedW,
    hvacDemandW, hvacOptions,
    evAppliedW,
    largestMotorW, motorSurchargeW,
    totalDemandVA, totalAmps, utilization, continuousLimit,
    serviceAmps, status, overloadAmps,
  };
}
