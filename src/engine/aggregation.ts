/**
 * Chad 2030 Pipeline Simulator - Aggregation Rules
 *
 * Implements Section 7 of 02_CALCULATION_LOGIC_SPEC.md
 */

import type {
  Modality,
  ControlInputs,
  GateNumber,
  StageNumber,
  AnnualPipelineData,
} from './types';
import { PARAMETERS, SIMULATION_YEARS, ACTIVE_GATES, ACTIVE_STAGES } from './parameters';
import { calculateCofinancingDemand, calculateContingentLiability } from './fiscal';

// ============================================================================
// FID CALCULATIONS
// ============================================================================

export interface FidDistribution {
  total: number;
  byYear: Record<number, number>;
  byModality: Record<Modality, number>;
}

/**
 * Distribute FIDs across years based on pipeline timing
 *
 * Simple model: Projects flow through at a rate determined by duration,
 * with FIDs concentrated in later years as pipeline matures.
 */
export function distributeFidsAcrossYears(
  totalFids: number,
  avgDurationMonths: number,
  startYear: number = 2025
): Record<number, number> {
  const result: Record<number, number> = {};
  for (const year of SIMULATION_YEARS) {
    result[year] = 0;
  }

  // No FIDs in first year (projects still in pipeline)
  // Projects start completing when avgDuration has passed
  const avgDurationYears = avgDurationMonths / 12;
  const firstFidYear = Math.ceil(startYear + avgDurationYears);

  // Remaining years for FID distribution
  const remainingYears = SIMULATION_YEARS.filter((y) => y >= firstFidYear);

  if (remainingYears.length === 0) {
    // All FIDs in last year if duration is very long
    result[2030] = totalFids;
    return result;
  }

  // Distribute with ramp-up pattern (more FIDs in later years)
  const weights = remainingYears.map((_, i) => i + 1);
  const totalWeight = weights.reduce((a, b) => a + b, 0);

  let allocated = 0;
  for (let i = 0; i < remainingYears.length; i++) {
    const year = remainingYears[i]!;
    const weight = weights[i]!;
    const fidsThisYear = Math.round((weight / totalWeight) * totalFids);
    result[year] = fidsThisYear;
    allocated += fidsThisYear;
  }

  // Adjust for rounding
  const lastYear = remainingYears[remainingYears.length - 1];
  if (lastYear !== undefined && result[lastYear] !== undefined) {
    result[lastYear] += totalFids - allocated;
  }

  return result;
}

/**
 * Distribute FIDs by modality based on modality split
 */
export function distributeFidsByModality(
  totalFids: number,
  controls: ControlInputs
): Record<Modality, number> {
  const govLed = Math.round(totalFids * (controls.pctGovLed / 100));
  const ppp = Math.round(totalFids * (controls.pctPPP / 100));
  const fullyPrivate = totalFids - govLed - ppp; // Remainder to avoid rounding issues

  return {
    GOV_LED: govLed,
    PPP: ppp,
    FULLY_PRIVATE: Math.max(0, fullyPrivate),
  };
}

// ============================================================================
// INVESTMENT CALCULATIONS
// ============================================================================

export interface InvestmentBreakdown {
  total: number; // Total investment mobilized
  private: number; // Private capital
  govCofinancing: number; // Government co-financing
  byModality: Record<Modality, number>;
  contingentLiabilities: number;
}

/**
 * Calculate investment mobilized from FIDs
 */
export function calculateInvestmentMobilized(
  fids: number,
  controls: ControlInputs
): InvestmentBreakdown {
  const avgCapex = PARAMETERS.init.capexAvg;
  const totalInvestment = fids * avgCapex;

  // Distribute by modality
  const fidsByModality = distributeFidsByModality(fids, controls);

  const investmentByModality: Record<Modality, number> = {
    GOV_LED: fidsByModality.GOV_LED * avgCapex,
    PPP: fidsByModality.PPP * avgCapex,
    FULLY_PRIVATE: fidsByModality.FULLY_PRIVATE * avgCapex,
  };

  // Calculate co-financing
  let govCofinancing = 0;
  let contingentLiabilities = 0;

  for (const modality of ['GOV_LED', 'PPP', 'FULLY_PRIVATE'] as Modality[]) {
    const investment = investmentByModality[modality];
    govCofinancing += calculateCofinancingDemand(investment, modality);
    contingentLiabilities += calculateContingentLiability(investment, modality);
  }

  return {
    total: totalInvestment,
    private: totalInvestment - govCofinancing,
    govCofinancing,
    byModality: investmentByModality,
    contingentLiabilities,
  };
}

/**
 * Distribute co-financing demand across years based on FID timing
 */
