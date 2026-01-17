/**
 * Chad 2030 Pipeline Simulator - Main Simulation Engine
 *
 * Implements the cohort-based deterministic simulation model
 * as specified in Section 9.2 of 02_CALCULATION_LOGIC_SPEC.md
 */

import type {
  ControlInputs,
  SimulationOutputs,
  SimulationResult,
  Modality,
  StageNumber,
  GateNumber,
  StatusLevel,
} from './types';
import { PARAMETERS, ACTIVE_STAGES, ACTIVE_GATES } from './parameters';
import { calculateWeightedAverageDuration } from './stages';
import {
  calculateGatePassRate,
  calculateWeightedCumulativePassRate,
  type GatePassRateContext,
} from './gates';
import { calculateTotalCapacity, getCapacityStatus, calculatePeakLoadRatio } from './capacity';
import {
  generateFiscalProjection,
  findBreachYear,
} from './fiscal';
import {
  distributeFidsAcrossYears,
  calculateInvestmentMobilized,
  distributeCofinancingByYear,
  calculateDropsByGate,
  calculatePreparationCost,
  generatePipelineData,
} from './aggregation';

// ============================================================================
// MAIN SIMULATION FUNCTION
// ============================================================================

/**
 * Run the complete simulation with given controls
 *
 * This is the main entry point for the simulation engine.
 * Uses cohort-based deterministic mode (default).
 */
