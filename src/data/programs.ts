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
  sourceUrl: 'https://www.cmhc-schl.gc.ca/professionals/project-funding-and-mortgage-financing/funding-programs/all-funding-programs/canada-greener-homes-loan',
  lastVerified: '2026-03-17',
};

export const OHPA: RebateProgram = {
  id: 'ohpa',
  name: 'Oil to Heat Pump Affordability (OHPA)',
  shortName: 'OHPA',
  level: 'federal',
  type: 'grant',
  status: 'active',
  statusNote: 'Active 2026',
  amount: 10000,
  eligibility: { heatingSource: ['oil', 'propane'] },
  notes: 'Federal grant for oil/propane-heated homes switching to a heat pump.',
  sourceUrl: 'https://www.nrcan.gc.ca/energy-efficiency/homes/canada-greener-homes-initiative/oil-to-heat-pump-affordability-program-ohpa/24775',
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
  name: 'CleanBC Income-Qualified',
  shortName: 'CleanBC IQ',
  level: 'provincial',
  type: 'grant',
  status: 'active',
  statusNote: 'Active 2026 — funding subject to availability',
  amount: 16000,
  eligibility: { incomeQualified: true },
  notes: 'Up to 100% of installation costs. Income thresholds vary by household size.',
  sourceUrl: 'https://betterhomesbc.ca',
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
  notes: 'Check FortisBC website for successor programs in 2026.',
  sourceUrl: 'https://www.fortisbc.com/rebates',
  lastVerified: '2026-03-17',
};

// ─── All Programs ──────────────────────────────────────────────────────────────

export const PROGRAMS: RebateProgram[] = [
  GREENER_HOMES_GRANT,
  GREENER_HOMES_LOAN,
  OHPA,
  CLEANBC_STANDARD,
  CLEANBC_INCOME_QUALIFIED,
  BC_HYDRO_REBATE,
  BC_HYDRO_CONDO,
  FORTISBC_DUAL_FUEL,
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