export function distributeCofinancingByYear(
  fidsByYear: Record<number, number>,
  controls: ControlInputs
): Record<number, number> {
  const result: Record<number, number> = {};

  for (const year of SIMULATION_YEARS) {
    const fidsThisYear = fidsByYear[year] ?? 0;
    if (fidsThisYear > 0) {
      const investment = calculateInvestmentMobilized(fidsThisYear, controls);
      result[year] = investment.govCofinancing;
    } else {
      result[year] = 0;
    }
  }

  return result;
}

// ============================================================================
// DROP CALCULATIONS
// ============================================================================

export interface DropStatistics {
  total: number;
  byGate: Record<GateNumber, number>;
}

/**
 * Calculate expected drops at each gate
 */
export function calculateDropsByGate(
  nActive: number,
  gatePassRates: Record<GateNumber, number>
): DropStatistics {
  const byGate: Record<GateNumber, number> = {
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
  };

  let surviving = nActive;

  for (const gate of ACTIVE_GATES) {
    const passRate = gatePassRates[gate];
    const passing = surviving * passRate;
    const dropping = surviving - passing;

    byGate[gate] = Math.round(dropping);
    surviving = passing;
  }

  const total = Object.values(byGate).reduce((a, b) => a + b, 0);

  return { total, byGate };
}

// ============================================================================
// TIME CALCULATIONS
// ============================================================================

/**
 * Calculate average time to FID for successful projects
 */
export function calculateAverageTimeToFid(
  stageDurations: Record<StageNumber, number>
): number {
  let total = 0;
  for (const stage of ACTIVE_STAGES) {
    total += stageDurations[stage];
  }
  return total;
}

// ============================================================================
// PREPARATION COST CALCULATIONS
// ============================================================================

export interface PreparationCostBreakdown {
  total: number; // USD millions
  byModality: Record<Modality, number>;
  fidProjects: number;
  droppedProjects: number;
}

/**
 * Calculate total preparation cost
 *
 * PREP_COST = Σ STAGE_COST[p, s] for all projects and completed stages
 */
export function calculatePreparationCost(
  fids: number,
  drops: DropStatistics,
  controls: ControlInputs
): PreparationCostBreakdown {
  // FID projects complete all stages
  const fidsByModality = distributeFidsByModality(fids, controls);

  const costByModality: Record<Modality, number> = {
    GOV_LED: 0,
    PPP: 0,
    FULLY_PRIVATE: 0,
  };

  // Cost for successful projects (all stages)
  for (const modality of ['GOV_LED', 'PPP', 'FULLY_PRIVATE'] as Modality[]) {
    const nProjects = fidsByModality[modality];
    let totalCost = 0;

    for (const stage of ACTIVE_STAGES) {
      totalCost += PARAMETERS.stageCosts[modality][stage];
    }

    costByModality[modality] = nProjects * totalCost / 1000; // Convert to millions
  }

  // Cost for dropped projects (partial stages)
  // Simplified: assume drops complete on average half the stages
  const avgStagesCompleted = 2.5;
  const droppedCost = drops.total * avgStagesCompleted * 100 / 1000; // Rough estimate

  const fidCost = Object.values(costByModality).reduce((a, b) => a + b, 0);

  return {
    total: fidCost + droppedCost,
    byModality: costByModality,
    fidProjects: fids,
    droppedProjects: drops.total,
  };
}

// ============================================================================
// PIPELINE DATA BY YEAR
// ============================================================================

/**
 * Generate annual pipeline data
 */
export function generatePipelineData(
  totalFids: number,
  totalDrops: number,
  nActive: number,
  avgDuration: number,
  controls: ControlInputs
): AnnualPipelineData[] {
  const fidsByYear = distributeFidsAcrossYears(totalFids, avgDuration);
  const data: AnnualPipelineData[] = [];

  let cumulativeFids = 0;
  let cumulativeDrops = 0;

  for (const year of SIMULATION_YEARS) {
    const fidsThisYear = fidsByYear[year] ?? 0;
    cumulativeFids += fidsThisYear;

    // Distribute drops proportionally
    const dropRate = totalDrops / totalFids || 0;
    const dropsThisYear = Math.round(fidsThisYear * dropRate);
    cumulativeDrops += dropsThisYear;

    // In-flight = activated - completed - dropped
    const inFlight = Math.max(0, nActive - cumulativeFids - cumulativeDrops);

    // Investment
    const investment = calculateInvestmentMobilized(fidsThisYear, controls);

    data.push({
      year,
      fids: fidsThisYear,
      cumulativeFids,
      dropped: dropsThisYear,
      inFlight,
      investmentMobilized: investment.total,
      privateCapital: investment.private,
      govCofinancing: investment.govCofinancing,
    });
  }

  return data;
}
