/**
 * programs.ts — Single Source of Truth for all rebate & incentive programs
 *
 * RULE: When a program changes status or amount, update THIS FILE ONLY.
 *       All calculators, pages, and components import from here.
 *       MDX guides should be validated against these values.
 *
 * Last full audit: 2026-03-17
 */

export type ProgramStatus = 'active' | 'ended' | 'limited';

export interface RebateProgram {
  id: string;
  name: string;
  shortName: string;
  level: 'federal' | 'provincial' | 'utility' | 'municipal';
  type: 'grant' | 'loan';
  status: ProgramStatus;
  statusNote: string;
  amount: number;
  eligibility: {
    heatingSource?: string[];
    incomeQualified?: boolean;
    propertyType?: string[];
    systemType?: string[];
  };
  notes: string;
  sourceUrl: string;
  lastVerified: string;
}

// ─── Federal Programs ──────────────────────────────────────────────────────────

export const GREENER_HOMES_GRANT: RebateProgram = {
  id: 'greener-homes-grant',
  name: 'Canada Greener Homes Grant',
  shortName: 'Greener Homes Grant',
  level: 'federal',
  type: 'grant',
  status: 'ended',
  statusNote: 'Discontinued 2024 — funding depleted',
  amount: 5000,
  eligibility: {},
  notes: 'Previously offered up to $5,000 for heat pump installations with pre/post EnerGuide evaluations.',
  sourceUrl: 'https://www.nrcan.gc.ca/energy-efficiency/homes/canada-greener-homes-grant/23441',
  lastVerified: '2026-03-17',
};

export const GREENER_HOMES_LOAN: RebateProgram = {
  id: 'greener-homes-loan',
  name: 'Canada Greener Homes Loan',
  shortName: 'Greener Homes Loan',
  level: 'federal',
  type: 'loan',
  status: 'active',
  statusNote: 'Active — verify at CMHC',
  amount: 40000,
  eligibility: {},
  notes: 'Interest-free, up to 10-year repayment. Not a grant.',
  sourceUrl: 'https://www.cmhc-schl.gc.ca/consumers/home-buying/canada-greener-homes-loan',
  lastVerified: '2026-03-17',
};

export const OHPA: RebateProgram = {
  id: 'ohpa',
  name: 'Oil to Heat Pump Affordability (OHPA)',
  shortName: 'OHPA',
  level: 'federal',
  type: 'grant',
  status: 'active',
  statusNote: 'Active 2026 — BC residents eligible for enhanced amount',
  amount: 15000,
  eligibility: { heatingSource: ['oil', 'propane'] },
  notes: 'Up to $15,000 in BC (base $10,000 federal + $5,000 BC co-delivery top-up). For oil/propane-heated homes switching to heat pump. Low-to-median income households.',
  sourceUrl: 'https://natural-resources.canada.ca/energy-efficiency/home-energy-efficiency/canada-greener-homes-initiative/oil-heat-pump-affordability-program',
  lastVerified: '2026-03-17',
};

// ─── Provincial Programs (BC) ──────────────────────────────────────────────────

export const CLEANBC_STANDARD: RebateProgram = {
  id: 'cleanbc-standard',
  name: 'CleanBC Better Homes — Standard',
  shortName: 'CleanBC Standard',
  level: 'provincial',
  type: 'grant',
  status: 'ended',
  statusNote: 'Gas-to-electric ended April 11, 2025',
  amount: 6000,
  eligibility: { incomeQualified: false },
  notes: 'Applications still accepted for work completed/quoted before end date.',
  sourceUrl: 'https://betterhomesbc.ca',
  lastVerified: '2026-03-17',
};

export const CLEANBC_INCOME_QUALIFIED: RebateProgram = {
  id: 'cleanbc-income-qualified',
  name: 'CleanBC Energy Savings Program — Income-Qualified',
  shortName: 'CleanBC IQ',
  level: 'provincial',
  type: 'grant',
  status: 'active',
  statusNote: 'Active 2026 — $50M/year budgeted through 2026-27',
  amount: 16000,
  eligibility: { incomeQualified: true },
  notes: 'Up to $16,000 heat pump rebate (Level 1). Level 2: up to $12,000. Level 3 (moderate income): up to $10,500. Up to $24,500 total including electrical upgrades. Property value cap: $1,230,000 for max tiers.',
  sourceUrl: 'https://betterhomesbc.ca/rebates/energy-savings-program-heat-pump-offers/',
  lastVerified: '2026-03-17',
};

// ─── Utility Programs ──────────────────────────────────────────────────────────

export const BC_HYDRO_REBATE: RebateProgram = {
  id: 'bc-hydro',
  name: 'BC Hydro Heat Pump Rebate',
  shortName: 'BC Hydro',
  level: 'utility',
  type: 'grant',
  status: 'limited',
  statusNote: 'Availability varies — verify at bchydro.com',
  amount: 2000,
  eligibility: {},
  notes: 'For BC Hydro service area customers. Ducted: up to $2,000. Ductless: up to $1,000.',
  sourceUrl: 'https://www.bchydro.com/rebates',
  lastVerified: '2026-03-17',
};

export const BC_HYDRO_CONDO: RebateProgram = {
  id: 'bc-hydro-condo',
  name: 'BC Hydro Condo Program (CleanBC)',
  shortName: 'BC Hydro Condo',
  level: 'utility',
  type: 'grant',
  status: 'active',
  statusNote: 'Active 2026 for condo/strata',
  amount: 5000,
  eligibility: { propertyType: ['condo'], incomeQualified: true },
  notes: 'Standard: $2,250/unit. Income-qualified: up to $5,000/unit.',
  sourceUrl: 'https://www.bchydro.com/rebates',
  lastVerified: '2026-03-17',
};

