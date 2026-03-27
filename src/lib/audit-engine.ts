/**
 * audit-engine.ts — CEC Rule 8-200 Optional Method (26th Edition, CSA C22.1:24)
 *
 * SERVER ONLY — this module is intentionally excluded from the client bundle.
 * The import below will throw a build error if any client component attempts
 * to import this file, protecting the proprietary calculation logic.
 *
 * Rules applied:
 *  8-200(1)(a)(i)+(ii)   Basic load: 5,000 W + 1,000 W per extra 90 m²
 *  8-200(1)(a)(iii)       Space heating per Section 62 (→ Rule 62-118(3))
 *                          + air-conditioning at 100%, subject to Rule 8-106(3)
 *  8-200(1)(a)(iv)        Range: 6,000 W base + 40% of amount exceeding 12 kW
 *  8-200(1)(a)(vii)(A)    Other loads > 1,500 W when range present: 25% each
 *                          Covers: dryer, water heater, and MUA (make-up air) heater
 *  8-200(1)(b)            Minimum demand floor: 24,000 W (≥ 80 m²) / 14,400 W (< 80 m²)
 *  8-106(3)               HVAC interlock: use the greater of heating demand or cooling
 *  8-106(11)              EV supply equipment excluded from calculated load when
 *                          EVEMS monitors and controls per Rule 8-500
 *  62-118(3)              Space heating: 100% of first 10 kW, 75% of balance
 *                          (residential occupancy with per-room thermostatic control)
 *
 * Thermal analysis (appended — does NOT alter CEC 8-200 electrical results):
 *  ISA hypsometric formula   Barometric pressure at elevation
 *  B149.1 Section 5.3        Gas appliance altitude derate (4% per 300 m, floor 0.72 at ~2100 m)
 *  Dual-fuel COP crossover   Economic switchover point (electricity vs gas per GJ)
 */
import 'server-only';

// ── Constants ─────────────────────────────────────────────────────────────────
/** kWh per gigajoule — used to convert gas $/GJ to $/kWh for COP crossover */
const KWH_PER_GJ = 277.78;

/** Format wattage for inline text (e.g. "5,000 W") */
function fmtW(w: number): string {
  return `${w.toLocaleString()} W`;
}

export interface AuditInputs {
  sqft: number;
  serviceAmps: number;
  rangeW: number;
  dryerW: number;
  waterHeaterW: number;
  /** Make-Up Air (MUA) electric heater — common ghost load for homes with
   *  high-CFM kitchen exhaust requiring tempered make-up air supply. */
  muaW: number;
  heatingW: number;
  coolingW: number;
  evW: number;
  loadManagement: boolean;

  // ── Dual-fuel & altitude (optional — thermal analysis) ────────────────────
  /** Site elevation in metres above sea level. Omit or 0 for sea level. */
  elevation?: number;
  /** Whether a residential dual-fuel (heat pump + gas furnace) system is present. */
  isDualFuel?: boolean;
  /** Balance point / switchover temperature in °C. Default 2°C per FortisBC/CleanBC. */
  balancePoint?: number;
  /** Gas furnace nameplate capacity in BTU/h. Omit or 0 if no gas furnace. */
  gasNameplateBtu?: number;
  /** Residential natural gas rate in $/GJ. Default 12.50 (FortisBC 2026). */
  gasRatePerGj?: number;
  /** Electricity rate in $/kWh. Default 0.14 (BC Hydro Step 2, 2026). */
  elecRatePerKwh?: number;
  /** Gas furnace AFUE as a decimal (e.g. 0.96 = 96%). Default 0.96. */
  furnaceAfue?: number;
}

export interface ThermalResult {
  elevationM: number;
  /** Barometric pressure at elevation (ISA hypsometric formula) in kPa */
  bpKpa: number;
  /** Corrected sensible heat constant (1.08 × density ratio) */
  correctedHeatConstant: number;
  /** CSA B149.1 Clause 8.22.1 derate factor (1.0 at/below 610 m) */
  derateFactor: number;
  /** Gas furnace nameplate BTU/h (as entered) */
  gasNameplateBtu: number;
  /** Effective BTU/h after altitude derate */
  effectiveBtu: number;
  /** Balance point / switchover temperature in °C */
  balancePoint: number;
  /** Gas rate in $/GJ used */
  gasRatePerGj: number;
  /** Electricity rate in $/kWh used */
  elecRatePerKwh: number;
  /** Furnace AFUE used */
  furnaceAfue: number;
  /** COP at which gas furnace becomes cheaper per unit of delivered heat */
  copCrossover: number;
}

