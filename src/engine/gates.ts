/**
 * Chad 2030 Pipeline Simulator - Gate Pass Rate Calculations
 *
 * Implements Section 4 of 02_CALCULATION_LOGIC_SPEC.md
 *
 * Formula:
 * P_PASS[p, g] = clamp(
 *   BASE_P[g] + LIFT_MODALITY + LIFT_ADVISOR + LIFT_PMU
 *   + LIFT_CHAMPION + PENALTY_CAPACITY + PENALTY_RISK,
 *   FLOOR[g], CEILING[g]
 * )
 */

import type { Modality, GateNumber, ControlInputs } from './types';
import { PARAMETERS, MAX_PMU_ADD, ACTIVE_GATES } from './parameters';

export interface GatePassRateContext {
  controls: ControlInputs;
  modality: Modality;
  hasChampion: boolean;
  loadRatio: number; // Current capacity load ratio
}

/**
 * Clamp a value between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Calculate pass rate for a project at a specific gate
 */
export function calculateGatePassRate(
  gate: GateNumber,
  context: GatePassRateContext
): number {
  const { controls, modality, hasChampion, loadRatio } = context;
  const gateConfig = PARAMETERS.gates[gate];

  // Base pass rate
  let passRate = gateConfig.baseRate;

  // Modality adjustment (additive)
  passRate += PARAMETERS.modalities[modality].passRateAdjustments[gate];

  // Advisor lift (if enabled)
  if (controls.advisor) {
    passRate += PARAMETERS.advisorLiftMod[gate];
  }

  // PMU lift (scaled by expansion level)
  const pmuFraction = controls.pmuAdd / MAX_PMU_ADD;
  passRate += pmuFraction * PARAMETERS.pmuMaxLiftMod[gate];

  // Champion lift (Gate 4 only)
  if (hasChampion && gate === 4) {
    passRate += PARAMETERS.championLift;
  }

  // Capacity penalty
  passRate += getCapacityPassPenalty(loadRatio);

  // Political risk penalty
  passRate += PARAMETERS.riskPassPenalty[controls.politicalRisk][gate];

  // Clamp to floor/ceiling
  return clamp(passRate, gateConfig.floor, gateConfig.ceiling);
}

/**
 * Get capacity-based pass rate penalty
 */
export function getCapacityPassPenalty(loadRatio: number): number {
  const { green, yellow } = PARAMETERS.capacityThresholds;
  const { passYellow, passRed } = PARAMETERS.capacityPenalties;

  if (loadRatio <= green) {
    return 0;
  } else if (loadRatio <= yellow) {
    return passYellow;
  } else {
    return passRed;
  }
}

/**
 * Calculate cumulative pass rate through all gates
 */
export function calculateCumulativePassRate(context: GatePassRateContext): number {
  let cumulative = 1.0;
  for (const gate of ACTIVE_GATES) {
    cumulative *= calculateGatePassRate(gate, context);
  }
  return cumulative;
}

/**
 * Calculate weighted average cumulative pass rate based on modality split
 */
export function calculateWeightedCumulativePassRate(
  controls: ControlInputs,
  loadRatio: number
): number {
  const modalities: Modality[] = ['GOV_LED', 'PPP', 'FULLY_PRIVATE'];
  const weights = [
    controls.pctGovLed / 100,
    controls.pctPPP / 100,
    controls.pctPrivate / 100,
  ];

  let weightedSum = 0;
  for (let i = 0; i < modalities.length; i++) {
    const modality = modalities[i]!;
    const weight = weights[i]!;

    const context: GatePassRateContext = {
      controls,
      modality,
      hasChampion: false, // Baseline (non-championed)
      loadRatio,
    };

    weightedSum += weight * calculateCumulativePassRate(context);
  }

  return weightedSum;
}

/**
 * Get pass rate breakdown for display
 */
export function getPassRateBreakdown(
  controls: ControlInputs,
  modality: Modality,
  hasChampion: boolean,
  loadRatio: number
): Record<GateNumber, { base: number; modified: number }> {
  const context: GatePassRateContext = {
    controls,
    modality,
    hasChampion,
    loadRatio,
  };

  const result: Record<GateNumber, { base: number; modified: number }> = {
    2: { base: 0, modified: 0 },
    3: { base: 0, modified: 0 },
    4: { base: 0, modified: 0 },
    5: { base: 0, modified: 0 },
    6: { base: 0, modified: 0 },
  };

  for (const gate of ACTIVE_GATES) {
    result[gate] = {
      base: PARAMETERS.gates[gate].baseRate,
      modified: calculateGatePassRate(gate, context),
    };
  }

  return result;
}

/**
 * Calculate expected number of projects passing a specific gate
 * from a cohort of N projects (deterministic mode)
 */
export function calculateExpectedPassCount(
  nProjects: number,
  gate: GateNumber,
  context: GatePassRateContext
): number {
  const passRate = calculateGatePassRate(gate, context);
  return nProjects * passRate;
}

/**
 * Calculate expected survivors after all gates (deterministic)
 */
export function calculateExpectedSurvivors(
  nProjects: number,
  context: GatePassRateContext
): number {
  const cumulativeRate = calculateCumulativePassRate(context);
  return nProjects * cumulativeRate;
}
