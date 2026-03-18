/**
 * pricing.ts — Single Source of Truth for installation costs, efficiency factors, and utility rates
 *
 * RULE: When pricing changes, update THIS FILE ONLY.
 *       All calculators and components import from here.
 *       MDX guides should be validated against these values.
 *
 * Last full audit: 2026-03-17
 */

// ─── Installation Costs (2026 CAD, installed, before rebates) ──────────────────

export interface InstallationCostRange {
  min: number;
  max: number;
  label: string;
  notes?: string;
}

export const INSTALLATION_COSTS: Record<string, InstallationCostRange> = {
  ductless_1zone: {
    min: 4500,
    max: 9000,
    label: 'Ductless Mini-Split (1 zone)',
  },
  ductless_3zone: {
    min: 10000,
    max: 15000,
    label: 'Ductless Mini-Split (3 zones)',
  },
  central_ducted: {
    min: 8000,
    max: 18000,
    label: 'Central Ducted',
    notes: 'Includes air handler and line set',
  },
  air_to_water: {
    min: 15000,
    max: 30000,
    label: 'Air-to-Water (Hydronic)',
    notes: 'Includes buffer tank, circulation pumps, and hydronic integration',
  },
} as const;

/** Midpoint cost for calculator defaults */
export function getTypicalCost(systemType: keyof typeof INSTALLATION_COSTS): number {
  const range = INSTALLATION_COSTS[systemType];
  return Math.round((range.min + range.max) / 2);
}

/** Format cost range as display string */
export function formatCostRange(systemType: keyof typeof INSTALLATION_COSTS): string {
  const range = INSTALLATION_COSTS[systemType];
  return `$${range.min.toLocaleString()} - $${range.max.toLocaleString()}`;
}

// ─── Efficiency Factors (estimated savings vs electric baseboard) ───────────────

export interface EfficiencyFactor {
  savingsVsBaseboard: number;  // 0-1 proportion
  label: string;
}

export const EFFICIENCY_FACTORS: Record<string, EfficiencyFactor> = {
  oil:                 { savingsVsBaseboard: 0.50, label: 'Oil Furnace / Boiler' },
  propane:             { savingsVsBaseboard: 0.50, label: 'Propane Furnace / Boiler' },
  gas:                 { savingsVsBaseboard: 0.30, label: 'Natural Gas Furnace / Boiler' },
  electric_baseboard:  { savingsVsBaseboard: 0.55, label: 'Electric Baseboard' },
  electric_forced_air: { savingsVsBaseboard: 0.50, label: 'Electric Forced Air / Fan Coil' },
  // Calculator page uses slightly different keys — map 'electric' → baseboard
  electric:            { savingsVsBaseboard: 0.60, label: 'Electric (General)' },
};

// ─── Climate Adjustment Factors ────────────────────────────────────────────────

export const CLIMATE_ADJUSTMENTS: Record<string, number> = {
  coastal:  1.0,   // Full efficiency
  interior: 0.85,  // 85% — colder winters
  northern: 0.70,  // 70% — very cold
};

// ─── Utility Rates (2026) ──────────────────────────────────────────────────────

export const UTILITY_RATES = {
  bcHydroTier1:   0.0999,   // $/kWh — Step 1
  bcHydroTier2:   0.1499,   // $/kWh — Step 2
  bcHydroBlended: 0.12,     // $/kWh — estimated blended rate
  fortisBCGas:    12.50,    // $/GJ
  lastVerified: '2026-03-17',
} as const;

// ─── Income Qualification Thresholds ───────────────────────────────────────────

export const INCOME_THRESHOLDS = [
  { householdSize: '1-2 people', threshold: 55000 },
  { householdSize: '3-4 people', threshold: 72000 },
  { householdSize: '5+ people',  threshold: 88000 },
] as const;

/** Format thresholds as compact display string */
export function formatIncomeThresholds(): string {
  return INCOME_THRESHOLDS
    .map(t => `$${(t.threshold / 1000).toFixed(0)}K (${t.householdSize})`)
    .join(', ');
}
