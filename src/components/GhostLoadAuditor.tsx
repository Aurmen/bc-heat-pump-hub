'use client';

import { useState, useEffect, type ChangeEvent } from 'react';
import Link from 'next/link';
import { track } from '@vercel/analytics';
import AuditLeadForm, { type AuditLeadData } from '@/components/AuditLeadForm';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface FormState {
  sqft: string;
  serviceSize: string;
  rangeW: string;
  dryerW: string;
  waterHeaterW: string;
  muaW: string;
  heatingW: string;
  coolingW: string;
  evW: string;
  loadManagement: boolean;
  // Dual-fuel & altitude
  elevation: string;
  isDualFuel: boolean;
  balancePoint: string;
  gasNameplateBtu: string;
  gasRatePerGj: string;
  elecRatePerKwh: string;
  furnaceAfue: string;
}

interface ThermalCalcResult {
  elevationM: number;
  bpKpa: number;
  correctedHeatConstant: number;
  derateFactor: number;
  gasNameplateBtu: number;
  effectiveBtu: number;
  balancePoint: number;
  gasRatePerGj: number;
  elecRatePerKwh: number;
  furnaceAfue: number;
  copCrossover: number;
}

interface CalcResult {
  sqm: number;
  extraBlocks: number;
  basicLoadW: number;
  // 8-200(1)(a)(iv)
  rangeApplied: number;
  // 8-200(1)(a)(vii)(A)
  dryerApplied: number;
  waterHeaterApplied: number;
  muaApplied: number;
  // 62-118(3) + 8-106(3)
  heatingDemand: number;
  hvacW: number;
  hvacIsHeating: boolean;
  // 8-106(11)
  evApplied: number;
  // totals
  calculatedW: number;
  minDemandW: number;
  totalW: number;
  totalAmps: number;
  utilization: number;
  continuousLimit: number;
  service: number;
  status: 'PASS' | 'WARN' | 'FAIL';
  overload: number;
  // thermal (informational — does not affect PASS/WARN/FAIL)
  thermal?: ThermalCalcResult;
}

// ── Constants ─────────────────────────────────────────────────────────────────
/** kWh per gigajoule — converts gas $/GJ to $/kWh for COP crossover */
const KWH_PER_GJ = 277.78;

// ── Calculation Engine ────────────────────────────────────────────────────────

function toNum(s: string): number | null {
  const v = parseFloat(s);
  return isNaN(v) ? null : v;
}

function runCalc(f: FormState, managedEV: boolean): CalcResult | null {
  const sqft   = toNum(f.sqft);
  const service = toNum(f.serviceSize);
  const rangeW  = toNum(f.rangeW);
  const dryerW  = toNum(f.dryerW);
  const whW     = toNum(f.waterHeaterW);
  const muaIn   = toNum(f.muaW);
  const heatW   = toNum(f.heatingW);
  const coolW   = toNum(f.coolingW);
  const evIn    = toNum(f.evW);

  // Thermal inputs — safe defaults, never null-guard
  const elevM      = toNum(f.elevation) ?? 0;
  const gasBtu     = toNum(f.gasNameplateBtu) ?? 0;
  const balPt      = toNum(f.balancePoint) ?? 2;
  const gasRate    = toNum(f.gasRatePerGj) ?? 12.50;
  const elecRate   = toNum(f.elecRatePerKwh) ?? 0.14;
  const afue       = toNum(f.furnaceAfue) ?? 0.96;

  if (
    sqft === null || sqft <= 0 ||
    service === null || service <= 0 ||
    rangeW === null || rangeW < 0 ||
    dryerW === null || dryerW < 0 ||
    whW === null || whW < 0 ||
    muaIn === null || muaIn < 0 ||
    heatW === null || heatW < 0 ||
    coolW === null || coolW < 0 ||
    evIn === null || evIn < 0
  ) {
    return null;
  }

  // ── 8-200(1)(a)(i)+(ii) Basic load ────────────────────────────────────
  const sqm = sqft * 0.0929;
  const extraBlocks = Math.max(0, Math.ceil((sqm - 90) / 90));
  const basicLoadW = 5000 + extraBlocks * 1000;

  // ── 8-200(1)(a)(iv) Range demand factor ───────────────────────────────
  // 6,000 W base + 40% of amount exceeding 12 kW
  const rangeApplied = rangeW > 0
    ? 6000 + Math.max(0, rangeW - 12000) * 0.4
    : 0;

  // ── 8-200(1)(a)(vii)(A) Other loads > 1,500 W at 25% when range present
  const hasRange = rangeW > 0;
  const dryerApplied       = hasRange && dryerW > 1500 ? dryerW * 0.25 : dryerW;
  const waterHeaterApplied = hasRange && whW   > 1500 ? whW    * 0.25 : whW;
  // MUA (Make-Up Air) heater — same sub-clause
  const muaApplied         = hasRange && muaIn > 1500 ? muaIn  * 0.25 : muaIn;

  // ── 62-118(3) Space heating demand factor → 8-106(3) HVAC interlock ──
  const heatingDemand = heatW <= 10000
    ? heatW
    : 10000 + (heatW - 10000) * 0.75;

  const hvacIsHeating = heatingDemand >= coolW;
  const hvacW = Math.max(heatingDemand, coolW);

  // ── 8-200(1)(a)(vi) + 8-106(11) EV supply equipment ──────────────────
  // EVEMS present → excluded from calculated load per Rule 8-106(11)
  const evApplied = managedEV ? 0 : evIn;

  // ── Calculated total ──────────────────────────────────────────────────
  const calculatedW =
    basicLoadW + rangeApplied + dryerApplied + waterHeaterApplied + muaApplied + hvacW + evApplied;

  // ── 8-200(1)(b) Minimum demand floor ──────────────────────────────────
  const minDemandW = sqm >= 80 ? 24000 : 14400;
  const totalW = Math.max(calculatedW, minDemandW);

  const totalAmps = totalW / 240;
  const continuousLimit = service * 0.8;
  const utilization = (totalAmps / service) * 100;
  const overload = Math.max(0, totalAmps - service);

  const status: 'PASS' | 'WARN' | 'FAIL' =
    totalAmps <= continuousLimit ? 'PASS' :
    totalAmps <= service         ? 'WARN' :
    'FAIL';

  // ── Thermal analysis (informational — does NOT alter PASS/WARN/FAIL) ──
  const hasThermal = elevM > 0 || gasBtu > 0;

  const thermal: ThermalCalcResult | undefined = hasThermal ? (() => {
    // ISA hypsometric formula — barometric pressure at elevation (kPa)
    const bpKpa = 101.325 * Math.pow(1 - 0.0000225577 * elevM, 5.25588);

    // Air density corrected sensible heat constant (1.08 at sea level)
    const correctedHeatConstant = 1.08 * (bpKpa / 101.325);

    // B149.1 Section 5.3 altitude correction — gas appliance derate
    // Derate factor = 1 - (0.04 × elevation_m / 300), minimum floor 0.72 (~2100 m).
    // Validation: 1500 m → 1 - (0.04 × 5) = 0.80; 100,000 BTU/h × 0.80 = 80,000 BTU/h ✓
    const derateFactor = Math.max(0.72, 1 - (0.04 * (elevM / 300)));

    // Effective gas furnace output after altitude derate
    const effectiveBtu = Math.round(gasBtu * derateFactor);

    // Economic crossover COP — COP at which electricity cost per unit of
    // delivered heat equals gas cost per unit of delivered heat
    const copCrossover = gasRate > 0
      ? (elecRate * afue * KWH_PER_GJ) / gasRate
      : 0;

    return {
      elevationM: elevM,
      bpKpa: Math.round(bpKpa * 100) / 100,
      correctedHeatConstant: Math.round(correctedHeatConstant * 1000) / 1000,
      derateFactor: Math.round(derateFactor * 1000) / 1000,
      gasNameplateBtu: gasBtu,
      effectiveBtu,
      balancePoint: balPt,
      gasRatePerGj: gasRate,
      elecRatePerKwh: elecRate,
      furnaceAfue: afue,
      copCrossover: Math.round(copCrossover * 100) / 100,
    };
  })() : undefined;

  return {
    sqm, extraBlocks, basicLoadW,
    rangeApplied, dryerApplied, waterHeaterApplied, muaApplied,
    heatingDemand, hvacW, hvacIsHeating,
    evApplied,
    calculatedW, minDemandW, totalW,
    totalAmps, utilization, continuousLimit,
    service, status, overload,
    thermal,
  };
}