export function runSimulation(controls: ControlInputs): SimulationResult {
  const startTime = performance.now();

  // 1. Calculate capacity
  const totalCapacity = calculateTotalCapacity(controls);

  // 2. Estimate steady-state load ratio (simplified - use 0.7 as baseline)
  const estimatedLoadRatio = Math.min(controls.nActive / totalCapacity, 1.2);

  // 3. Calculate weighted average duration across modalities
  const avgDuration = calculateWeightedAverageDuration(controls, estimatedLoadRatio);

  // 4. Calculate weighted cumulative pass rate
  const cumulativePassRate = calculateWeightedCumulativePassRate(
    controls,
    estimatedLoadRatio
  );

  // 5. Calculate expected FIDs (deterministic)
  // Account for champion boost on a subset of projects
  const championedPassRate = calculateChampionedPassRate(controls, estimatedLoadRatio);
  const normalPassRate = cumulativePassRate;

  // Championed projects have higher pass rate
  const champFids = controls.nChampion * championedPassRate;
  const normalFids = (controls.nActive - controls.nChampion) * normalPassRate;
  const totalFids = Math.round(champFids + normalFids);

  // 6. Distribute FIDs across years
  const fidsByYear = distributeFidsAcrossYears(totalFids, avgDuration);

  // 7. Calculate investment breakdown
  const investment = calculateInvestmentMobilized(totalFids, controls);

  // 8. Calculate drops by gate
  const avgGatePassRates = calculateAverageGatePassRates(controls, estimatedLoadRatio);
  const drops = calculateDropsByGate(controls.nActive, avgGatePassRates);

  // 9. Distribute co-financing by year
  const cofinByYear = distributeCofinancingByYear(fidsByYear, controls);

  // 10. Generate fiscal projection
  const fiscalProjection = generateFiscalProjection(controls, cofinByYear);

  // 11. Find overall fiscal status and breach info
  const overallFiscalStatus = determineOverallFiscalStatus(fiscalProjection);
  const breach = findBreachYear(fiscalProjection);

  // 12. Calculate capacity status
  const projectsByStage = estimateProjectsByStage(controls.nActive, avgDuration);
  const peakLoadRatio = calculatePeakLoadRatio(projectsByStage, totalCapacity);
  const capacityStatus = getCapacityStatus(peakLoadRatio);

  // 13. Calculate preparation cost
  const prepCost = calculatePreparationCost(totalFids, drops, controls);

  // 14. Generate pipeline data by year
  const pipelineByYear = generatePipelineData(
    totalFids,
    drops.total,
    controls.nActive,
    avgDuration,
    controls
  );

  // 15. Validate bounds
  const boundsValidation = validateBounds(totalFids, avgDuration, controls);

  // Build outputs
  const outputs: SimulationOutputs = {
    // Primary metrics
    nFid: totalFids,
    investmentTotal: investment.total,
    investmentPrivate: investment.private,
    cofinancingTotal: investment.govCofinancing,
    fiscalStatus: overallFiscalStatus,

    // Secondary metrics
    nDropped: drops.total,
    avgTimeToFid: avgDuration,
    prepCost: prepCost.total,

    // Detailed data
    fiscalByYear: fiscalProjection,
    pipelineByYear,
    dropsByGate: drops.byGate,
    investmentByModality: investment.byModality,

    // Capacity
    capacityStatus,
    peakLoadRatio,

    // Breach info
    breachYear: breach.year,
    breachReason: breach.reason,

    // Validation
    isWithinBounds: boundsValidation.isValid,
    boundsWarning: boundsValidation.warning,
  };

  const executionTimeMs = performance.now() - startTime;

  return {
    outputs,
    projectStates: [], // Empty in cohort mode
    executionTimeMs,
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate pass rate for championed projects (higher at Gate 4)
 */
function calculateChampionedPassRate(
  controls: ControlInputs,
  loadRatio: number
): number {
  // Use PPP as the middle modality for champions
  const context: GatePassRateContext = {
    controls,
    modality: 'PPP',
    hasChampion: true,
    loadRatio,
  };

  let cumulative = 1;
  for (const gate of ACTIVE_GATES) {
    cumulative *= calculateGatePassRate(gate, context);
  }
  return cumulative;
}

/**
 * Calculate average gate pass rates across modalities
 */
function calculateAverageGatePassRates(
  controls: ControlInputs,
  loadRatio: number
): Record<GateNumber, number> {
  const modalities: Modality[] = ['GOV_LED', 'PPP', 'FULLY_PRIVATE'];
  const weights = [
    controls.pctGovLed / 100,
    controls.pctPPP / 100,
    controls.pctPrivate / 100,
  ];

  const result: Record<GateNumber, number> = {
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
  };

  for (const gate of ACTIVE_GATES) {
    let weightedRate = 0;

    for (let i = 0; i < modalities.length; i++) {
      const modality = modalities[i]!;
      const weight = weights[i]!;

      const context: GatePassRateContext = {
        controls,
        modality,
        hasChampion: false,
        loadRatio,
      };

      weightedRate += weight * calculateGatePassRate(gate, context);
    }

    result[gate] = weightedRate;
  }

  return result;
}

/**
 * Estimate projects in each stage at steady state
 */
function estimateProjectsByStage(
  nActive: number,
  totalDuration: number
): Record<StageNumber, number> {
  // Simple estimate: projects distributed proportionally by stage duration
  const result: Record<StageNumber, number> = {
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
  };

  for (const stage of ACTIVE_STAGES) {
    const stageDuration = PARAMETERS.stages[stage].baseDuration;
    result[stage] = Math.round((stageDuration / totalDuration) * nActive);
  }

  return result;
}

/**
 * Determine overall fiscal status from projection
 */
function determineOverallFiscalStatus(
  fiscalProjection: { fiscalStatus: StatusLevel }[]
): StatusLevel {
  // Return worst status across all years
  for (const year of fiscalProjection) {
    if (year.fiscalStatus === 'RED') return 'RED';
  }
  for (const year of fiscalProjection) {
    if (year.fiscalStatus === 'YELLOW') return 'YELLOW';
  }
  return 'GREEN';
}

/**
 * Validate outputs against expected bounds
 */
function validateBounds(
  fids: number,
  avgTime: number,
  controls: ControlInputs
): { isValid: boolean; warning: string | null } {
  const { bounds } = PARAMETERS;
  const warnings: string[] = [];

  // Determine scenario type
  const isBaseline = !controls.advisor && controls.pmuAdd === 0;
  const isAdvisorOnly = controls.advisor && controls.pmuAdd === 0;
  const isOptimized = controls.advisor && controls.pmuAdd >= 10 && controls.nChampion >= 10;

  // Check FID bounds
  if (isBaseline) {
    if (fids < bounds.fidBaselineMin || fids > bounds.fidBaselineMax) {
      warnings.push(
        `Baseline FIDs (${fids}) outside expected range ${bounds.fidBaselineMin}-${bounds.fidBaselineMax}`
      );
    }
  } else if (isAdvisorOnly) {
    if (fids < bounds.fidAdvMin || fids > bounds.fidAdvMax) {
      warnings.push(
        `Advisor-only FIDs (${fids}) outside expected range ${bounds.fidAdvMin}-${bounds.fidAdvMax}`
      );
    }
  } else if (isOptimized) {
    if (fids < bounds.fidOptMin || fids > bounds.fidOptMax) {
      warnings.push(
        `Optimized FIDs (${fids}) outside expected range ${bounds.fidOptMin}-${bounds.fidOptMax}`
      );
    }
  }

  // Check time bounds
  if (isBaseline) {
    if (avgTime < bounds.timeBaselineMin || avgTime > bounds.timeBaselineMax) {
      warnings.push(
        `Baseline time (${avgTime.toFixed(1)} mo) outside expected range ${bounds.timeBaselineMin}-${bounds.timeBaselineMax}`
      );
    }
  } else if (isOptimized) {
    if (avgTime < bounds.timeOptMin || avgTime > bounds.timeOptMax) {
      warnings.push(
        `Optimized time (${avgTime.toFixed(1)} mo) outside expected range ${bounds.timeOptMin}-${bounds.timeOptMax}`
      );
    }
  }

  // Check investment cap
  const investment = fids * PARAMETERS.init.capexAvg;
  if (investment > bounds.invMax) {
    warnings.push(
      `Investment ($${investment.toFixed(0)}M) exceeds portfolio cap ($${bounds.invMax}M)`
    );
  }

  return {
    isValid: warnings.length === 0,
    warning: warnings.length > 0 ? warnings.join('; ') : null,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export { runSimulation as default };
