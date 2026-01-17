/**
 * Chad 2030 Pipeline Simulator - Parameter Dictionary
 *
 * SINGLE SOURCE OF TRUTH for all numeric values.
 * Based on 03_PARAMETER_DICTIONARY.md v1.3
 */

import type { SimulationParameters, OilPriceScenario, RiskLevel } from './types';

export const PARAMETERS: SimulationParameters = {
  // ============================================================================
  // INITIAL CONDITIONS (INIT)
  // ============================================================================
  init: {
    nProjects: 268, // Chad Connection 2030 portfolio
    capexTotal: 20500, // USD millions
    capexAvg: 76, // USD millions
    capexMin: 20, // USD millions
    capexMax: 150, // USD millions
    nTier1: 40, // Flagship priority
    nTier2: 60, // High priority
    nTier3: 168, // Standard priority
    startYear: 2025,
    endYear: 2030,
    durationMonths: 72, // 6 years × 12
  },

  // ============================================================================
  // STAGE DURATIONS (STAGE)
  // ============================================================================
  stages: {
    2: { baseDuration: 4.5, stdDev: 1.5 }, // Partnership Structuring
    3: { baseDuration: 6.5, stdDev: 2.5 }, // Pre-Feasibility
    4: { baseDuration: 12.0, stdDev: 3.0 }, // Feasibility
    5: { baseDuration: 8.0, stdDev: 2.0 }, // Parliamentary
    6: { baseDuration: 2.0, stdDev: 1.0 }, // Financial Close Prep
    // Total baseline: 33 months
  },

  // ============================================================================
  // GATE PASS RATES (GATE)
  // ============================================================================
  gates: {
    2: { baseRate: 0.75, floor: 0.50, ceiling: 0.95 }, // Partnership Agreement
    3: { baseRate: 0.70, floor: 0.45, ceiling: 0.92 }, // Feasibility Authorization
    4: { baseRate: 0.75, floor: 0.50, ceiling: 0.95 }, // Cabinet Approval
    5: { baseRate: 0.80, floor: 0.55, ceiling: 0.95 }, // Parliamentary Ratification
    6: { baseRate: 0.92, floor: 0.75, ceiling: 0.98 }, // Financial Close
    // Cumulative baseline: 0.29 (29% of projects reach FID)
  },

  // ============================================================================
  // MODALITY MODIFIERS
  // ============================================================================
  modalities: {
    GOV_LED: {
      durationMultipliers: {
        2: 1.1, // +10%
        3: 1.23, // +1.5mo / 6.5mo baseline
        4: 1.375, // +4.5mo / 12.0mo baseline
        5: 1.0625, // +0.5mo / 8.0mo baseline
        6: 1.25, // +0.5mo / 2.0mo baseline
      },
      passRateAdjustments: {
        2: -0.03, // 0.72 vs 0.75
        3: -0.05, // 0.65 vs 0.70
        4: -0.05, // 0.70 vs 0.75
        5: -0.05, // 0.75 vs 0.80
        6: -0.04, // 0.88 vs 0.92
      },
      cofinancingRate: 1.0, // 100% government
      contingentLiabilityRate: 0.0,
    },
    PPP: {
      durationMultipliers: {
        2: 1.0, // Baseline
        3: 1.0,
        4: 1.0,
        5: 1.0,
        6: 1.0,
      },
      passRateAdjustments: {
        2: 0.03, // 0.78 vs 0.75
        3: 0.05, // 0.75 vs 0.70
        4: 0.05, // 0.80 vs 0.75
        5: 0.05, // 0.85 vs 0.80
        6: 0.01, // 0.93 vs 0.92
      },
      cofinancingRate: 0.3, // 30% midpoint
      contingentLiabilityRate: 0.125, // 12.5% midpoint
    },
    FULLY_PRIVATE: {
      durationMultipliers: {
        2: 0.95, // -5%
        3: 0.95, // -5%
        4: 0.85, // -15%
        5: 0.95, // -5%
        6: 0.9, // -10%
      },
      passRateAdjustments: {
        2: 0.0, // 0.75 vs 0.75
        3: 0.0, // 0.70 vs 0.70
        4: 0.03, // 0.78 vs 0.75
        5: 0.03, // 0.83 vs 0.80
        6: 0.01, // 0.93 vs 0.92
      },
      cofinancingRate: 0.0, // 0% government
      contingentLiabilityRate: 0.05, // 5% (permits, land)
    },
  },

  // ============================================================================
  // INTERVENTION MODIFIERS
  // ============================================================================

  // Transaction Advisor - Duration reduction (multiplicative)
  advisorDurationMod: {
    2: 0.667, // -33%, 4.5→3.0
    3: 0.692, // -31%, 6.5→4.5
    4: 0.75, // -25%, 12.0→9.0
    5: 0.813, // -19%, 8.0→6.5
    6: 0.75, // -25%, 2.0→1.5
  },

  // Transaction Advisor - Pass rate lift (additive)
  advisorLiftMod: {
    2: 0.1, // 0.75→0.85
    3: 0.1, // 0.70→0.80
    4: 0.1, // 0.75→0.85
    5: 0.08, // 0.80→0.88
    6: 0.03, // 0.92→0.95
  },

  // PMU Expansion - Max duration reduction at 15 FTE
  pmuMaxDurationReduction: {
    2: 0.1, // -10%
    3: 0.12, // -12%
    4: 0.15, // -15%
    5: 0.1, // -10%
    6: 0.08, // -8%
  },

  // PMU Expansion - Max pass rate lift at 15 FTE
  pmuMaxLiftMod: {
    2: 0.04,
    3: 0.06,
    4: 0.08,
    5: 0.06,
    6: 0.02,
  },

  // Champion effects
  championDurationReduction: 0.7, // -30% for Stage 4
  championLift: 0.1, // +10pp for Gate 4

  // ============================================================================
  // POLITICAL RISK MODIFIERS
  // ============================================================================

  // Duration multipliers by risk level
  riskDurationMod: {
    LOW: { 2: 1.0, 3: 1.0, 4: 1.0, 5: 1.0, 6: 1.0 },
    MED: { 2: 1.05, 3: 1.05, 4: 1.1, 5: 1.05, 6: 1.05 },
    HIGH: { 2: 1.15, 3: 1.15, 4: 1.35, 5: 1.15, 6: 1.15 },
  } as Record<RiskLevel, Record<number, number>>,

  // Pass rate penalties by risk level
  riskPassPenalty: {
    LOW: { 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
    MED: { 2: -0.02, 3: -0.02, 4: -0.03, 5: -0.02, 6: -0.02 },
    HIGH: { 2: -0.05, 3: -0.05, 4: -0.08, 5: -0.05, 6: -0.05 },
  } as Record<RiskLevel, Record<number, number>>,

  // ============================================================================
  // CAPACITY CONSTRAINTS
  // ============================================================================
  pmuBase: 10, // Baseline PMU staff (FTE)
  projectsPerFte: 2.5, // Projects per FTE
  stage4Max: 13, // Hard limit for Stage 4 (advisor bandwidth)
  stage5MaxAnnual: 12, // Parliamentary calendar limit

  capacityThresholds: {
    green: 0.8, // ≤80% = OK
    yellow: 1.0, // 80-100% = Strained
    red: 1.0, // >100% = Exceeded
  },

  capacityPenalties: {
    durationYellow: 1.1, // +10%
    durationRed: 1.25, // +25%
    passYellow: -0.02, // -2pp
    passRed: -0.05, // -5pp
  },

  // ============================================================================
  // FISCAL PARAMETERS
  // ============================================================================
  fiscal: {
    // Oil revenue
    oilProd2025: 136000, // bbl/day
    oilProdGrowth: {
      2025: -0.007, // -0.7%
      2026: 0.12, // +12%
      2027: 0.12,
      2028: 0.12,
      2029: 0.12,
      2030: 0.12,
    },
    govTakeRate: 0.55, // 55%
    daysPerYear: 365,

    // Oil price scenarios (USD/bbl)
    oilPrices: {
      50: 50,
      55: 55,
      65: 65,
      67: 66.94, // IMF WEO April 2025
      75: 75,
    } as Record<OilPriceScenario, number>,

    // Non-oil revenue
    nonOilGdp2025: 10748, // CFAF billions
    nonOilGrowth: {
      2025: 0.042, // 4.2%
      2026: 0.035, // 3.5%
      2027: 0.0375, // 3.5-4.0%
      2028: 0.0375,
      2029: 0.0375,
      2030: 0.0375,
    },
    nonOilTaxRate: {
      2025: 0.089, // 8.9% of non-oil GDP
      2026: 0.095, // 9.5%
      2027: 0.1, // 10.0%
      2028: 0.103, // 10.3%
      2029: 0.107, // 10.7%
      2030: 0.11, // 11.0%
    },

    // GDP and exchange rate
    totalGdp2025: 12250, // CFAF billions
    cfafPerUsd: 581, // 2025 average

    // IMF ECF binding constraints
    maxCofinSafe: 0.35, // 35% of revenue
    maxCofinBreach: 0.45, // >45% = breach
    maxDeficit: -0.015, // -1.5% of GDP (CEMAC)
    maxContingent: 0.012, // 0.6-1.2% of GDP
    debtCeiling: 0.33, // 33% of GDP
    debtWarning: 0.3, // 30% warning

    // NOPD targets (% of non-oil GDP)
    nopdTargets: {
      2025: -0.068,
      2026: -0.062,
      2027: -0.057,
      2028: -0.054,
      2029: -0.052,
      2030: -0.045,
    },

    // Donor grants baseline (% of non-oil GDP)
    donorBaseline: {
      2025: 0.028,
      2026: 0.023,
      2027: 0.018,
      2028: 0.018,
      2029: 0.018,
      2030: 0.018,
    },

    // Fixed obligations (% of non-oil GDP)
    wages: {
      2025: 0.065,
      2026: 0.063,
      2027: 0.062,
      2028: 0.061,
      2029: 0.06,
      2030: 0.06,
    },
    interest: 0.015, // 1.5%
    transfers: 0.039, // 3.9%
    socialFloor: 0.3, // 30% of current spending protected

    // Existing liabilities
    contingent2025: 0.006, // 0.6% of GDP
    debtGdp2025: 0.28, // 28% of GDP (below 30% warning threshold)
  },

  // ============================================================================
  // STAGE COSTS (USD thousands)
  // ============================================================================
  stageCosts: {
    GOV_LED: { 2: 15, 3: 100, 4: 900, 5: 35, 6: 12 }, // Total: 1,062
    PPP: { 2: 15, 3: 60, 4: 500, 5: 35, 6: 12 }, // Total: 622
    FULLY_PRIVATE: { 2: 15, 3: 50, 4: 490, 5: 35, 6: 12 }, // Total: 602
  },

  // ============================================================================
  // EXPECTED OUTCOME BOUNDS
  // ============================================================================
  bounds: {
    fidBaselineMin: 85,
    fidBaselineMax: 95,
    fidAdvMin: 130,
    fidAdvMax: 140,
    fidAdvPmuMin: 140,
    fidAdvPmuMax: 155,
    fidOptMin: 160,
    fidOptMax: 180,
    timeBaselineMin: 28,
    timeBaselineMax: 40,
    timeOptMin: 18,
    timeOptMax: 28,
    invMax: 20500, // USD millions
  },

  // Fiscal status thresholds
  fiscalThresholds: {
    green: 0.8, // ≤80% = Green
    yellow: 1.0, // 80-100% = Yellow
    red: 1.0, // >100% = Red
  },
};

// ============================================================================
// HELPER CONSTANTS
// ============================================================================

/** Total baseline duration (months) */
export const TOTAL_BASELINE_DURATION =
  PARAMETERS.stages[2].baseDuration +
  PARAMETERS.stages[3].baseDuration +
  PARAMETERS.stages[4].baseDuration +
  PARAMETERS.stages[5].baseDuration +
  PARAMETERS.stages[6].baseDuration;

/** Cumulative baseline pass rate */
export const CUMULATIVE_BASELINE_PASS_RATE =
  PARAMETERS.gates[2].baseRate *
  PARAMETERS.gates[3].baseRate *
  PARAMETERS.gates[4].baseRate *
  PARAMETERS.gates[5].baseRate *
  PARAMETERS.gates[6].baseRate;

/** Baseline capacity (concurrent projects) */
export const BASELINE_CAPACITY =
  PARAMETERS.pmuBase * PARAMETERS.projectsPerFte;

/** Maximum PMU expansion FTE */
export const MAX_PMU_ADD = 15;

/** Advisor FTE equivalent */
export const ADVISOR_FTE_EQUIV = 5;

/** Advisor cost (USD millions) */
export const ADVISOR_COST = 2.75;

/** PMU cost per FTE per year (USD thousands) */
export const PMU_COST_PER_FTE = 33.33;

/** Simulation years */
export const SIMULATION_YEARS = [2025, 2026, 2027, 2028, 2029, 2030] as const;

/** Active stage numbers */
export const ACTIVE_STAGES = [2, 3, 4, 5, 6] as const;

/** Active gate numbers */
export const ACTIVE_GATES = [2, 3, 4, 5, 6] as const;