// ── Status styles ─────────────────────────────────────────────────────────────

const STATUS_STYLES = {
  PASS: {
    card: 'bg-green-50 border-green-200',
    ampText: 'text-green-700',
    badge: 'bg-green-100 text-green-800 border border-green-300',
    icon: '✓',
  },
  WARN: {
    card: 'bg-amber-50 border-amber-200',
    ampText: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-800 border border-amber-300',
    icon: '⚠',
  },
  FAIL: {
    card: 'bg-red-50 border-red-200',
    ampText: 'text-red-700',
    badge: 'bg-red-100 text-red-800 border border-red-300',
    icon: '✕',
  },
};

// ── ResultCard ────────────────────────────────────────────────────────────────

function ResultCard({
  result,
  label,
  heatingW,
  coolingW,
}: {
  result: CalcResult;
  label: string;
  heatingW: number;
  coolingW: number;
}) {
  const s = STATUS_STYLES[result.status];
  return (
    <div className={`rounded-xl border-2 p-6 ${s.card}`}>
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider leading-tight">
          {label}
        </h3>
        <span className={`ml-2 shrink-0 text-sm font-bold px-3 py-1 rounded-full ${s.badge}`}>
          {s.icon} {result.status}
        </span>
      </div>

      <div className="mb-5">
        <span className={`text-6xl font-extrabold tabular-nums leading-none ${s.ampText}`}>
          {result.totalAmps.toFixed(1)}
        </span>
        <span className="text-gray-500 text-xl ml-1.5">A</span>
      </div>

      <dl className="space-y-2 text-sm border-t border-gray-200 pt-4">
        <div className="flex justify-between">
          <dt className="text-gray-600">Total load</dt>
          <dd className="font-semibold text-gray-900">{result.totalW.toLocaleString()} W</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-600">Utilization</dt>
          <dd className="font-semibold text-gray-900">
            {result.utilization.toFixed(0)}% of {result.service}A
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-600">80% continuous limit</dt>
          <dd className="font-semibold text-gray-900">
            {result.continuousLimit.toFixed(0)} A
          </dd>
        </div>
      </dl>

      <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-600 leading-relaxed">
        <span className="font-semibold">HVAC applied: </span>
        {result.hvacIsHeating
          ? `Heating / heat strip (${heatingW.toLocaleString()} W) — cooling (${coolingW.toLocaleString()} W) excluded per CEC 8-106 interlock`
          : `Cooling / AC (${coolingW.toLocaleString()} W) — heating (${heatingW.toLocaleString()} W) excluded per CEC 8-106 interlock`}
      </div>
    </div>
  );
}

// ── CalcBreakdown ─────────────────────────────────────────────────────────────