/** One of the 4 HVAC load scenarios evaluated under CEC Rule 8-106(3) */
export interface HvacOption {
  id: 'heating_only' | 'cooling_only' | 'hp_and_ac' | 'no_hvac';
  label: string;
  demandW: number;
  selected: boolean;
  rule: string;
  explanation: string;
}

export interface AuditResult {
  // ── Intermediate steps (for briefing transparency) ───────────────────────
  sqm: number;
  extraBlocks: number;

  // 8-200(1)(a)(i)+(ii) Basic load
  basicLoadW: number;

  // 8-200(1)(a)(iv) Range demand factor
  rangeApplied: number;

  // 8-200(1)(a)(vii)(A) Other loads > 1,500 W at 25% when range present
  dryerApplied: number;
  waterHeaterApplied: number;
  muaApplied: number;            // Make-Up Air heater — same demand factor rule

  // 62-118(3) + 8-106(3) HVAC
  heatingDemand: number;    // heating load after 62-118(3) demand factor
  hvacW: number;            // applied (greater of heatingDemand vs coolingW)
  hvacIsHeating: boolean;
  /** All 4 HVAC scenarios with the applied one marked selected */
  hvacOptions: HvacOption[];

  // 8-200(1)(a)(vi) + 8-106(11) EV
  evApplied: number;        // 0 if EVEMS present, else full nameplate

  // ── Totals ───────────────────────────────────────────────────────────────
  calculatedW: number;      // sum before minimum demand floor
  minDemandW: number;       // Rule 8-200(1)(b) floor
  totalW: number;           // max(calculatedW, minDemandW)

  totalAmps: number;
  utilization: number;      // % of service rating
  continuousLimit: number;  // 80% of service rating in amps
  serviceAmps: number;
  status: 'PASS' | 'WARN' | 'FAIL';
  overloadAmps: number;

  // ── Thermal analysis (present when elevation > 0 OR gasNameplateBtu > 0) ──
  thermal?: ThermalResult;
}

/**
 * CEC Rule 8-200 Optional Method load calculation (26th Edition, CSA C22.1:24).
 * Returns authoritative server-side result; never called from client code.
 */
