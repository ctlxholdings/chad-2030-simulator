/**
 * Chad 2030 Pipeline Simulator - Stage Duration Calculations
 *
 * Implements Section 3 of 02_CALCULATION_LOGIC_SPEC.md
 *
 * Formula:
 * DURATION[p, s] = BASE_DUR[s] × MOD_MODALITY × MOD_ADVISOR × MOD_PMU
 *                  × MOD_CHAMPION × MOD_CAPACITY × MOD_RISK
 */

import type { Modality, StageNumber, ControlInputs } from './types';
import { PARAMETERS, MAX_PMU_ADD } from './parameters';

export interface StageDurationContext {
  controls: ControlInputs;
  modality: Modality;
  hasChampion: boolean;
  loadRatio: number; // Current capacity load ratio
}

/**
 * Calculate duration for a project in a specific stage
 */
export function calculateStageDuration(
  stage: StageNumber,
  context: StageDurationContext
): number {
  const { controls, modality, hasChampion, loadRatio } = context;

  // Base duration
  const baseDuration = PARAMETERS.stages[stage].baseDuration;

  // Modality modifier
  const modalityMod = PARAMETERS.modalities[modality].durationMultipliers[stage];

  // Advisor modifier (if enabled)
  const advisorMod = controls.advisor
    ? PARAMETERS.advisorDurationMod[stage]
    : 1.0;

  // PMU modifier (scaled by expansion level)
  const pmuFraction = controls.pmuAdd / MAX_PMU_ADD;
  const pmuMaxReduction = PARAMETERS.pmuMaxDurationReduction[stage];
  const pmuMod = 1.0 - pmuFraction * pmuMaxReduction;

  // Champion modifier (Stage 4 only)
  const championMod =
    hasChampion && stage === 4 ? PARAMETERS.championDurationReduction : 1.0;

  // Capacity modifier
  const capacityMod = getCapacityDurationModifier(loadRatio);

  // Political risk modifier
  const riskMod = PARAMETERS.riskDurationMod[controls.politicalRisk][stage];

  // Final duration
  const duration =
    baseDuration *
    modalityMod *
    advisorMod *
    pmuMod *
    championMod *
    capacityMod *
    riskMod;

  // Floor at 1 month minimum
  return Math.max(1, duration);
}

/**
 * Get capacity-based duration modifier
 */
export function getCapacityDurationModifier(loadRatio: number): number {
  const { green, yellow } = PARAMETERS.capacityThresholds;
  const { durationYellow, durationRed } = PARAMETERS.capacityPenalties;

  if (loadRatio <= green) {
    return 1.0;
  } else if (loadRatio <= yellow) {
    return durationYellow;
  } else {
    return durationRed;
  }
}

/**
 * Calculate total expected duration from Stage 2 to FID
 */
export function calculateTotalDuration(context: StageDurationContext): number {
  let total = 0;
  for (const stage of [2, 3, 4, 5, 6] as StageNumber[]) {
    total += calculateStageDuration(stage, context);
  }
  return total;
}

/**
 * Calculate average duration across all modalities based on modality split
 */
export function calculateWeightedAverageDuration(
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

    const context: StageDurationContext = {
      controls,
      modality,
      hasChampion: false, // Use baseline (non-championed)
      loadRatio,
    };

    weightedSum += weight * calculateTotalDuration(context);
  }

  return weightedSum;
}

/**
 * Get stage duration breakdown for display
 */
export function getStageDurationBreakdown(
  controls: ControlInputs,
  modality: Modality,
  hasChampion: boolean,
  loadRatio: number
): Record<StageNumber, { base: number; modified: number }> {
  const context: StageDurationContext = {
    controls,
    modality,
    hasChampion,
    loadRatio,
  };

  const result: Record<StageNumber, { base: number; modified: number }> = {
    2: { base: 0, modified: 0 },
    3: { base: 0, modified: 0 },
    4: { base: 0, modified: 0 },
    5: { base: 0, modified: 0 },
    6: { base: 0, modified: 0 },
  };

  for (const stage of [2, 3, 4, 5, 6] as StageNumber[]) {
    result[stage] = {
      base: PARAMETERS.stages[stage].baseDuration,
      modified: calculateStageDuration(stage, context),
    };
  }

  return result;
}
