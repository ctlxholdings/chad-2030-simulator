/**
 * Chad 2030 Pipeline Simulator - Capacity Calculations
 *
 * Implements Section 5 of 02_CALCULATION_LOGIC_SPEC.md
 */

import type { ControlInputs, StatusLevel, StageNumber } from './types';
import { PARAMETERS, BASELINE_CAPACITY, ADVISOR_FTE_EQUIV, ACTIVE_STAGES } from './parameters';

/**
 * Calculate total capacity based on controls
 *
 * TOTAL_CAPACITY = (PMU_BASE + PMU_ADD + ADV_FTE_EQUIV) × PROJECTS_PER_FTE
 */
export function calculateTotalCapacity(controls: ControlInputs): number {
  const advisorFte = controls.advisor ? ADVISOR_FTE_EQUIV : 0;
  return (
    (PARAMETERS.pmuBase + controls.pmuAdd + advisorFte) *
    PARAMETERS.projectsPerFte
  );
}

/**
 * Get effective capacity for a specific stage (respecting hard limits)
 */
export function getEffectiveCapacity(
  stage: StageNumber,
  totalCapacity: number
): number {
  // Stage 4 has advisor bandwidth limit
  if (stage === 4) {
    return Math.min(totalCapacity, PARAMETERS.stage4Max);
  }
  return totalCapacity;
}

/**
 * Calculate load ratio for a stage
 */
export function calculateLoadRatio(
  projectsInStage: number,
  stage: StageNumber,
  totalCapacity: number
): number {
  const effectiveCapacity = getEffectiveCapacity(stage, totalCapacity);
  if (effectiveCapacity === 0) return Infinity;
  return projectsInStage / effectiveCapacity;
}

/**
 * Get capacity status based on load ratio
 */
export function getCapacityStatus(loadRatio: number): StatusLevel {
  const { green, yellow } = PARAMETERS.capacityThresholds;

  if (loadRatio <= green) {
    return 'GREEN';
  } else if (loadRatio <= yellow) {
    return 'YELLOW';
  } else {
    return 'RED';
  }
}

/**
 * Calculate peak load ratio across all stages
 */
export function calculatePeakLoadRatio(
  projectsByStage: Record<StageNumber, number>,
  totalCapacity: number
): number {
  let peakRatio = 0;

  for (const stage of ACTIVE_STAGES) {
    const projects = projectsByStage[stage] || 0;
    const ratio = calculateLoadRatio(projects, stage, totalCapacity);
    peakRatio = Math.max(peakRatio, ratio);
  }

  return peakRatio;
}

/**
 * Estimate concurrent projects in each stage at steady state
 *
 * Uses Little's Law: L = λW
 * Where L = avg items in system, λ = arrival rate, W = avg service time
 */
export function estimateSteadyStateLoad(
  activeProjects: number,
  avgDurationByStage: Record<StageNumber, number>,
  totalDuration: number
): Record<StageNumber, number> {
  const result: Record<StageNumber, number> = {
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
  };

  // Arrival rate (projects per month entering the pipeline)
  const arrivalRate = activeProjects / totalDuration;

  // Expected projects in each stage = arrivalRate × stageDuration
  for (const stage of ACTIVE_STAGES) {
    result[stage] = arrivalRate * avgDurationByStage[stage];
  }

  return result;
}

/**
 * Check if parliamentary throughput constraint is binding
 * Stage 5 hard limit: STAGE5_MAX_ANNUAL projects per year
 */
export function checkParliamentaryConstraint(
  fidsPerYear: number[]
): { isBinding: boolean; constrainedYears: number[] } {
  const constrainedYears: number[] = [];

  for (let i = 0; i < fidsPerYear.length; i++) {
    const fids = fidsPerYear[i];
    if (fids !== undefined && fids > PARAMETERS.stage5MaxAnnual) {
      constrainedYears.push(2025 + i);
    }
  }

  return {
    isBinding: constrainedYears.length > 0,
    constrainedYears,
  };
}

/**
 * Calculate queue delay for projects waiting to enter a stage
 *
 * QUEUE_DELAY = QUEUE_POSITION / THROUGHPUT_RATE
 * THROUGHPUT_RATE = EFFECTIVE_CAPACITY / AVG_STAGE_DURATION
 */
export function calculateQueueDelay(
  queuePosition: number,
  stage: StageNumber,
  avgStageDuration: number,
  totalCapacity: number
): number {
  const effectiveCapacity = getEffectiveCapacity(stage, totalCapacity);
  if (effectiveCapacity === 0 || avgStageDuration === 0) return Infinity;

  const throughputRate = effectiveCapacity / avgStageDuration;
  return queuePosition / throughputRate;
}

/**
 * Get capacity summary for display
 */
export function getCapacitySummary(controls: ControlInputs): {
  baselineCapacity: number;
  totalCapacity: number;
  additionalFromPmu: number;
  additionalFromAdvisor: number;
  stage4Limit: number;
  stage5AnnualLimit: number;
} {
  const totalCapacity = calculateTotalCapacity(controls);
  const advisorContribution = controls.advisor
    ? ADVISOR_FTE_EQUIV * PARAMETERS.projectsPerFte
    : 0;
  const pmuContribution = controls.pmuAdd * PARAMETERS.projectsPerFte;

  return {
    baselineCapacity: BASELINE_CAPACITY,
    totalCapacity,
    additionalFromPmu: pmuContribution,
    additionalFromAdvisor: advisorContribution,
    stage4Limit: PARAMETERS.stage4Max,
    stage5AnnualLimit: PARAMETERS.stage5MaxAnnual,
  };
}
