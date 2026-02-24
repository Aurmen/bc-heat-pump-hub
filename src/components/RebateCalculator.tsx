'use client';

import { useState } from 'react';

interface RebateLine {
  program: string;
  amount: number;
  note: string;
  isLoan?: boolean;
}

function calculateRebates(
  heatingSource: string,
  propertyType: string,
  systemType: string,
  incomeQualified: boolean
): RebateLine[] {
  const lines: RebateLine[] = [];

  // OHPA — Oil to Heat Pump Affordability (federal grant)
  if (heatingSource === 'oil' || heatingSource === 'propane') {
    lines.push({
      program: 'Oil to Heat Pump Affordability (OHPA)',
      amount: 10000,
      note: 'Federal grant for oil and propane-heated homes switching to a heat pump',
    });
  }

  // CleanBC Better Homes / BC Hydro Condo Program
  if (propertyType === 'condo') {
    const condoAmount = incomeQualified ? 5000 : 2250;
    lines.push({
      program: 'BC Hydro Condo Program (CleanBC)',
      amount: condoAmount,
      note: incomeQualified
        ? 'Income-qualified rate — verify current threshold at betterhomesbc.ca'
        : 'Standard per-unit rate for strata/condo installs',
    });
  } else {
    // Single family / townhome — CleanBC Better Homes
    let cleanBCBase = systemType === 'ducted' ? 6000 : 2000;
    if (incomeQualified) cleanBCBase = Math.min(cleanBCBase + 2000, 8000);
    lines.push({
      program: 'CleanBC Better Homes',
      amount: cleanBCBase,
      note: incomeQualified
        ? `${systemType === 'ducted' ? 'Central ducted' : 'Ductless mini-split'} — includes income-qualified top-up`
        : `${systemType === 'ducted' ? 'Central ducted' : 'Ductless mini-split'} — standard rate`,
    });

    // BC Hydro rebate stacks with CleanBC for non-oil/propane conversions
    const bcHydroAmount = systemType === 'ducted' ? 2000 : 1000;
    lines.push({
      program: 'BC Hydro Rebate',
      amount: bcHydroAmount,
      note: 'For BC Hydro service area customers — confirm eligibility at bchydro.com/rebates',
    });
  }

  // Canada Greener Homes Loan — always available but is a loan not a grant
  lines.push({
    program: 'Canada Greener Homes Loan',
    amount: 40000,
    note: 'Interest-free loan — must be repaid over up to 10 years. Not a grant.',
    isLoan: true,
  });

  return lines;
}

