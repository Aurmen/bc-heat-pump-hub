'use client';

import { useState } from 'react';
import Link from 'next/link';
import ArticleMeta from '@/components/ArticleMeta';

interface CalculatorInputs {
  currentHeating: 'gas' | 'electric' | 'oil' | 'propane' | '';
  annualCost: string;
  homeSize: string;
  climateZone: 'coastal' | 'interior' | 'northern' | '';
  heatPumpType: 'ductless-1zone' | 'ductless-3zone' | 'central' | 'air-to-water' | '';
  householdIncome: 'standard' | 'income-qualified' | '';
}

export default function CalculatorPage() {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    currentHeating: '',
    annualCost: '',
    homeSize: '',
    climateZone: '',
    heatPumpType: '',
    householdIncome: 'standard'
  });

  const [showResults, setShowResults] = useState(false);

  const updateInput = (field: keyof CalculatorInputs, value: string) => {
    setInputs({ ...inputs, [field]: value });
  };

  const calculateROI = () => {
    const annualCost = parseFloat(inputs.annualCost) || 0;

    // Heat pump installation costs (before rebates)
    const heatPumpCosts: Record<string, number> = {
      'ductless-1zone': 4000,
      'ductless-3zone': 12000,
      'central': 14000,
      'air-to-water': 22000
    };

    const installCost = heatPumpCosts[inputs.heatPumpType] || 0;

    // Rebate calculations
    let federalRebate = 5000; // Canada Greener Homes Grant
    let provincialRebate = inputs.householdIncome === 'income-qualified' ? 6000 : 0;
    let utilityRebate = inputs.climateZone === 'coastal' ? 1000 : 500;

    const totalRebates = federalRebate + provincialRebate + utilityRebate;
    const netCost = Math.max(0, installCost - totalRebates);

    // Efficiency and savings calculations
    const efficiencyFactors: Record<string, number> = {
      'gas': 0.30,      // 30% savings (gas is cheap, lower savings)
      'electric': 0.60, // 60% savings (electric is expensive)
      'oil': 0.50,      // 50% savings
      'propane': 0.50   // 50% savings
    };

    // Climate zone efficiency adjustments
    const climateAdjustments: Record<string, number> = {
      'coastal': 1.0,   // Full efficiency
      'interior': 0.85, // 85% efficiency (colder winters)
      'northern': 0.70  // 70% efficiency (very cold)
    };

    const savingsPercent = efficiencyFactors[inputs.currentHeating] || 0;
    const climateMultiplier = climateAdjustments[inputs.climateZone] || 1;

    const annualSavings = annualCost * savingsPercent * climateMultiplier;
    const paybackYears = netCost / (annualSavings || 1);
    const savings15Year = (annualSavings * 15) - netCost;

    return {
      installCost,
      federalRebate,
      provincialRebate,
      utilityRebate,
      totalRebates,
      netCost,
      annualSavings,
      paybackYears,
      savings15Year,
      savingsPercent: savingsPercent * 100
    };
  };

  const results = calculateROI();

  const handleCalculate = () => {
    if (inputs.currentHeating && inputs.annualCost && inputs.climateZone && inputs.heatPumpType) {
      setShowResults(true);
    } else {
      alert('Please fill in all required fields');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary-600">Home</Link>
        <span className="mx-2">/</span>
        <span>ROI Calculator</span>
      </nav>

      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Heat Pump ROI Calculator
      </h1>
      <p className="text-xl text-gray-600 mb-8">
        Calculate your heat pump payback period, annual savings, and 15-year ROI based on your specific situation in British Columbia.
      </p>

      <ArticleMeta
        lastUpdated="2026-02-16"
        readTime="5 min"
      />

      <div className="bg-gradient-to-br from-primary-50 to-blue-50 border border-primary-200 rounded-2xl p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Heating Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Current Heating Type *
            </label>
            <select
              value={inputs.currentHeating}
              onChange={(e) => updateInput('currentHeating', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
            >
              <option value="">Select...</option>
              <option value="gas">Natural Gas</option>
              <option value="electric">Electric Baseboard/Resistance</option>
              <option value="oil">Oil Furnace/Boiler</option>
              <option value="propane">Propane</option>
            </select>
          </div>

          {/* Annual Heating Cost */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Annual Heating Cost (CAD) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-gray-600 font-medium">$</span>
              <input
                type="number"
                value={inputs.annualCost}
                onChange={(e) => updateInput('annualCost', e.target.value)}
                placeholder="2400"
                className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">Check your annual utility bills</p>
          </div>

          {/* Home Size */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Home Size (sq ft)
            </label>
            <input
              type="number"
              value={inputs.homeSize}
              onChange={(e) => updateInput('homeSize', e.target.value)}
              placeholder="1800"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
            />
          </div>

          {/* Climate Zone */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Climate Zone *
            </label>
            <select
              value={inputs.climateZone}
              onChange={(e) => updateInput('climateZone', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
            >
              <option value="">Select...</option>
              <option value="coastal">Coastal (Vancouver, Victoria)</option>
              <option value="interior">Interior (Kelowna, Kamloops)</option>
              <option value="northern">Northern (Prince George)</option>
            </select>
          </div>

          {/* Heat Pump Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Heat Pump Type *
            </label>
            <select
              value={inputs.heatPumpType}
              onChange={(e) => updateInput('heatPumpType', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
            >
              <option value="">Select...</option>
              <option value="ductless-1zone">Ductless Mini-Split (1 zone) - $4,000</option>
              <option value="ductless-3zone">Ductless Mini-Split (3 zones) - $12,000</option>
              <option value="central">Central Ducted System - $14,000</option>
              <option value="air-to-water">Air-to-Water (Hydronic) - $22,000</option>
            </select>
          </div>

          {/* Household Income */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Household Income Level
            </label>
            <select
              value={inputs.householdIncome}
              onChange={(e) => updateInput('householdIncome', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
            >
              <option value="standard">Standard Income</option>
              <option value="income-qualified">Income-Qualified (Enhanced Rebates)</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleCalculate}
          className="mt-8 w-full bg-gradient-accent text-white px-8 py-4 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
        >
          Calculate My ROI
        </button>
      </div>

      {/* Results Section */}
      {showResults && (
        <div className="space-y-6">
          <div className="bg-white border-2 border-success-200 rounded-2xl p-8 shadow-lg">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span>📊</span> Your Heat Pump ROI Analysis
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-primary-50 to-blue-100 rounded-xl p-6 text-center">
                <div className="text-sm text-gray-700 mb-2">Total Investment</div>
                <div className="text-3xl font-bold text-primary-700">${results.installCost.toLocaleString()}</div>
                <div className="text-xs text-gray-600 mt-1">Before rebates</div>
              </div>

              <div className="bg-gradient-to-br from-success-50 to-green-100 rounded-xl p-6 text-center">
                <div className="text-sm text-gray-700 mb-2">Total Rebates</div>
                <div className="text-3xl font-bold text-success-700">-${results.totalRebates.toLocaleString()}</div>
                <div className="text-xs text-gray-600 mt-1">Federal + Provincial + Utility</div>
              </div>

              <div className="bg-gradient-to-br from-accent-50 to-orange-100 rounded-xl p-6 text-center">
                <div className="text-sm text-gray-700 mb-2">Net Cost</div>
                <div className="text-3xl font-bold text-accent-700">${results.netCost.toLocaleString()}</div>
                <div className="text-xs text-gray-600 mt-1">After rebates</div>
              </div>
            </div>

            {/* Rebate Breakdown */}
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <h3 className="font-bold text-gray-900 mb-4">Rebate Breakdown</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Federal (Canada Greener Homes):</span>
                  <span className="font-semibold text-primary-600">${results.federalRebate.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Provincial (CleanBC):</span>
                  <span className="font-semibold text-primary-600">${results.provincialRebate.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Utility Rebates:</span>
                  <span className="font-semibold text-primary-600">${results.utilityRebate.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Savings Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-yellow-50 to-amber-100 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-3">Annual Savings</h3>
                <div className="text-4xl font-bold text-yellow-700 mb-2">
                  ${Math.round(results.annualSavings).toLocaleString()}/year
                </div>
                <div className="text-sm text-gray-700">
                  {results.savingsPercent}% reduction in heating costs
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-3">Payback Period</h3>
                <div className="text-4xl font-bold text-purple-700 mb-2">
                  {results.paybackYears.toFixed(1)} years
                </div>
                <div className="text-sm text-gray-700">
                  {results.paybackYears < 7 ? '✅ Excellent ROI' : results.paybackYears < 12 ? '👍 Good ROI' : '⚠️ Long payback period'}
                </div>
              </div>
            </div>

            {/* 15-Year Savings */}
            <div className="mt-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl p-8 text-center">
              <div className="text-lg mb-2">15-Year Total Savings (Net)</div>
              <div className="text-5xl font-bold mb-2">
                ${Math.round(results.savings15Year).toLocaleString()}
              </div>
              <div className="text-sm opacity-90">
                ${Math.round(results.annualSavings * 15).toLocaleString()} in savings - ${results.netCost.toLocaleString()} net investment
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">💡 Recommendations</h3>
            <div className="space-y-3 text-sm text-gray-700">
              {results.paybackYears < 7 && (
                <div className="flex gap-3 bg-success-50 p-4 rounded-lg">
                  <span>✅</span>
                  <div>
                    <strong>Strong ROI:</strong> Your payback period is excellent. A heat pump is likely a good investment for your situation.
                  </div>
                </div>
              )}
              {results.paybackYears >= 7 && results.paybackYears < 12 && (
                <div className="flex gap-3 bg-yellow-50 p-4 rounded-lg">
                  <span>👍</span>
                  <div>
                    <strong>Moderate ROI:</strong> Consider a hybrid system (heat pump + existing heating) to reduce upfront costs while still capturing savings.
                  </div>
                </div>
              )}
              {results.paybackYears >= 12 && (
                <div className="flex gap-3 bg-orange-50 p-4 rounded-lg">
                  <span>⚠️</span>
                  <div>
                    <strong>Long Payback:</strong> With natural gas, payback periods are often longer. Consider if your existing system is near end-of-life, or if environmental benefits justify the investment.
                  </div>
                </div>
              )}
              {inputs.householdIncome === 'standard' && (
                <div className="flex gap-3 bg-blue-50 p-4 rounded-lg">
                  <span>💰</span>
                  <div>
                    <strong>Check Income Qualifications:</strong> If your household income qualifies for enhanced rebates, you could get up to $6,000 more in provincial support.
                  </div>
                </div>
              )}
              <div className="flex gap-3 bg-gray-50 p-4 rounded-lg">
                <span>📋</span>
                <div>
                  <strong>Next Steps:</strong> Get 3 quotes from licensed installers, verify current rebate availability, and ensure proper sizing with a Manual J heat load calculation.
                </div>
              </div>
            </div>
          </div>

          {/* Related Resources */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Related Resources</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/rebates" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2">
                <span>→</span> Full Rebate Guide for BC (2026)
              </Link>
              <Link href="/directory" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2">
                <span>→</span> Find Licensed Installers
              </Link>
              <Link href="/guides/cost-heat-pump-installation-bc" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2">
                <span>→</span> Heat Pump Installation Costs
              </Link>
              <Link href="/faq" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2">
                <span>→</span> Heat Pump FAQ
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 rounded-lg p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-bold text-gray-900 mb-2">Disclaimer</p>
            <p className="text-gray-700 text-sm leading-relaxed">
              This calculator provides estimates based on typical scenarios and assumptions. Actual costs, rebates, and savings will vary based on your specific home, climate, installer pricing, energy rates, and usage patterns. Rebate availability and amounts change frequently—verify current programs before making decisions. Always get professional quotes and heat load calculations before purchasing equipment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