function CalcBreakdown({
  resultA,
  resultB,
  form,
}: {
  resultA: CalcResult;
  resultB: CalcResult | null;
  form: FormState;
}) {
  const heatingW = parseFloat(form.heatingW);
  const coolingW = parseFloat(form.coolingW);
  const rangeW   = parseFloat(form.rangeW);
  const dryerW   = parseFloat(form.dryerW);
  const whW      = parseFloat(form.waterHeaterW);
  const muaW     = parseFloat(form.muaW);
  const hasRange = rangeW > 0;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          CEC Rule 8-200 Optional Method — Full Calculation
        </h3>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* ── Left column — Steps 1–3 (identical for both scenarios) ── */}
        <div className="space-y-6">

          {/* Step 1 — Basic Load */}
          <div>
            <p className="text-xs font-semibold text-primary-700 uppercase tracking-wide mb-2">
              Step 1 — Basic Load [8-200(1)(a)(i)+(ii)]
            </p>
            <div className="bg-gray-50 rounded-lg px-4 py-3 font-mono text-xs text-gray-700 space-y-1">
              <div className="flex justify-between">
                <span>Floor area</span>
                <span>{resultA.sqm.toFixed(1)} m² ({form.sqft} ft² × 0.0929)</span>
              </div>
              <div className="flex justify-between">
                <span>First 90 m²</span>
                <span>5,000 W</span>
              </div>
              {resultA.extraBlocks > 0 && (
                <div className="flex justify-between">
                  <span>+{resultA.extraBlocks} × 90 m² block{resultA.extraBlocks > 1 ? 's' : ''} × 1,000 W</span>
                  <span>+{(resultA.extraBlocks * 1000).toLocaleString()} W</span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-200 pt-1 font-bold">
                <span>Step 1 subtotal</span>
                <span>{resultA.basicLoadW.toLocaleString()} W</span>
              </div>
            </div>
          </div>

          {/* Step 2 — Range demand factor */}
          <div>
            <p className="text-xs font-semibold text-primary-700 uppercase tracking-wide mb-2">
              Step 2 — Range / Cooktop [8-200(1)(a)(iv)]
            </p>
            <div className="bg-gray-50 rounded-lg px-4 py-3 font-mono text-xs text-gray-700 space-y-1">
              {hasRange ? (
                <>
                  <div className="flex justify-between">
                    <span>Range nameplate</span>
                    <span>{rangeW.toLocaleString()} W</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Base demand (single range)</span>
                    <span>6,000 W</span>
                  </div>
                  {rangeW > 12000 && (
                    <div className="flex justify-between">
                      <span>+{(rangeW - 12000).toLocaleString()} W above 12 kW × 40%</span>
                      <span>+{((rangeW - 12000) * 0.4).toLocaleString()} W</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex justify-between">
                  <span>No range — load omitted</span>
                  <span>0 W</span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-200 pt-1 font-bold">
                <span>Step 2 applied</span>
                <span>{resultA.rangeApplied.toLocaleString()} W</span>
              </div>
            </div>
          </div>

          {/* Step 3 — Other appliances with demand factors */}
          <div>
            <p className="text-xs font-semibold text-primary-700 uppercase tracking-wide mb-2">
              Step 3 — Other Appliances [8-200(1)(a)(vii)(A)]
            </p>
            <div className="bg-gray-50 rounded-lg px-4 py-3 font-mono text-xs text-gray-700 space-y-1">
              <div className="text-gray-500 italic mb-1">
                {hasRange
                  ? 'Range present → loads > 1,500 W at 25% each'
                  : 'No range → loads at 100% nameplate'}
              </div>
              <div className="flex justify-between">
                <span>
                  Dryer{' '}
                  {hasRange && dryerW > 1500
                    ? `(${dryerW.toLocaleString()} W × 25%)`
                    : `(${dryerW.toLocaleString()} W × 100%)`}
                </span>
                <span>{resultA.dryerApplied.toLocaleString()} W</span>
              </div>
              <div className="flex justify-between">
                <span>
                  Water heater{' '}
                  {hasRange && whW > 1500
                    ? `(${whW.toLocaleString()} W × 25%)`
                    : `(${whW.toLocaleString()} W × 100%)`}
                </span>
                <span>{resultA.waterHeaterApplied.toLocaleString()} W</span>
              </div>
              {muaW > 0 && (
                <div className="flex justify-between">
                  <span>
                    MUA heater{' '}
                    {hasRange && muaW > 1500
                      ? `(${muaW.toLocaleString()} W × 25%)`
                      : `(${muaW.toLocaleString()} W × 100%)`}
                  </span>
                  <span>{resultA.muaApplied.toLocaleString()} W</span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-200 pt-1 font-bold">
                <span>Step 3 total</span>
                <span>{(resultA.dryerApplied + resultA.waterHeaterApplied + resultA.muaApplied).toLocaleString()} W</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right column — Steps 4–5 + Totals ── */}
        <div className="space-y-6">

          {/* Step 4 — Space heating demand factor + HVAC interlock */}
          <div>
            <p className="text-xs font-semibold text-primary-700 uppercase tracking-wide mb-2">
              Step 4 — HVAC [62-118(3) + 8-106(3)]
            </p>
            <div className="bg-gray-50 rounded-lg px-4 py-3 font-mono text-xs text-gray-700 space-y-1">
              <div className="flex justify-between">
                <span>Heating nameplate</span>
                <span>{heatingW.toLocaleString()} W</span>
              </div>
              {heatingW > 10000 ? (
                <>
                  <div className="flex justify-between text-gray-500">
                    <span>First 10,000 W @ 100%</span>
                    <span>10,000 W</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>+{(heatingW - 10000).toLocaleString()} W balance @ 75%</span>
                    <span>{Math.round((heatingW - 10000) * 0.75).toLocaleString()} W</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-gray-500">
                  <span>≤ 10,000 W → 100% applied</span>
                  <span></span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Heating demand [62-118(3)]</span>
                <span>{resultA.heatingDemand.toLocaleString()} W</span>
              </div>
              <div className="flex justify-between">
                <span>Cooling nameplate [@ 100%]</span>
                <span>{coolingW.toLocaleString()} W</span>
              </div>
              <div className="flex justify-between font-medium text-gray-900">
                <span>
                  {resultA.hvacIsHeating
                    ? '→ Heating applied (greater)'
                    : '→ Cooling applied (greater)'}
                </span>
                <span>{resultA.hvacW.toLocaleString()} W</span>
              </div>
              <div className="flex justify-between text-gray-400 line-through">
                <span>
                  {resultA.hvacIsHeating
                    ? `Cooling ${coolingW.toLocaleString()} W (8-106 interlock)`
                    : `Heating demand ${resultA.heatingDemand.toLocaleString()} W (8-106 interlock)`}
                </span>
                <span>0 W</span>
              </div>
            </div>
          </div>

          {/* Step 5 — EV supply equipment */}
          <div>
            <p className="text-xs font-semibold text-primary-700 uppercase tracking-wide mb-2">
              Step 5 — EV Supply Equipment [8-106(11)]
            </p>
            <div className="bg-gray-50 rounded-lg px-4 py-3 font-mono text-xs text-gray-700 space-y-1">
              <div className="flex justify-between">
                <span>EVSE nameplate</span>
                <span>{parseFloat(form.evW).toLocaleString()} W</span>
              </div>
              {resultB ? (
                <>
                  <div className="flex justify-between">
                    <span>Scenario A — no EVEMS</span>
                    <span>{resultA.evApplied.toLocaleString()} W</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Scenario B — EVEMS present [8-106(11)]</span>
                    <span className="text-green-700 font-semibold">
                      {resultB.evApplied.toLocaleString()} W (excluded)
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between">
                  <span>No EVEMS — full nameplate applied</span>
                  <span>{resultA.evApplied.toLocaleString()} W</span>
                </div>
              )}
            </div>
          </div>

          {/* Grand Totals */}
          <div>
            <p className="text-xs font-semibold text-primary-700 uppercase tracking-wide mb-2">
              Grand Totals [8-200(1)(b)]
            </p>
            <div className="bg-gray-50 rounded-lg px-4 py-3 font-mono text-xs text-gray-700 space-y-1">
              <div className="flex justify-between text-gray-500">
                <span>Steps 1+2+3 (basic + range + appliances)</span>
                <span>
                  {(resultA.basicLoadW + resultA.rangeApplied + resultA.dryerApplied + resultA.waterHeaterApplied + resultA.muaApplied).toLocaleString()} W
                </span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Step 4 — HVAC</span>
                <span>+{resultA.hvacW.toLocaleString()} W</span>
              </div>
              {resultA.evApplied > 0 && (
                <div className="flex justify-between text-gray-500">
                  <span>Step 5 — EV (unmanaged)</span>
                  <span>+{resultA.evApplied.toLocaleString()} W</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-gray-900">
                <span>{resultB ? 'Scenario A — calculated' : 'Calculated total'}</span>
                <span>{resultA.calculatedW.toLocaleString()} W</span>
              </div>
              {resultB && (
                <div className="flex justify-between font-bold text-gray-900">
                  <span>Scenario B — calculated</span>
                  <span>{resultB.calculatedW.toLocaleString()} W</span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-200 pt-1 text-gray-500">
                <span>Min. demand floor {resultA.sqm >= 80 ? '(≥ 80 m²)' : '(< 80 m²)'}</span>
                <span>{resultA.minDemandW.toLocaleString()} W</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900">
                <span>{resultB ? 'Scenario A — applied' : 'Total applied'}</span>
                <span>
                  {resultA.totalW.toLocaleString()} W → {resultA.totalAmps.toFixed(1)} A
                </span>
              </div>
              {resultB && (
                <div className="flex justify-between font-bold text-gray-900">
                  <span>Scenario B — applied</span>
                  <span>
                    {resultB.totalW.toLocaleString()} W → {resultB.totalAmps.toFixed(1)} A
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-200 pt-1">
                <span>Service rating</span>
                <span>{resultA.service} A ({(resultA.service * 240).toLocaleString()} W)</span>
              </div>
              <div className="flex justify-between">
                <span>80% continuous limit</span>
                <span>
                  {resultA.continuousLimit.toFixed(0)} A ({(resultA.continuousLimit * 240).toLocaleString()} W)
                </span>
              </div>
            </div>
          </div>

          {/* Result thresholds legend */}
          <div className="bg-primary-50 border border-primary-200 rounded-lg px-4 py-3 text-xs text-primary-800 leading-relaxed">
            <p className="font-semibold mb-1">Result thresholds</p>
            <p><span className="font-bold text-green-700">PASS</span> — calculated amps ≤ 80% of service rating (continuous load limit)</p>
            <p className="mt-0.5"><span className="font-bold text-amber-700">WARN</span> — amps between 80–100% of service rating</p>
            <p className="mt-0.5"><span className="font-bold text-red-700">FAIL</span> — amps exceed service rating</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Defaults ──────────────────────────────────────────────────────────────────

const DEFAULTS: FormState = {
  sqft: '2700',
  serviceSize: '100',
  rangeW: '12000',
  dryerW: '5000',
  waterHeaterW: '4500',
  muaW: '0',
  heatingW: '15000',
  coolingW: '5000',
  evW: '11520',
  loadManagement: false,
  // Dual-fuel & altitude defaults
  elevation: '0',
  isDualFuel: false,
  balancePoint: '2',
  gasNameplateBtu: '0',
  gasRatePerGj: '12.50',
  elecRatePerKwh: '0.14',
  furnaceAfue: '0.96',
};

// ── Main Component ────────────────────────────────────────────────────────────

export default function GhostLoadAuditor() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [calculated, setCalculated] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Promo code state
  const [promoInput, setPromoInput] = useState('');
  const [promoStatus, setPromoStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
  const [promoError, setPromoError] = useState('');
  const [promoRemaining, setPromoRemaining] = useState(0);
  const [promoDownloadToken, setPromoDownloadToken] = useState('');
  const [launchPromoRemaining, setLaunchPromoRemaining] = useState<number | null>(null);

  // Live m² conversion
  const sqm = (() => {
    const v = parseFloat(form.sqft);
    return !isNaN(v) && v > 0 ? (v * 0.0929).toFixed(1) : null;
  })();

  const resultA = calculated ? runCalc(form, false) : null;
  const resultB = calculated && form.loadManagement ? runCalc(form, true) : null;

  const leadData: AuditLeadData | null = resultA
    ? {
        resultStatus: resultA.status,
        panelAmps: resultA.service,
        totalAmps: resultA.totalAmps,
        hasEV: parseFloat(form.evW) > 0,
        loadManagement: form.loadManagement,
        sqft: parseFloat(form.sqft),
        heatingW: parseFloat(form.heatingW),
        coolingW: parseFloat(form.coolingW),
        rangeW: parseFloat(form.rangeW),
        dryerW: parseFloat(form.dryerW),
        waterHeaterW: parseFloat(form.waterHeaterW),
        muaW: parseFloat(form.muaW) || 0,
        evW: parseFloat(form.evW),
        utilization: resultA.utilization,
        // Thermal analysis inputs
        elevation: parseFloat(form.elevation) || 0,
        isDualFuel: form.isDualFuel,
        balancePoint: parseFloat(form.balancePoint) || 2,
        gasNameplateBtu: parseFloat(form.gasNameplateBtu) || 0,
        gasRatePerGj: parseFloat(form.gasRatePerGj) || 12.50,
        elecRatePerKwh: parseFloat(form.elecRatePerKwh) || 0.14,
        furnaceAfue: parseFloat(form.furnaceAfue) || 0.96,
      }
    : null;

  function setField(field: keyof Omit<FormState, 'loadManagement' | 'isDualFuel'>) {
    return (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setCalculated(false);
    };
  }

  function handleCheckbox(e: ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, loadManagement: e.target.checked }));
    setCalculated(false);
  }

  function handleDualFuelToggle(e: ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, isDualFuel: e.target.checked }));
    setCalculated(false);
  }

  function handleCalculate() {
    // Compute results inline for tracking (before state update)
    const result = runCalc(form, false);
    const resultManaged = form.loadManagement ? runCalc(form, true) : null;

    const eventProps = {
      result_status: result?.status ?? 'invalid',
      main_breaker_amps: Number(form.serviceSize),
      total_calculated_amps: result ? Math.round(result.totalAmps * 10) / 10 : 0,
      has_ev: parseFloat(form.evW) > 0,
      load_management_active: form.loadManagement,
    };

    // Vercel Analytics custom event
    track('audit_calculated', eventProps);

    // GA4 custom event (gtag loaded via GoogleAnalytics component)
    window.gtag?.('event', 'audit_calculated', {
      event_category: 'Ghost Load Auditor',
      ...eventProps,
    });

    setCalculated(true);
    setShowBreakdown(false);
  }

  // Fetch LAUNCH2026 remaining count on mount (also powers the pricing card banner)
  useEffect(() => {
    fetch('/api/promo?code=LAUNCH2026')
      .then(r => r.json())
      .then((data: { valid: boolean; remaining: number }) => {
        const remaining = data.valid ? data.remaining : 0;
        setLaunchPromoRemaining(remaining);
        console.log('PROMO DEBUG:', {
          promoActive: data.valid,
          promoRemaining: remaining,
          promoApplied: false,
        });
      })
      .catch(() => {
        // Fail open — show promo input even if fetch fails
        setLaunchPromoRemaining(0);
      });
  }, []);

  async function handleApplyPromo() {
    if (!promoInput.trim()) return;
    setPromoStatus('checking');
    setPromoError('');
    try {
      const res = await fetch(`/api/promo?code=${encodeURIComponent(promoInput.trim())}`);
      const data: { valid: boolean; discount: number; remaining: number; reason?: string } = await res.json();
      if (data.valid) {
        setPromoStatus('valid');
        setPromoRemaining(data.remaining);
      } else {
        setPromoStatus('invalid');
        setPromoError(data.reason ?? 'Invalid promo code');
      }
    } catch {
      setPromoStatus('invalid');
      setPromoError('Could not verify code — please try again');
    }
  }

  async function handlePromoDownload() {
    if (!resultA) return;
    setCheckoutStatus('loading');
    try {
      const auditData = buildAuditData();
      // Step 1: redeem promo code at checkout (increments counter, returns token)
      const checkoutRes = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auditData, promoCode: promoInput.trim() }),
      });
      if (!checkoutRes.ok) {
        const { error } = await checkoutRes.json();
        throw new Error(error ?? 'Promo checkout failed');
      }
      const { downloadToken } = await checkoutRes.json();

      // Step 2: download PDF with token (marks paid: true in audit log)
      const pdfRes = await fetch('/api/audit-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...auditData, downloadToken }),
      });
      if (!pdfRes.ok) throw new Error('PDF generation failed');
      const blob = await pdfRes.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ghost-load-audit.pdf';
      a.click();
      URL.revokeObjectURL(url);

      setPromoDownloadToken(downloadToken);
      setCheckoutStatus('idle');
      // Refresh remaining count in banner
      setLaunchPromoRemaining(prev => (prev !== null && prev > 0 ? prev - 1 : prev));
    } catch (err) {
      setCheckoutStatus('error');
      setPromoError(err instanceof Error ? err.message : 'Download failed');
    }
  }

  function buildAuditData() {
    return {
      sqft:         parseFloat(form.sqft),
      serviceAmps:  parseFloat(form.serviceSize),
      rangeW:       parseFloat(form.rangeW),
      dryerW:       parseFloat(form.dryerW),
      waterHeaterW: parseFloat(form.waterHeaterW),
      muaW:         parseFloat(form.muaW) || 0,
      heatingW:     parseFloat(form.heatingW),
      coolingW:     parseFloat(form.coolingW),
      evW:          parseFloat(form.evW),
      loadManagement: form.loadManagement,
      elevation:       parseFloat(form.elevation) || 0,
      isDualFuel:      form.isDualFuel,
      balancePoint:    parseFloat(form.balancePoint) || 2,
      gasNameplateBtu: parseFloat(form.gasNameplateBtu) || 0,
      gasRatePerGj:    parseFloat(form.gasRatePerGj) || 12.50,
      elecRatePerKwh:  parseFloat(form.elecRatePerKwh) || 0.14,
      furnaceAfue:     parseFloat(form.furnaceAfue) || 0.96,
    };
  }

  async function handlePurchaseReport() {
    if (!resultA) return;
    setCheckoutStatus('loading');
    try {
      const auditData = buildAuditData();
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auditData }),
      });
      if (!res.ok) throw new Error('Checkout session creation failed');
      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch {
      setCheckoutStatus('error');
    }
  }

  // Recommendation logic
  const showRecs = !!resultA && resultA.status !== 'PASS';
  const heatingIsCulprit = !!resultA?.hvacIsHeating && parseFloat(form.heatingW) > 8000;
  const managedResolvesFailure =
    resultA?.status === 'FAIL' && !!resultB && resultB.status !== 'FAIL';

  const inputCls =
    'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white';
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1';
  const hintCls = 'text-xs text-gray-500 mt-1';
  const sectionHeadCls =
    'text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 pt-1';

  return (
    <div className="space-y-8">
      {/* Technical Beta banner — dismissible */}
      {!bannerDismissed && (
        <div className="bg-gray-50 border border-gray-300 rounded-xl px-5 py-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-1">
              Technical Beta
            </p>
            <p className="text-sm text-gray-600">
              Ghost Load Auditor is currently in Technical Beta. Results are for planning purposes
              only and do not constitute engineering advice. FSR verification required for permit
              submissions.
            </p>
          </div>
          <button
            onClick={() => setBannerDismissed(true)}
            aria-label="Dismiss Technical Beta notice"
            className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors mt-0.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* Top disclaimer */}
      <div className="bg-amber-50 border-l-4 border-amber-400 px-5 py-4 rounded-r-xl">
        <p className="text-sm font-bold text-amber-800">
          ESTIMATE ONLY — Results are informational and do not replace a site assessment by a
          Licensed Electrical Contractor or FSR.
        </p>
      </div>

      {/* ── Form ── */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
          <h2 className="font-semibold text-gray-800">Property &amp; Load Inputs</h2>
        </div>
        <div className="p-6 space-y-7">
          {/* Area + Service */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>Living area (sq ft)</label>
              <input
                type="number"
                min="100"
                step="1"
                value={form.sqft}
                onChange={setField('sqft')}
                className={inputCls}
                placeholder="e.g. 2700"
              />
              <p className={hintCls}>
                {sqm ? `= ${sqm} m²` : 'Enter sq ft to see m² conversion'}
              </p>
            </div>
            <div>
              <label className={labelCls}>Service size (A)</label>
              <select
                value={form.serviceSize}
                onChange={setField('serviceSize')}
                className={inputCls}
              >
                <option value="60">60 A</option>
                <option value="100">100 A</option>
                <option value="125">125 A</option>
                <option value="150">150 A</option>
                <option value="200">200 A</option>
                <option value="320">320 A</option>
                <option value="400">400 A</option>
              </select>
            </div>
          </div>

          {/* Major appliances */}
          <div>
            <p className={sectionHeadCls}>Major Appliances</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className={labelCls}>Range / Cooktop (W)</label>
                <input
                  type="number"
                  min="0"
                  value={form.rangeW}
                  onChange={setField('rangeW')}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Dryer (W)</label>
                <input
                  type="number"
                  min="0"
                  value={form.dryerW}
                  onChange={setField('dryerW')}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Water heater (W)</label>
                <input
                  type="number"
                  min="0"
                  value={form.waterHeaterW}
                  onChange={setField('waterHeaterW')}
                  className={inputCls}
                />
              </div>
            </div>

            {/* Ghost Load — MUA heater */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className={labelCls}>
                  MUA / Kitchen Makeup Air Heater (W)
                  <span className="ml-1.5 text-xs font-normal text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                    Ghost Load
                  </span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.muaW}
                  onChange={setField('muaW')}
                  className={inputCls}
                />
                <p className={hintCls}>
                  Electric heater for high-CFM kitchen exhaust makeup air. Enter 0 if not present.
                </p>
              </div>
            </div>
          </div>

          {/* HVAC */}
          <div>
            <p className={sectionHeadCls}>
              HVAC — Only the larger load is applied (CEC 8-106 Interlock)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>Heating load — ASHP heat strip / MUA (W)</label>
                <input
                  type="number"
                  min="0"
                  value={form.heatingW}
                  onChange={setField('heatingW')}
                  className={inputCls}
                />
                <p className={hintCls}>e.g. 15,000 W = 62.5A auxiliary heat strip</p>
              </div>
              <div>
                <label className={labelCls}>Cooling load — AC / ASHP cooling (W)</label>
                <input
                  type="number"
                  min="0"
                  value={form.coolingW}
                  onChange={setField('coolingW')}
                  className={inputCls}
                />
                <p className={hintCls}>e.g. 5,000 W = 1.5–2 ton condenser draw</p>
              </div>
            </div>
          </div>

          {/* EV + Load Management */}
          <div>
            <p className={sectionHeadCls}>EV Charging</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>EV charger (W)</label>
                <input
                  type="number"
                  min="0"
                  value={form.evW}
                  onChange={setField('evW')}
                  className={inputCls}
                />
                <p className={hintCls}>11,520 W = 48A Level 2 EVSE (typical dual-head)</p>
              </div>
              <div className="flex items-start pt-7">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.loadManagement}
                    onChange={handleCheckbox}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">
                    <span className="font-semibold">Load management enabled (EVEMS)</span>
                    <br />
                    <span className="text-xs text-gray-500">
                      Shows Scenario B: EV excluded from calculated load per CEC Rule 8-106(11)
                    </span>
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Elevation & Dual-Fuel */}
          <div>
            <p className={sectionHeadCls}>Site Elevation &amp; Dual-Fuel System</p>

            {/* Elevation — always visible */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>Site elevation (metres above sea level)</label>
                <input
                  type="number"
                  min="0"
                  max="3000"
                  step="1"
                  value={form.elevation}
                  onChange={setField('elevation')}
                  className={inputCls}
                />
                <p className={hintCls}>
                  Vancouver ~0 m · Kelowna ~344 m · Kamloops ~345 m · Prince George ~575 m
                </p>
              </div>
              <div className="flex items-start pt-7">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isDualFuel}
                    onChange={handleDualFuelToggle}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">
                    <span className="font-semibold">Residential Dual-Fuel System</span>
                    <br />
                    <span className="text-xs text-gray-500">
                      Heat pump + gas furnace — enables altitude derate &amp; COP crossover analysis
                    </span>
                  </span>
                </label>
              </div>
            </div>

            {/* Dual-fuel inputs — revealed when isDualFuel is ON */}
            {form.isDualFuel && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                  Dual-Fuel Parameters — Thermal Analysis (Informational Only)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className={labelCls}>Gas furnace nameplate (BTU/h)</label>
                    <input
                      type="number"
                      min="0"
                      max="200000"
                      step="1000"
                      value={form.gasNameplateBtu}
                      onChange={setField('gasNameplateBtu')}
                      className={inputCls}
                    />
                    <p className={hintCls}>e.g. 80,000 BTU/h</p>
                  </div>
                  <div>
                    <label className={labelCls}>Furnace AFUE (decimal)</label>
                    <input
                      type="number"
                      min="0.5"
                      max="1.0"
                      step="0.01"
                      value={form.furnaceAfue}
                      onChange={setField('furnaceAfue')}
                      className={inputCls}
                    />
                    <p className={hintCls}>0.96 = 96% AFUE</p>
                  </div>
                  <div>
                    <label className={labelCls}>Balance point (°C)</label>
                    <input
                      type="number"
                      min="-20"
                      max="15"
                      step="0.5"
                      value={form.balancePoint}
                      onChange={setField('balancePoint')}
                      className={inputCls}
                    />
                    <p className={hintCls}>Default 2°C per FortisBC/CleanBC</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Natural gas rate ($/GJ)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={form.gasRatePerGj}
                      onChange={setField('gasRatePerGj')}
                      className={inputCls}
                    />
                    <p className={hintCls}>FortisBC 2026 default: $12.50/GJ</p>
                  </div>
                  <div>
                    <label className={labelCls}>Electricity rate ($/kWh)</label>
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.01"
                      value={form.elecRatePerKwh}
                      onChange={setField('elecRatePerKwh')}
                      className={inputCls}
                    />
                    <p className={hintCls}>BC Hydro Step 2, 2026 default: $0.14/kWh</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Run Audit button */}
        <div className="px-6 pb-6">
          <button
            onClick={handleCalculate}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg text-sm transition-colors shadow-md hover:shadow-lg"
          >
            Run Panel Audit →
          </button>
          <p className="text-sm text-gray-500 mt-3 leading-relaxed">
            Planning a heat pump install? The quote looks fine — until your electrician says you
            need a panel upgrade. Find out before it happens.
          </p>
        </div>
      </div>

      {/* ── Results ── */}
      {calculated && resultA && (
        <div className="space-y-6">

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              {form.loadManagement && resultB
                ? 'Audit Results — Scenario Comparison'
                : 'Audit Results'}
            </h2>

            {form.loadManagement && resultB ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <ResultCard
                  result={resultA}
                  label="Scenario A — Unmanaged"
                  heatingW={parseFloat(form.heatingW)}
                  coolingW={parseFloat(form.coolingW)}
                />
                <ResultCard
                  result={resultB}
                  label="Scenario B — EVEMS (e.g. DCC-10)"
                  heatingW={parseFloat(form.heatingW)}
                  coolingW={parseFloat(form.coolingW)}
                />
              </div>
            ) : (
              <ResultCard
                result={resultA}
                label="Panel Load Analysis"
                heatingW={parseFloat(form.heatingW)}
                coolingW={parseFloat(form.coolingW)}
              />
            )}
          </div>

          {/* Breakdown toggle */}
          <div>
            <button
              onClick={() => setShowBreakdown((prev) => !prev)}
              className="flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              <span>{showBreakdown ? '▲' : '▼'}</span>
              {showBreakdown ? 'Hide' : 'Show'} full CEC 8-200 calculation breakdown
            </button>
          </div>

          {/* Purchase section: banner → promo input → buy button */}
          <div className="space-y-3">
            {/* Launch promo banner */}
            {(launchPromoRemaining === null || launchPromoRemaining > 0) && promoStatus !== 'valid' && (
              <div className="bg-primary-50 border border-primary-300 rounded-xl px-5 py-3 flex items-center gap-3">
                <span className="text-primary-700 font-semibold text-sm">Launch special</span>
                <span className="text-primary-600 text-sm">
                  Free report with code{' '}
                  <span className="font-mono font-bold text-primary-800">LAUNCH2026</span>
                  {launchPromoRemaining !== null ? ` (${launchPromoRemaining} of 100 remaining)` : ''}
                </span>
              </div>
            )}

            {/* Promo code input — always visible until a valid code is applied */}
            {promoStatus !== 'valid' && (
              <div className="flex items-start gap-3">
                <div className="flex-1 max-w-xs">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Have a promo code?"
                      value={promoInput}
                      onChange={e => {
                        setPromoInput(e.target.value);
                        setPromoStatus('idle');
                        setPromoError('');
                      }}
                      onKeyDown={e => { if (e.key === 'Enter') handleApplyPromo(); }}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                      onClick={handleApplyPromo}
                      disabled={promoStatus === 'checking' || !promoInput.trim()}
                      className="text-sm font-medium text-primary-600 hover:text-primary-700 disabled:opacity-40 px-3 py-2 border border-primary-300 rounded-lg"
                    >
                      {promoStatus === 'checking' ? '...' : 'Apply'}
                    </button>
                  </div>
                  {promoStatus === 'invalid' && (
                    <p className="text-xs text-red-600 mt-1">{promoError}</p>
                  )}
                </div>
              </div>
            )}

            {/* Purchase / free download button */}
            {promoStatus !== 'valid' && (
              <div>
                <button
                  onClick={handlePurchaseReport}
                  disabled={checkoutStatus === 'loading'}
                  className="flex items-center gap-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-60 px-5 py-2.5 rounded-lg shadow-sm transition-colors"
                >
                  {checkoutStatus === 'loading'
                    ? 'Processing...'
                    : 'Get Full Report — $24.99'}
                </button>
                <p className="text-xs text-gray-400 mt-1.5">
                  Instant PDF download &middot; GST included
                </p>
                {checkoutStatus === 'error' && (
                  <p className="text-xs text-red-600 mt-1">
                    Checkout failed — please try again or contact support@aelrictechnologies.com
                  </p>
                )}
              </div>
            )}

            {promoStatus === 'valid' && (
              <div>
                <button
                  onClick={handlePromoDownload}
                  disabled={checkoutStatus === 'loading' || !!promoDownloadToken}
                  className="flex items-center gap-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-60 px-5 py-2.5 rounded-lg shadow-sm transition-colors"
                >
                  {checkoutStatus === 'loading'
                    ? 'Downloading...'
                    : promoDownloadToken
                    ? 'Downloaded'
                    : 'Download Free Report'}
                </button>
                <p className="text-xs text-gray-400 mt-1.5">
                  Code <span className="font-mono font-semibold">{promoInput.trim().toUpperCase()}</span> applied &middot; {promoRemaining - 1 >= 0 ? promoRemaining - 1 : promoRemaining} remaining after this use
                </p>
                {checkoutStatus === 'error' && (
                  <p className="text-xs text-red-600 mt-1">
                    {promoError || 'Download failed — please try again'}
                  </p>
                )}
              </div>
            )}
          </div>

          {showBreakdown && (
            <CalcBreakdown
              resultA={resultA}
              resultB={form.loadManagement ? resultB : null}
              form={form}
            />
          )}

          {/* ── Thermal Analysis Card ── */}
          {resultA.thermal && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-blue-50 border-b border-blue-200 px-6 py-4">
                <h3 className="text-sm font-semibold text-blue-800 uppercase tracking-wide">
                  Thermal Integration &amp; Elevation Audit
                </h3>
                <p className="text-xs text-blue-600 mt-1">
                  Informational supplement — does not alter CEC 8-200 electrical compliance result
                </p>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left column — Altitude & Derate */}
                <div className="space-y-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Altitude &amp; Gas Appliance Derate
                  </p>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Site elevation</dt>
                      <dd className="font-semibold text-gray-900">
                        {resultA.thermal.elevationM.toLocaleString()} m
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Atmospheric pressure (ISA)</dt>
                      <dd className="font-semibold text-gray-900">
                        {resultA.thermal.bpKpa.toFixed(2)} kPa
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Air density heat constant</dt>
                      <dd className="font-semibold text-gray-900">
                        {resultA.thermal.correctedHeatConstant.toFixed(3)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">CSA B149.1 derate factor</dt>
                      <dd className="font-semibold text-gray-900">
                        {resultA.thermal.derateFactor.toFixed(3)}
                        {resultA.thermal.elevationM <= 610 && (
                          <span className="text-xs text-gray-400 ml-1">(below 610 m threshold)</span>
                        )}
                      </dd>
                    </div>
                    {resultA.thermal.gasNameplateBtu > 0 && (
                      <>
                        <div className="flex justify-between border-t border-gray-100 pt-2">
                          <dt className="text-gray-600">Gas furnace nameplate</dt>
                          <dd className="font-semibold text-gray-900">
                            {resultA.thermal.gasNameplateBtu.toLocaleString()} BTU/h
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Effective capacity (derated)</dt>
                          <dd className="font-semibold text-gray-900">
                            {resultA.thermal.effectiveBtu.toLocaleString()} BTU/h
                          </dd>
                        </div>
                      </>
                    )}
                  </dl>
                </div>

                {/* Right column — COP Crossover & Rates */}
                <div className="space-y-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Economic COP Crossover
                  </p>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Electricity rate</dt>
                      <dd className="font-semibold text-gray-900">
                        ${resultA.thermal.elecRatePerKwh.toFixed(2)}/kWh
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Natural gas rate</dt>
                      <dd className="font-semibold text-gray-900">
                        ${resultA.thermal.gasRatePerGj.toFixed(2)}/GJ
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Furnace AFUE</dt>
                      <dd className="font-semibold text-gray-900">
                        {(resultA.thermal.furnaceAfue * 100).toFixed(0)}%
                      </dd>
                    </div>
                    <div className="flex justify-between border-t border-gray-100 pt-2">
                      <dt className="text-gray-600 font-semibold">Crossover COP</dt>
                      <dd className="font-bold text-blue-700 text-base">
                        {resultA.thermal.copCrossover.toFixed(2)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Balance point</dt>
                      <dd className="font-semibold text-gray-900">
                        {resultA.thermal.balancePoint}°C
                      </dd>
                    </div>
                  </dl>
                  {resultA.thermal.copCrossover > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800 leading-relaxed">
                      <p className="font-semibold mb-1">Crossover Interpretation</p>
                      <p>
                        When the heat pump COP drops below{' '}
                        <span className="font-bold">{resultA.thermal.copCrossover.toFixed(2)}</span>,
                        the gas furnace delivers cheaper heat per unit of energy. At your utility rates,
                        the heat pump is more economical above this COP threshold. Below{' '}
                        {resultA.thermal.balancePoint}°C outdoor temperature, the gas furnace should
                        engage as the primary heat source.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Recommendations ── */}
          {showRecs && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                <h2 className="font-semibold text-gray-800">Recommended Next Steps</h2>
              </div>
              <div className="p-6 space-y-4">
                {/* WARN: near-capacity advisory */}
                {resultA.status === 'WARN' && (
                  <div className="flex gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <span className="text-amber-500 text-lg shrink-0">⚠</span>
                    <div>
                      <p className="font-semibold text-amber-800 text-sm">
                        Panel Near Capacity — No Headroom for Additional Loads
                      </p>
                      <p className="text-sm text-amber-700 mt-1">
                        Your calculated load ({resultA.totalAmps.toFixed(1)} A) falls between the
                        80% continuous limit ({resultA.continuousLimit.toFixed(0)} A) and your
                        service rating ({resultA.service} A). This is technically compliant but
                        leaves no margin for additional circuits or future loads.
                      </p>
                    </div>
                  </div>
                )}

                {/* EVEMS recommendation — overload < 40A AND an EV is actually present */}
                {resultA.overload > 0 && resultA.overload < 40 && !form.loadManagement && parseFloat(form.evW) > 0 && (
                  <div className="flex gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <span className="text-blue-500 text-lg shrink-0">⚡</span>
                    <div>
                      <p className="font-semibold text-blue-800 text-sm">
                        Consider an EVEMS Load Management Device (e.g. DCC-10)
                      </p>
                      <p className="text-sm text-blue-700 mt-1">
                        Your panel overload ({resultA.overload.toFixed(1)} A) is under 40A. An
                        Electric Vehicle Energy Management System (EVEMS) that monitors and
                        controls EVSE loads per CEC Rule 8-500 allows the EV demand to be
                        excluded entirely from the calculated load under Rule 8-106(11). This may
                        eliminate the need for a panel upgrade. Check &ldquo;Load management
                        enabled&rdquo; above to model Scenario B.
                      </p>
                    </div>
                  </div>
                )}

                {/* 200A upgrade recommendation — overload ≥ 40A */}
                {resultA.overload >= 40 && (
                  <div className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <span className="text-red-500 text-lg shrink-0">🔌</span>
                    <div>
                      <p className="font-semibold text-red-800 text-sm">
                        200A Service Upgrade Recommended
                      </p>
                      <p className="text-sm text-red-700 mt-1">
                        Your panel overload ({resultA.overload.toFixed(1)} A) exceeds 40A — load
                        management alone cannot resolve this. A 200A service upgrade is the
                        appropriate path forward to safely support this load combination.
                      </p>
                    </div>
                  </div>
                )}

                {/* Hybrid system recommendation */}
                {heatingIsCulprit && (
                  <div className="flex gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <span className="text-amber-500 text-lg shrink-0">🌡</span>
                    <div>
                      <p className="font-semibold text-amber-800 text-sm">
                        Heating Load is the Primary Driver — Consider a Hybrid System
                      </p>
                      <p className="text-sm text-amber-700 mt-1">
                        Your heating load ({parseFloat(form.heatingW).toLocaleString()} W) is the
                        dominant load in this calculation. A hybrid dual-fuel heat pump uses a gas
                        furnace as backup below the balance point, eliminating or greatly reducing
                        the auxiliary electric heat strip. This can reduce electrical heating demand
                        by 70–100% and is often the most cost-effective path for existing homes
                        with a gas connection.
                      </p>
                    </div>
                  </div>
                )}

                {/* CleanBC ESU rebate — FAIL only */}
                {resultA.status === 'FAIL' && (
                  <div className="flex gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-green-600 text-lg shrink-0">💰</span>
                    <div>
                      <p className="font-semibold text-green-800 text-sm">
                        CleanBC Electrical Service Upgrade Rebate — Up to $5,000
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        If a service upgrade is required to support a heat pump, CleanBC Better
                        Homes offers up to $5,000 toward the cost of an Electrical Service Upgrade
                        (ESU). This rebate stacks with heat pump equipment incentives. See{' '}
                        <a
                          href="https://betterhomesbc.ca"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline font-medium"
                        >
                          betterhomesbc.ca
                        </a>{' '}
                        for current program terms and eligibility.
                      </p>
                    </div>
                  </div>
                )}

                {/* HPCN contractor requirement — FAIL only */}
                {resultA.status === 'FAIL' && (
                  <div className="flex gap-3 p-4 bg-primary-50 border border-primary-200 rounded-lg">
                    <span className="text-primary-600 text-lg shrink-0">🏅</span>
                    <div>
                      <p className="font-semibold text-primary-800 text-sm">
                        HPCN Contractor Required for BC Rebates
                      </p>
                      <p className="text-sm text-primary-700 mt-1">
                        BC CleanBC rebates require installation by a Heat Pump Contractor Network
                        (HPCN) member. Use the{' '}
                        <Link href="/directory" className="underline font-medium">
                          Aelric Technologies directory
                        </Link>{' '}
                        to find TSBC-verified HPCN contractors in your area.
                      </p>
                    </div>
                  </div>
                )}

                {/* Managed scenario resolves failure */}
                {managedResolvesFailure && resultB && (
                  <div className="flex gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-green-600 text-lg shrink-0">✅</span>
                    <div>
                      <p className="font-semibold text-green-800 text-sm">
                        EVEMS Resolves This — No Panel Upgrade Required
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        Scenario B (EVEMS per Rule 8-106(11)) reduces your panel load to{' '}
                        {resultB.totalAmps.toFixed(1)} A — a{' '}
                        <span className="font-bold">{resultB.status}</span> result. A panel upgrade
                        is not required if you install a qualifying EVEMS device (e.g. DCC-10).
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Lead Capture ── */}
          {leadData && <AuditLeadForm data={leadData} />}
        </div>
      )}

      {/* ── Service Tier ── */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
          <h2 className="font-semibold text-gray-800">Get a Stamped Report</h2>
          <p className="text-sm text-gray-600 mt-1">
            Download a PDF version of this audit with your inputs and CEC 8-200 calculation.
          </p>
        </div>
        <div className="p-6">
          <div className="max-w-sm">
            <div className="border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  DIY Compliance Audit
                </span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                  Available
                </span>
              </div>
              <p className="text-3xl font-extrabold text-gray-900 mb-4">$24.99</p>
              <ul className="text-sm text-gray-600 space-y-2 mb-5">
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 mt-0.5 shrink-0">✓</span>
                  Stamped PDF with your load inputs
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 mt-0.5 shrink-0">✓</span>
                  CEC 8-200 Optional Method calculation report
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 mt-0.5 shrink-0">✓</span>
                  Rebate eligibility summary
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 mt-0.5 shrink-0">✓</span>
                  Share with your contractor or permit office
                </li>
              </ul>

              {/* Launch promo banner */}
              {(launchPromoRemaining === null || launchPromoRemaining > 0) && promoStatus !== 'valid' && (
                <div className="bg-primary-50 border border-primary-200 rounded-lg px-3 py-2 mb-3 flex items-center gap-2">
                  <span className="text-primary-700 font-semibold text-xs">Launch special</span>
                  <span className="text-primary-600 text-xs">
                    Free with code{' '}
                    <span className="font-mono font-bold text-primary-800">LAUNCH2026</span>
                    {launchPromoRemaining !== null ? ` (${launchPromoRemaining} of 100 remaining)` : ''}
                  </span>
                </div>
              )}

              {/* Promo code input */}
              {promoStatus !== 'valid' && (
                <div className="mb-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Have a promo code?"
                      value={promoInput}
                      onChange={e => {
                        setPromoInput(e.target.value);
                        setPromoStatus('idle');
                        setPromoError('');
                      }}
                      onKeyDown={e => { if (e.key === 'Enter') handleApplyPromo(); }}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                      onClick={handleApplyPromo}
                      disabled={promoStatus === 'checking' || !promoInput.trim()}
                      className="text-sm font-medium text-primary-600 hover:text-primary-700 disabled:opacity-40 px-3 py-2 border border-primary-300 rounded-lg whitespace-nowrap"
                    >
                      {promoStatus === 'checking' ? '...' : 'Apply'}
                    </button>
                  </div>
                  {promoStatus === 'invalid' && (
                    <p className="text-xs text-red-600 mt-1">{promoError}</p>
                  )}
                </div>
              )}

              {/* Purchase button — switches to free download when promo applied */}
              {promoStatus !== 'valid' ? (
                <button
                  onClick={handlePurchaseReport}
                  disabled={!resultA || checkoutStatus === 'loading'}
                  className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors"
                >
                  {checkoutStatus === 'loading'
                    ? 'Processing...'
                    : !resultA
                      ? 'Run audit first'
                      : 'Get Full Report — $24.99'}
                </button>
              ) : (
                <button
                  onClick={handlePromoDownload}
                  disabled={checkoutStatus === 'loading' || !!promoDownloadToken}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors"
                >
                  {checkoutStatus === 'loading'
                    ? 'Downloading...'
                    : promoDownloadToken
                      ? 'Downloaded'
                      : 'Download Free Report'}
                </button>
              )}
              <p className="text-xs text-gray-400 mt-2 text-center">
                {promoStatus === 'valid'
                  ? <>Code <span className="font-mono font-semibold">{promoInput.trim().toUpperCase()}</span> applied &middot; {promoRemaining - 1 >= 0 ? promoRemaining - 1 : promoRemaining} remaining</>
                  : <>Instant PDF download &middot; GST included</>}
              </p>
              {checkoutStatus === 'error' && (
                <p className="text-xs text-red-600 mt-1 text-center">
                  {promoError || 'Checkout failed — please try again or contact support@aelrictechnologies.com'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Value Comparison Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
          <h2 className="font-semibold text-gray-800">Why Run This Audit First?</h2>
          <p className="text-sm text-gray-600 mt-1">
            Know your options before committing to a service call or upgrade.
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Precision matters. While generic calculators guess, Aelric accounts for BC-specific
            variables like site elevation and regional design temperatures. Building above 600m?
            We&rsquo;ve already done the math.
          </p>
        </div>
        <div className="p-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200">
                <th className="text-left pb-3 pr-4">Option</th>
                <th className="text-right pb-3 px-4 whitespace-nowrap">Est. Cost</th>
                <th className="text-left pb-3 pl-4">What You Get</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="bg-green-50">
                <td className="py-3 pr-4 font-semibold text-green-800 whitespace-nowrap">
                  This Audit (online)
                </td>
                <td className="py-3 px-4 text-right font-bold text-green-700">Free</td>
                <td className="py-3 pl-4 text-gray-700">
                  CEC 8-200 math in 2 minutes. Know before you call.
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-semibold text-gray-800 whitespace-nowrap">
                  PDF Technical Briefing
                </td>
                <td className="py-3 px-4 text-right font-bold text-gray-900">$24.99</td>
                <td className="py-3 pl-4 text-gray-600">
                  Stamped calculation report to share with your contractor or permit office.
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-semibold text-gray-800 whitespace-nowrap">
                  Electrician Service Call
                </td>
                <td className="py-3 px-4 text-right font-bold text-gray-900">~$300</td>
                <td className="py-3 pl-4 text-gray-600">
                  On-site assessment. Required before any permit work.
                </td>
              </tr>
              <tr className="bg-red-50">
                <td className="py-3 pr-4 font-semibold text-red-800 whitespace-nowrap">
                  Panel Upgrade (200A)
                </td>
                <td className="py-3 px-4 text-right font-bold text-red-700 whitespace-nowrap">
                  $5,000–$10,000+
                </td>
                <td className="py-3 pl-4 text-red-700">
                  Often unnecessary when the CEC 8-200 Optional Method is applied correctly.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer disclaimer */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl px-6 py-5 space-y-3">
        <p className="text-xs text-gray-500 leading-relaxed text-center">
          Preliminary Feasibility Analysis per CEC Rule 8-200 Optional Method. Informational only
          — does not replace a site assessment by a Licensed Electrical Contractor or FSR.
          Prepared using Red Seal HVAC/R field methodology.
        </p>
        <p className="text-xs text-gray-500 text-center">
          Want the full context?{' '}
          <Link
            href="/guides/heat-pump-bc-2026"
            className="text-primary-600 hover:text-primary-700 underline font-medium"
          >
            Read the BC Heat Pump Guide 2026
          </Link>{' '}
          — CEC rules, rebate stacking, HPCN verification, and Zero Carbon Step Code explained.
        </p>
        <p className="text-xs text-gray-400 text-center">
          &copy; Aelric Technologies Inc. NR 2895893. All rights reserved.
        </p>
      </div>
    </div>
  );
}