export const FORTISBC_DUAL_FUEL: RebateProgram = {
  id: 'fortisbc-dual-fuel',
  name: 'FortisBC Dual Fuel Heating System Rebate',
  shortName: 'FortisBC Dual Fuel',
  level: 'utility',
  type: 'grant',
  status: 'ended',
  statusNote: 'Ended December 18, 2025',
  amount: 5000,
  eligibility: {},
  notes: 'Dual fuel program ended. See FortisBC heat pump rebate (below) for current options.',
  sourceUrl: 'https://www.fortisbc.com/rebates',
  lastVerified: '2026-03-17',
};

export const FORTISBC_HEAT_PUMP: RebateProgram = {
  id: 'fortisbc-heat-pump',
  name: 'FortisBC Heat Pump Rebate',
  shortName: 'FortisBC HP',
  level: 'utility',
  type: 'grant',
  status: 'ended',
  statusNote: 'Program page shows unavailable — verify directly with FortisBC',
  amount: 4000,
  eligibility: { heatingSource: ['electric_baseboard', 'electric_forced_air'] },
  notes: 'Previously up to $4,000 (whole home) or $1,500 (partial). FortisBC rebate page currently returns "unavailable." Contact FortisBC at 1-866-436-7847 to confirm current status.',
  sourceUrl: 'https://www.fortisbc.com/rebates/detail/air-source-heat-pump-rebate',
  lastVerified: '2026-03-17',
};

export const FORTISBC_HEAT_PUMP_IQ: RebateProgram = {
  id: 'fortisbc-heat-pump-iq',
  name: 'FortisBC Heat Pump Rebate — Income-Qualified',
  shortName: 'FortisBC HP IQ',
  level: 'utility',
  type: 'grant',
  status: 'ended',
  statusNote: 'Program page shows unavailable — verify directly with FortisBC',
  amount: 12000,
  eligibility: { heatingSource: ['electric_baseboard', 'electric_forced_air'], incomeQualified: true },
  notes: 'Previously up to $12,000 for income-qualified customers. FortisBC rebate page currently returns "unavailable." Contact FortisBC at 1-866-436-7847 to confirm current status.',
  sourceUrl: 'https://www.fortisbc.com/rebates/detail/iqheatpump',
  lastVerified: '2026-03-17',
};

export const CLEANBC_MULTI_UNIT: RebateProgram = {
  id: 'cleanbc-multi-unit',
  name: 'CleanBC Energy Savings — Multi-Unit Residential',
  shortName: 'CleanBC Multi-Unit',
  level: 'provincial',
  type: 'grant',
  status: 'active',
  statusNote: 'Active mid-2025 onward — expanding to individual suites',
  amount: 5500,
  eligibility: { propertyType: ['condo'] },
  notes: 'Up to $5,500 for ductless mini-split in individual suites in multi-unit residential buildings.',
  sourceUrl: 'https://news.gov.bc.ca/releases/2025ECS0014-000309',
  lastVerified: '2026-03-17',
};

// ─── All Programs ──────────────────────────────────────────────────────────────

export const PROGRAMS: RebateProgram[] = [
  GREENER_HOMES_GRANT,
  GREENER_HOMES_LOAN,
  OHPA,
  CLEANBC_STANDARD,
  CLEANBC_INCOME_QUALIFIED,
  CLEANBC_MULTI_UNIT,
  BC_HYDRO_REBATE,
  BC_HYDRO_CONDO,
  FORTISBC_DUAL_FUEL,
  FORTISBC_HEAT_PUMP,
  FORTISBC_HEAT_PUMP_IQ,
];

// ─── Helper Functions ──────────────────────────────────────────────────────────

export const getActiveGrants = () =>
  PROGRAMS.filter(p => p.status === 'active' && p.type === 'grant');

export const getEndedGrants = () =>
  PROGRAMS.filter(p => p.status === 'ended' && p.type === 'grant');

export const getProgramById = (id: string) =>
  PROGRAMS.find(p => p.id === id);

/**
 * Calculate maximum available grants for a given scenario.
 * Does NOT include loans. Returns only active grant programs the user qualifies for.
 */
export function getMaxGrantForScenario(
  heatingSource: string,
  incomeQualified: boolean,
  propertyType: string = 'house',
  systemType: string = 'ductless',
): number {
  let total = 0;

  // OHPA — oil/propane only
  if (OHPA.status === 'active' && OHPA.eligibility.heatingSource?.includes(heatingSource)) {
    total += OHPA.amount;
  }

  // CleanBC — income-qualified only (standard ended)
  if (incomeQualified && CLEANBC_INCOME_QUALIFIED.status === 'active') {
    total += CLEANBC_INCOME_QUALIFIED.amount;
  }

  // BC Hydro — depends on property type
  if (propertyType === 'condo' && BC_HYDRO_CONDO.status === 'active') {
    total += incomeQualified ? BC_HYDRO_CONDO.amount : 2250;
  } else if (BC_HYDRO_REBATE.status !== 'ended') {
    total += systemType === 'ducted' ? 2000 : 1000;
  }

  return total;
}

/**
 * Get default rebate amount for ROI calculator by heating type.
 * Returns conservative (non-income-qualified) estimate.
 */
export function getDefaultRebate(heatingType: string): number {
  if (OHPA.status === 'active' && OHPA.eligibility.heatingSource?.includes(heatingType)) {
    return OHPA.amount;
  }
  // Most standard-income programs have ended
  return 0;
}
