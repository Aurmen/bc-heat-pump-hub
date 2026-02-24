'use client';

import { useState } from 'react';

const SAVINGS_RATES: Record<string, number> = {
  oil: 0.62,
  propane: 0.60,
  gas: 0.35,
  electric_baseboard: 0.55,
  electric_forced_air: 0.50,
};

const HEATING_TYPE_LABELS: Record<string, string> = {
  oil: 'Oil Furnace / Boiler',
  propane: 'Propane Furnace / Boiler',
  gas: 'Natural Gas Furnace / Boiler',
  electric_baseboard: 'Electric Baseboard',
  electric_forced_air: 'Electric Forced Air / Fan Coil',
};

const DEFAULT_REBATES: Record<string, number> = {
  oil: 16000,
  propane: 16000,
  gas: 8000,
  electric_baseboard: 8000,
  electric_forced_air: 6000,
};

export default function ROICalculator() {
  const [heatingType, setHeatingType] = useState('');
  const [monthlyBill, setMonthlyBill] = useState('');
  const [installCost, setInstallCost] = useState('12000');
  const [rebate, setRebate] = useState('');
  const [calculated, setCalculated] = useState(false);

  const handleHeatingTypeChange = (type: string) => {
    setHeatingType(type);
    setRebate(String(DEFAULT_REBATES[type] ?? ''));
    setCalculated(false);
  };

  const annualBill = parseFloat(monthlyBill) * 12 || 0;
  const savingsRate = SAVINGS_RATES[heatingType] ?? 0;
  const annualSavings = Math.round(annualBill * savingsRate);
  const netCost = Math.max(0, (parseFloat(installCost) || 0) - (parseFloat(rebate) || 0));
  const paybackYears = annualSavings > 0 ? (netCost / annualSavings).toFixed(1) : '—';

  const canCalculate = heatingType && monthlyBill && parseFloat(monthlyBill) > 0;

  return (
    <div className="not-prose bg-white border border-gray-200 rounded-xl overflow-hidden my-8">
      {/* Disclaimer header */}
      <div className="bg-amber-50 border-b border-amber-200 px-6 py-4">
        <p className="text-sm font-bold text-amber-800">
          ESTIMATE ONLY — Actual results may vary based on site conditions, utility rates, and final rebate approval.
        </p>
      </div>

      <div className="p-6 space-y-5">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Heat Pump ROI Calculator</h3>
          <p className="text-sm text-gray-500 mt-1">
            Enter your current heating details to estimate annual savings and payback period.
          </p>
        </div>

        {/* Heating type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Current Heating System
          </label>
          <select
            value={heatingType}
            onChange={(e) => handleHeatingTypeChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select your heating type...</option>
            {Object.entries(HEATING_TYPE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        {/* Monthly bill */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Average Monthly Heating Cost ($)
          </label>
          <input
            type="number"
            value={monthlyBill}
            onChange={(e) => { setMonthlyBill(e.target.value); setCalculated(false); }}
            placeholder="e.g. 250"
            min="0"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Installation cost */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Installation Cost ($)
            </label>
            <input
              type="number"
              value={installCost}
              onChange={(e) => { setInstallCost(e.target.value); setCalculated(false); }}
              min="0"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">Typical range: $8,000–$18,000</p>
          </div>

          {/* Expected rebates */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Expected Rebates ($)
            </label>
            <input
              type="number"
              value={rebate}
              onChange={(e) => { setRebate(e.target.value); setCalculated(false); }}
              min="0"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">Auto-filled from heating type</p>
          </div>
        </div>

        {/* Calculate button */}
        <button
          type="button"
          onClick={() => setCalculated(true)}
          disabled={!canCalculate}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg text-sm transition-colors"
        >
          Calculate Estimated Savings
        </button>

        {/* Results */}
        {calculated && annualSavings > 0 && (
          <>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4">
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Estimated Results
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Current Annual Cost</p>
                  <p className="text-lg font-bold text-gray-900">${annualBill.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Estimated Annual Savings</p>
                  <p className="text-lg font-bold text-green-700">${annualSavings.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Net Cost After Rebates</p>
                  <p className="text-lg font-bold text-gray-900">${netCost.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Estimated Payback Period</p>
                  <p className="text-lg font-bold text-blue-700">{paybackYears} years</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Savings estimate uses a {Math.round(savingsRate * 100)}% reduction factor for {HEATING_TYPE_LABELS[heatingType]} conversions. Actual savings depend on equipment efficiency, home insulation, local utility rates, and usage patterns.
              </p>
            </div>

            {/* CTA — email results to specialist */}
            <a
              href={`/connect?projectType=${encodeURIComponent('ROI / Payback Analysis')}&summary=${encodeURIComponent(
                `Current system: ${HEATING_TYPE_LABELS[heatingType]}\nAnnual heating cost: $${annualBill.toLocaleString()}\nEstimated annual savings: $${annualSavings.toLocaleString()}\nNet cost after rebates: $${netCost.toLocaleString()}\nEstimated payback: ${paybackYears} years`
              )}`}
              className="block w-full text-center bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg text-sm transition-colors"
            >
              Email My Estimated Results to a Specialist →
            </a>
          </>
        )}
      </div>

      {/* Disclaimer footer */}
      <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
        <p className="text-xs text-gray-500 leading-relaxed">
          <strong>ESTIMATE ONLY.</strong> Actual results may vary based on site conditions, utility rates, and final rebate approval. Rebate availability is subject to program funding and individual eligibility. Consult a qualified HVAC contractor for a site-specific assessment.
        </p>
      </div>
    </div>
  );
}