export function runAudit(inputs: AuditInputs): AuditResult {
  const {
    sqft, serviceAmps, rangeW, dryerW,
    waterHeaterW, muaW, heatingW, coolingW, evW, loadManagement,
    // Thermal inputs — all optional with safe defaults
    elevation = 0,
    isDualFuel = false,
    balancePoint = 2,
    gasNameplateBtu = 0,
    gasRatePerGj = 12.50,
    elecRatePerKwh = 0.14,
    furnaceAfue = 0.96,
  } = inputs;

  // ── 8-200(1)(a)(i)+(ii) Basic load ───────────────────────────────────────
  // 5,000 W for first 90 m² + 1,000 W per additional 90 m² block
  const sqm = sqft * 0.0929;
  const extraBlocks = Math.max(0, Math.ceil((sqm - 90) / 90));
  const basicLoadW = 5000 + extraBlocks * 1000;

  // ── 8-200(1)(a)(iv) Range demand factor ──────────────────────────────────
  // 6,000 W for a single range, plus 40% of any amount by which the
  // nameplate rating exceeds 12 kW. (Distinct from branch-circuit Rule 8-300
  // which uses an 8,000 W base — that rule governs branch circuits only.)
  const rangeApplied = rangeW > 0
    ? 6000 + Math.max(0, rangeW - 12000) * 0.4
    : 0;

  // ── 8-200(1)(a)(vii)(A) Other loads > 1,500 W ────────────────────────────
  // When a range is provided: 25% of the rating of each load rated > 1,500 W
  // that is not already addressed in sub-clauses (i)–(vi).
  // Standard electric / heat-pump water heaters and clothes dryers fall here.
  // (Tankless water heaters and pool/spa/steam heaters are sub-clause (v) at 100%.)
  const hasRange = rangeW > 0;
  const dryerApplied       = hasRange && dryerW       > 1500 ? dryerW       * 0.25 : dryerW;
  const waterHeaterApplied = hasRange && waterHeaterW > 1500 ? waterHeaterW * 0.25 : waterHeaterW;
  // MUA (Make-Up Air) heater — same sub-clause as dryer/water heater
  const muaApplied         = hasRange && muaW         > 1500 ? muaW         * 0.25 : muaW;

  // ── 8-200(1)(a)(iii) → Section 62 → 62-118(3) Space heating ─────────────
  // Demand factor for residential occupancy with per-room thermostatic control:
  //   100% of the first 10 kW + 75% of the balance.
  // Note: electric thermal storage, duct heaters, and furnaces use 100% per
  // Rule 62-118(4) — those loads should be declared separately by the owner.
  const heatingDemand = heatingW <= 10000
    ? heatingW
    : 10000 + (heatingW - 10000) * 0.75;

  // ── 8-106(3) HVAC interlock ───────────────────────────────────────────────
  // Space heating and air-conditioning cannot operate simultaneously.
  // Use whichever is the greater load: heating demand (after 62-118) or
  // cooling load at 100%.
  const hvacIsHeating = heatingDemand >= coolingW;
  const hvacW = Math.max(heatingDemand, coolingW);

  // ── HVAC options breakdown (all 4 scenarios for PDF transparency) ────────
  const hasHeating = heatingW > 0;
  const hasCooling = coolingW > 0;

  // Determine which scenario the user's inputs represent
  const selectedId: HvacOption['id'] =
    hasHeating && hasCooling ? 'hp_and_ac' :
    hasHeating               ? 'heating_only' :
    hasCooling               ? 'cooling_only' :
                               'no_hvac';

  const hvacOptions: HvacOption[] = [
    {
      id: 'heating_only',
      label: 'Heat Pump — Heating Only',
      demandW: heatingDemand,
      selected: selectedId === 'heating_only',
      rule: 'Rule 62-118(3): 100% first 10 kW + 75% balance',
      explanation: 'Electric heat pump for space heating with no central AC. ' +
        'Demand factored per Rule 62-118(3) for residential occupancy with ' +
        'per-room thermostatic control.',
    },
    {
      id: 'cooling_only',
      label: 'Central AC — Cooling Only',
      demandW: coolingW,
      selected: selectedId === 'cooling_only',
      rule: 'Rule 8-200(1)(a)(iii): 100% of nameplate',
      explanation: 'Central air conditioning at 100% of nameplate rating. ' +
        'No space heating load is declared — cooling is the sole HVAC demand.',
    },
    {
      id: 'hp_and_ac',
      label: 'Heat Pump + AC (Interlocked)',
      demandW: hvacW,
      selected: selectedId === 'hp_and_ac',
      rule: `Rule 8-106(3): use greater of heating (${fmtW(heatingDemand)}) or cooling (${fmtW(coolingW)})`,
      explanation: hvacIsHeating
        ? `Both heating and cooling loads are present. Per Rule 8-106(3), ` +
          `heating and cooling cannot operate simultaneously — the greater load ` +
          `governs. Heating demand (${fmtW(heatingDemand)}) exceeds cooling ` +
          `(${fmtW(coolingW)}), so heating is applied and cooling is excluded.`
        : `Both heating and cooling loads are present. Per Rule 8-106(3), ` +
          `heating and cooling cannot operate simultaneously — the greater load ` +
          `governs. Cooling (${fmtW(coolingW)}) exceeds heating demand ` +
          `(${fmtW(heatingDemand)}), so cooling is applied and heating is excluded.`,
    },
    {
      id: 'no_hvac',
      label: 'No HVAC Change',
      demandW: 0,
      selected: selectedId === 'no_hvac',
      rule: 'N/A — no heating or cooling load declared',
      explanation: 'Neither space heating nor cooling loads are included in the ' +
        'calculation. This represents the base electrical load without any HVAC equipment.',
    },
  ];

  // ── 8-200(1)(a)(vi) + 8-106(11) EV supply equipment ─────────────────────
  // If an Electric Vehicle Energy Management System (EVEMS) per Rule 8-500 is
  // present and performs both monitoring (service/feeders/branch circuits) and
  // control of EVSE loads, the EV demand shall not be required to be considered
  // in the calculated load [8-106(11)].
  // Without EVEMS: 100% of EVSE nameplate rating.
  const evApplied = loadManagement ? 0 : evW;

  // ── Calculated total (before minimum demand floor) ───────────────────────
  const calculatedW =
    basicLoadW + rangeApplied + dryerApplied + waterHeaterApplied + muaApplied + hvacW + evApplied;

  // ── 8-200(1)(b) Minimum demand floor ─────────────────────────────────────
  // The calculated load shall not be less than:
  //   24,000 W — floor area (exclusive of basement) ≥ 80 m²
  //   14,400 W — floor area (exclusive of basement) < 80 m²
  // We use total living area as provided; basement exclusion noted in disclaimer.
  const minDemandW = sqm >= 80 ? 24000 : 14400;
  const totalW = Math.max(calculatedW, minDemandW);

  // ── Service compliance ────────────────────────────────────────────────────
  const totalAmps = totalW / 240;
  const continuousLimit = serviceAmps * 0.8;
  const utilization = (totalAmps / serviceAmps) * 100;
  const overloadAmps = Math.max(0, totalAmps - serviceAmps);

  const status: 'PASS' | 'WARN' | 'FAIL' =
    totalAmps <= continuousLimit ? 'PASS' :
    totalAmps <= serviceAmps     ? 'WARN' :
    'FAIL';

  // ── Thermal analysis (altitude derate + dual-fuel crossover) ─────────────
  // Informational supplement — does NOT alter CEC 8-200 electrical compliance.
  const hasThermal = elevation > 0 || gasNameplateBtu > 0;

  const thermal: ThermalResult | undefined = hasThermal ? (() => {
    // ISA hypsometric formula — barometric pressure at elevation (kPa)
    const bpKpa = 101.325 * Math.pow(1 - 0.0000225577 * elevation, 5.25588);

    // Air density corrected sensible heat constant (Q = 1.08 × CFM × ΔT at sea level)
    // Scales linearly with air density, which is proportional to pressure at constant T.
    const correctedHeatConstant = 1.08 * (bpKpa / 101.325);

    // B149.1 Section 5.3 altitude correction — gas appliance derate
    // Derate factor = 1 - (0.04 × elevation_m / 300), minimum floor 0.72 (~2100 m).
    // Validation: 1500 m → 1 - (0.04 × 5) = 0.80; 100,000 BTU/h × 0.80 = 80,000 BTU/h ✓
    const derateFactor = Math.max(0.72, 1 - (0.04 * (elevation / 300)));

    // Effective gas furnace output after altitude derate
    const effectiveBtu = Math.round(gasNameplateBtu * derateFactor);

    // Economic crossover COP — the COP at which electricity cost per unit of
    // delivered heat equals gas cost per unit of delivered heat.
    // Formula: COP_crossover = (elecRate × furnaceAFUE × kWh/GJ) / gasRate
    // Below this COP, the gas furnace is cheaper. Above it, the heat pump wins.
    const copCrossover = gasRatePerGj > 0
      ? (elecRatePerKwh * furnaceAfue * KWH_PER_GJ) / gasRatePerGj
      : 0;

    return {
      elevationM: elevation,
      bpKpa: Math.round(bpKpa * 100) / 100,
      correctedHeatConstant: Math.round(correctedHeatConstant * 1000) / 1000,
      derateFactor: Math.round(derateFactor * 1000) / 1000,
      gasNameplateBtu,
      effectiveBtu,
      balancePoint,
      gasRatePerGj,
      elecRatePerKwh,
      furnaceAfue,
      copCrossover: Math.round(copCrossover * 100) / 100,
    };
  })() : undefined;

  return {
    sqm, extraBlocks, basicLoadW,
    rangeApplied, dryerApplied, waterHeaterApplied, muaApplied,
    heatingDemand, hvacW, hvacIsHeating, hvacOptions,
    evApplied,
    calculatedW, minDemandW, totalW,
    totalAmps, utilization, continuousLimit,
    serviceAmps, status, overloadAmps,
    thermal,
  };
}
