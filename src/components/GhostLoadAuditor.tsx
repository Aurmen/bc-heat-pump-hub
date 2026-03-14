'use client';

import { useState, type ChangeEvent } from 'react';
import Link from 'next/link';

// ── Types ─────────────────────────────────────────────────────────────────────

interface FormState {
  sqft: string;
  serviceSize: string;
  rangeW: string;
  dryerW: string;
  waterHeaterW: string;
  heatingW: string;
  coolingW: string;
  evW: string;
  loadManagement: boolean;
}

interface CalcResult {
  sqm: number;
  basicLoadW: number;
  extraBlocks: number;
  appliancesW: number;
  subtotal: number;
  afterDemand: number;
  hvacW: number;
  hvacIsHeating: boolean;
  evApplied: number;
  totalW: number;
  totalAmps: number;
  utilization: number;
  continuousLimit: number;
  service: number;
  status: 'PASS' | 'WARN' | 'FAIL';
  overload: number;
}

// ── Calculation Engine ────────────────────────────────────────────────────────

function toNum(s: string): number | null {
  const v = parseFloat(s);
  return isNaN(v) ? null : v;
}

function runCalc(f: FormState, managedEV: boolean): CalcResult | null {
  const sqft = toNum(f.sqft);
  const service = toNum(f.serviceSize);
  const rangeW = toNum(f.rangeW);
  const dryerW = toNum(f.dryerW);
  const whW = toNum(f.waterHeaterW);
  const heatW = toNum(f.heatingW);
  const coolW = toNum(f.coolingW);
  const evIn = toNum(f.evW);

  if (
    sqft === null || sqft <= 0 ||
    service === null || service <= 0 ||
    rangeW === null || rangeW < 0 ||
    dryerW === null || dryerW < 0 ||
    whW === null || whW < 0 ||
    heatW === null || heatW < 0 ||
    coolW === null || coolW < 0 ||
    evIn === null || evIn < 0
  ) {
    return null;
  }

  // Step 1 — Basic load (CEC 8-200)
  const sqm = sqft * 0.0929;
  const extraBlocks = Math.max(0, Math.ceil((sqm - 90) / 90));
  const basicLoadW = 5000 + extraBlocks * 1000;

  // Step 2 — Major appliances at face value
  const appliancesW = rangeW + dryerW + whW;

  // Step 3 — Demand factor (applied to Steps 1+2)
  const subtotal = basicLoadW + appliancesW;
  const afterDemand =
    subtotal <= 10000
      ? subtotal
      : 10000 + (subtotal - 10000) * 0.4;

  // Step 4 — HVAC interlock (CEC 8-106) + EV at 100%
  const hvacIsHeating = heatW >= coolW;
  const hvacW = Math.max(heatW, coolW);
  const evApplied = managedEV ? 1440 : evIn;

  const totalW = afterDemand + hvacW + evApplied;
  const totalAmps = totalW / 240;
  const continuousLimit = service * 0.8;
  const utilization = (totalAmps / service) * 100;
  const overload = Math.max(0, totalAmps - service);

  const status: 'PASS' | 'WARN' | 'FAIL' =
    totalAmps <= continuousLimit ? 'PASS' :
    totalAmps <= service ? 'WARN' :
    'FAIL';

  return {
    sqm, basicLoadW, extraBlocks, appliancesW, subtotal,
    afterDemand, hvacW, hvacIsHeating, evApplied,
    totalW, totalAmps, utilization, continuousLimit,
    service, status, overload,
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

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          CEC Rule 8-200 Optional Method — Full Calculation
        </h3>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Steps 1–3 (same for both scenarios) */}
        <div className="space-y-6">
          {/* Step 1 */}
          <div>
            <p className="text-xs font-semibold text-primary-700 uppercase tracking-wide mb-2">
              Step 1 — Basic Load
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
                  <span>{(resultA.extraBlocks * 1000).toLocaleString()} W</span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-200 pt-1 font-bold">
                <span>Step 1 subtotal</span>
                <span>{resultA.basicLoadW.toLocaleString()} W</span>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div>
            <p className="text-xs font-semibold text-primary-700 uppercase tracking-wide mb-2">
              Step 2 — Major Appliances
            </p>
            <div className="bg-gray-50 rounded-lg px-4 py-3 font-mono text-xs text-gray-700 space-y-1">
              <div className="flex justify-between">
                <span>Range / cooktop</span>
                <span>{parseFloat(form.rangeW).toLocaleString()} W</span>
              </div>
              <div className="flex justify-between">
                <span>Dryer</span>
                <span>{parseFloat(form.dryerW).toLocaleString()} W</span>
              </div>
              <div className="flex justify-between">
                <span>Water heater</span>
                <span>{parseFloat(form.waterHeaterW).toLocaleString()} W</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-1 font-bold">
                <span>Step 2 subtotal</span>
                <span>{resultA.appliancesW.toLocaleString()} W</span>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div>
            <p className="text-xs font-semibold text-primary-700 uppercase tracking-wide mb-2">
              Step 3 — Demand Factor (on Steps 1+2)
            </p>
            <div className="bg-gray-50 rounded-lg px-4 py-3 font-mono text-xs text-gray-700 space-y-1">
              <div className="flex justify-between">
                <span>Steps 1+2 combined</span>
                <span>{resultA.subtotal.toLocaleString()} W</span>
              </div>
              {resultA.subtotal > 10000 ? (
                <>
                  <div className="flex justify-between">
                    <span>First 10,000 W @ 100%</span>
                    <span>10,000 W</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Remaining {(resultA.subtotal - 10000).toLocaleString()} W @ 40%</span>
                    <span>{((resultA.subtotal - 10000) * 0.4).toLocaleString()} W</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between">
                  <span>≤ 10,000 W → 100% applied</span>
                  <span>{resultA.subtotal.toLocaleString()} W</span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-200 pt-1 font-bold">
                <span>Step 3 result</span>
                <span>{resultA.afterDemand.toLocaleString()} W</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 4 + Totals */}
        <div className="space-y-6">
          {/* Step 4 */}
          <div>
            <p className="text-xs font-semibold text-primary-700 uppercase tracking-wide mb-2">
              Step 4 — Add at 100% (HVAC + EV)
            </p>
            <div className="bg-gray-50 rounded-lg px-4 py-3 font-mono text-xs text-gray-700 space-y-1">
              <div className="flex justify-between">
                <span>Step 3 carry-forward</span>
                <span>{resultA.afterDemand.toLocaleString()} W</span>
              </div>
              <div className="flex justify-between text-gray-900 font-medium">
                <span>
                  {resultA.hvacIsHeating
                    ? `Heating ${heatingW.toLocaleString()} W (applied)`
                    : `Cooling ${coolingW.toLocaleString()} W (applied)`}
                </span>
                <span>{resultA.hvacW.toLocaleString()} W</span>
              </div>
              <div className="flex justify-between text-gray-400 line-through">
                <span>
                  {resultA.hvacIsHeating
                    ? `Cooling ${coolingW.toLocaleString()} W (CEC 8-106 interlock)`
                    : `Heating ${heatingW.toLocaleString()} W (CEC 8-106 interlock)`}
                </span>
                <span>0 W</span>
              </div>
              {resultB ? (
                <>
                  <div className="flex justify-between">
                    <span>EV — Scenario A (unmanaged)</span>
                    <span>{resultA.evApplied.toLocaleString()} W</span>
                  </div>
                  <div className="flex justify-between">
                    <span>EV — Scenario B (DCC-10 standby)</span>
                    <span>{resultB.evApplied.toLocaleString()} W</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between">
                  <span>EV charger</span>
                  <span>{resultA.evApplied.toLocaleString()} W</span>
                </div>
              )}
            </div>
          </div>

          {/* Grand Totals */}
          <div>
            <p className="text-xs font-semibold text-primary-700 uppercase tracking-wide mb-2">
              Grand Totals
            </p>
            <div className="bg-gray-50 rounded-lg px-4 py-3 font-mono text-xs text-gray-700 space-y-1">
              <div className="flex justify-between font-bold text-gray-900">
                <span>{resultB ? 'Scenario A — unmanaged' : 'Total load'}</span>
                <span>
                  {resultA.totalW.toLocaleString()} W → {resultA.totalAmps.toFixed(1)} A
                </span>
              </div>
              {resultB && (
                <div className="flex justify-between font-bold text-gray-900">
                  <span>Scenario B — managed</span>
                  <span>
                    {resultB.totalW.toLocaleString()} W → {resultB.totalAmps.toFixed(1)} A
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-200 pt-1">
                <span>Service rating</span>
                <span>{resultA.service}A ({(resultA.service * 240).toLocaleString()} W)</span>
              </div>
              <div className="flex justify-between">
                <span>80% continuous limit</span>
                <span>
                  {resultA.continuousLimit.toFixed(0)}A ({(resultA.continuousLimit * 240).toLocaleString()} W)
                </span>
              </div>
            </div>
          </div>

          {/* Service tiers legend */}
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
  heatingW: '15000',
  coolingW: '5000',
  evW: '11520',
  loadManagement: false,
};

// ── Main Component ────────────────────────────────────────────────────────────

export default function GhostLoadAuditor() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [calculated, setCalculated] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Live m² conversion
  const sqm = (() => {
    const v = parseFloat(form.sqft);
    return !isNaN(v) && v > 0 ? (v * 0.0929).toFixed(1) : null;
  })();

  const resultA = calculated ? runCalc(form, false) : null;
  const resultB = calculated && form.loadManagement ? runCalc(form, true) : null;

  function setField(field: keyof Omit<FormState, 'loadManagement'>) {
    return (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setCalculated(false);
    };
  }

  function handleCheckbox(e: ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, loadManagement: e.target.checked }));
    setCalculated(false);
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
                <option value="150">150 A</option>
                <option value="200">200 A</option>
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
                    <span className="font-semibold">Load management enabled (DCC-10)</span>
                    <br />
                    <span className="text-xs text-gray-500">
                      Shows Scenario B: EV reduced to 1,440 W (6A standby)
                    </span>
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Run Audit button */}
        <div className="px-6 pb-6">
          <button
            onClick={() => { setCalculated(true); setShowBreakdown(false); }}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg text-sm transition-colors shadow-md hover:shadow-lg"
          >
            Run Panel Audit →
          </button>
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
                  label="Scenario B — Managed (DCC-10)"
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
          <button
            onClick={() => setShowBreakdown((prev) => !prev)}
            className="flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
          >
            <span>{showBreakdown ? '▲' : '▼'}</span>
            {showBreakdown ? 'Hide' : 'Show'} full CEC 8-200 calculation breakdown
          </button>

          {showBreakdown && (
            <CalcBreakdown
              resultA={resultA}
              resultB={form.loadManagement ? resultB : null}
              form={form}
            />
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

                {/* DCC-10 recommendation — overload < 40A */}
                {resultA.overload > 0 && resultA.overload < 40 && !form.loadManagement && (
                  <div className="flex gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <span className="text-blue-500 text-lg shrink-0">⚡</span>
                    <div>
                      <p className="font-semibold text-blue-800 text-sm">
                        Consider a DCC-10 Load Management Device
                      </p>
                      <p className="text-sm text-blue-700 mt-1">
                        Your panel overload ({resultA.overload.toFixed(1)} A) is under 40A. A
                        smart EV load management device such as the DCC-10 throttles the EV
                        charger to 6A standby (1,440 W) when grid demand is high, which may
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
                          Canadian Heat Pump Hub directory
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
                        Load Management Resolves This — No Panel Upgrade Required
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        Scenario B (DCC-10 load management) reduces your panel load to{' '}
                        {resultB.totalAmps.toFixed(1)} A — a{' '}
                        <span className="font-bold">{resultB.status}</span> result. A panel upgrade
                        is not required if you install an approved load management device.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
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
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                  Coming Soon
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
              <button
                disabled
                className="w-full bg-gray-100 text-gray-400 font-semibold py-2.5 px-4 rounded-lg text-sm cursor-not-allowed"
              >
                Coming Soon
              </button>
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
      </div>
    </div>
  );
}