export default function RebateCalculator() {
  const [heatingSource, setHeatingSource] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [systemType, setSystemType] = useState('ducted');
  const [incomeQualified, setIncomeQualified] = useState(false);
  const [calculated, setCalculated] = useState(false);

  const canCalculate = heatingSource && propertyType;

  const rebates = calculated && canCalculate
    ? calculateRebates(heatingSource, propertyType, systemType, incomeQualified)
    : [];

  const grantTotal = rebates.filter(r => !r.isLoan).reduce((sum, r) => sum + r.amount, 0);

  const reset = () => setCalculated(false);

  return (
    <div className="not-prose bg-white border border-gray-200 rounded-xl overflow-hidden my-8">
      {/* Disclaimer header */}
      <div className="bg-amber-50 border-b border-amber-200 px-6 py-4">
        <p className="text-sm font-bold text-amber-800">
          ESTIMATE ONLY — Rebate amounts shown are maximums based on 2026 program rules. Final approval is subject to eligibility verification and available program funding.
        </p>
      </div>

      <div className="p-6 space-y-5">
        <div>
          <h3 className="text-lg font-bold text-gray-900">2026 BC Rebate Estimator</h3>
          <p className="text-sm text-gray-500 mt-1">
            Select your situation to see which grant programs you may qualify for.
          </p>
        </div>

        {/* Heating source */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Current Heating Source
          </label>
          <select
            value={heatingSource}
            onChange={(e) => { setHeatingSource(e.target.value); reset(); }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select heating source...</option>
            <option value="oil">Heating Oil</option>
            <option value="propane">Propane</option>
            <option value="gas">Natural Gas</option>
            <option value="electric_baseboard">Electric Baseboard</option>
            <option value="electric_forced_air">Electric Forced Air / Fan Coil</option>
          </select>
        </div>

        {/* Property type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Property Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'house', label: 'Single Family / Townhome' },
              { value: 'condo', label: 'Condo / Strata Unit' },
            ].map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => { setPropertyType(value); reset(); }}
                className={`py-2.5 px-4 rounded-lg border text-sm font-semibold transition-colors ${
                  propertyType === value
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* System type — single family / townhome only */}
        {propertyType === 'house' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              System Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'ducted', label: 'Central Ducted' },
                { value: 'ductless', label: 'Ductless Mini-Split' },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => { setSystemType(value); reset(); }}
                  className={`py-2.5 px-4 rounded-lg border text-sm font-semibold transition-colors ${
                    systemType === value
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Income qualified */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={incomeQualified}
            onChange={(e) => { setIncomeQualified(e.target.checked); reset(); }}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <div>
            <span className="text-sm font-semibold text-gray-700">Income-qualified household</span>
            <p className="text-xs text-gray-500 mt-0.5">
              Household income under approximately $84,000 (net). Verify current threshold at betterhomesbc.ca.
            </p>
          </div>
        </label>

        {/* Calculate button */}
        <button
          type="button"
          onClick={() => setCalculated(true)}
          disabled={!canCalculate}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg text-sm transition-colors"
        >
          Estimate My Rebates
        </button>

        {/* Results */}
        {calculated && rebates.length > 0 && (
          <div className="space-y-4">
          <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Estimated Rebate Breakdown
              </h4>
            </div>
            <div className="divide-y divide-gray-100">
              {rebates.map((r, i) => (
                <div
                  key={i}
                  className={`px-5 py-3.5 flex items-start justify-between gap-4 ${r.isLoan ? 'opacity-60' : ''}`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800">
                      {r.program}
                      {r.isLoan && (
                        <span className="ml-2 text-xs font-normal text-gray-500">
                          (loan — not a grant)
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{r.note}</p>
                  </div>
                  <p className={`text-sm font-bold whitespace-nowrap mt-0.5 ${r.isLoan ? 'text-gray-500' : 'text-green-700'}`}>
                    Up to ${r.amount.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
            <div className="px-5 py-4 bg-green-50 border-t border-green-200 flex items-center justify-between">
              <p className="text-sm font-bold text-gray-900">Estimated Total Grants</p>
              <p className="text-xl font-bold text-green-700">Up to ${grantTotal.toLocaleString()}</p>
            </div>
          </div>

          {/* CTA — email results to specialist */}
          <a
            href={`/connect?projectType=${encodeURIComponent('Rebate Assistance')}&summary=${encodeURIComponent(
              `Heating source: ${heatingSource}\nProperty type: ${propertyType}\nSystem type: ${systemType}\nIncome-qualified: ${incomeQualified ? 'Yes' : 'No'}\nEstimated total grants: Up to $${grantTotal.toLocaleString()}`
            )}`}
            className="block w-full text-center bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg text-sm transition-colors"
          >
            Email My Estimated Results to a Specialist →
          </a>
          </div>
        )}
      </div>

      {/* Disclaimer footer */}
      <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
        <p className="text-xs text-gray-500 leading-relaxed">
          <strong>ESTIMATE ONLY.</strong> Actual results may vary based on site conditions, utility rates, and final rebate approval. Amounts are 2026 program maximums and are subject to funding availability and individual eligibility. Income thresholds and eligible equipment lists are updated regularly — confirm current amounts at{' '}
          <a
            href="https://www.betterhomesbc.ca"
            className="text-blue-600 hover:text-blue-700"
            target="_blank"
            rel="noopener noreferrer"
          >
            betterhomesbc.ca
          </a>{' '}
          before making any purchasing decisions.
        </p>
      </div>
    </div>
  );
}
