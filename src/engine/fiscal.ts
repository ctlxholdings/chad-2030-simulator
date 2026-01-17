/**
 * Chad 2030 Pipeline Simulator - Fiscal Mechanics
 *
 * Implements Section 6 of 02_CALCULATION_LOGIC_SPEC.md
 */

import type {
  ControlInputs,
  StatusLevel,
  Modality,
  AnnualFiscalData,
  SimulationYear,
} from './types';
import { PARAMETERS, SIMULATION_YEARS } from './parameters';

// ============================================================================
// REVENUE CALCULATIONS
// ============================================================================

/**
 * Calculate oil production for a given year
 */
export function calculateOilProduction(year: SimulationYear): number {
  let production = PARAMETERS.fiscal.oilProd2025;

  for (let y = 2025; y < year; y++) {
    const growth = PARAMETERS.fiscal.oilProdGrowth[y] ?? 0;
    production *= 1 + growth;
  }

  return production;
}

/**
 * Calculate oil revenue for a given year
 *
 * OIL_REVENUE = OIL_PRODUCTION × OIL_PRICE × GOV_TAKE_RATE × DAYS_PER_YEAR
 */
export function calculateOilRevenue(
  year: SimulationYear,
  oilPrice: number
): number {
  const production = calculateOilProduction(year);
  const dailyRevenue =
    production * oilPrice * PARAMETERS.fiscal.govTakeRate;
  const annualRevenue = dailyRevenue * PARAMETERS.fiscal.daysPerYear;

  // Convert to USD millions
  return annualRevenue / 1_000_000;
}

/**
 * Calculate non-oil GDP for a given year (in CFAF billions)
 */
export function calculateNonOilGdp(year: SimulationYear): number {
  let gdp = PARAMETERS.fiscal.nonOilGdp2025;

  for (let y = 2025; y < year; y++) {
    const growth = PARAMETERS.fiscal.nonOilGrowth[y] ?? 0.0375;
    gdp *= 1 + growth;
  }

  return gdp;
}

/**
 * Calculate non-oil tax revenue (in USD millions)
 *
 * NON_OIL_REVENUE = NON_OIL_GDP × NON_OIL_TAX_RATE
 */
export function calculateNonOilRevenue(year: SimulationYear): number {
  const nonOilGdp = calculateNonOilGdp(year);
  const taxRate = PARAMETERS.fiscal.nonOilTaxRate[year] ?? 0.089;

  // CFAF billions → USD millions
  const cfafBillions = nonOilGdp * taxRate;
  return cfafBillions / PARAMETERS.fiscal.cfafPerUsd * 1000;
}

/**
 * Calculate donor grants (in USD millions)
 *
 * DONOR_GRANTS = DONOR_BASELINE × DONOR_RATE × NON_OIL_GDP
 */
export function calculateDonorGrants(
  year: SimulationYear,
  donorRate: number
): number {
  const nonOilGdp = calculateNonOilGdp(year);
  const baseline = PARAMETERS.fiscal.donorBaseline[year] ?? 0.018;

  // CFAF billions → USD millions
  const cfafBillions = nonOilGdp * baseline * donorRate;
  return cfafBillions / PARAMETERS.fiscal.cfafPerUsd * 1000;
}

/**
 * Calculate total annual government revenue (USD millions)
 */
export function calculateAnnualRevenue(
  year: SimulationYear,
  controls: ControlInputs
): {
  total: number;
  oil: number;
  nonOil: number;
  donors: number;
} {
  const oilPrice = PARAMETERS.fiscal.oilPrices[controls.oilPrice] ?? 65;
  const oil = calculateOilRevenue(year, oilPrice);
  const nonOil = calculateNonOilRevenue(year);
  const donors = calculateDonorGrants(year, controls.donorRate);

  return {
    total: oil + nonOil + donors,
    oil,
    nonOil,
    donors,
  };
}

// ============================================================================
// FISCAL SPACE CALCULATIONS
// ============================================================================

/**
 * Calculate total GDP for a year (in USD millions)
 */
export function calculateTotalGdp(year: SimulationYear): number {
  // Start with 2025 GDP and apply growth
  let gdpCfaf = PARAMETERS.fiscal.totalGdp2025;

  // Simple growth model based on non-oil GDP growth
  for (let y = 2025; y < year; y++) {
    const growth = PARAMETERS.fiscal.nonOilGrowth[y] ?? 0.0375;
    gdpCfaf *= 1 + growth;
  }

  // Convert CFAF billions to USD millions
  return gdpCfaf / PARAMETERS.fiscal.cfafPerUsd * 1000;
}

/**
 * Calculate co-financing limit (35% of revenue)
 */
export function calculateCofinancingLimit(
  year: SimulationYear,
  controls: ControlInputs
): number {
  const revenue = calculateAnnualRevenue(year, controls);
  return revenue.total * PARAMETERS.fiscal.maxCofinSafe;
}

/**
 * Calculate fixed obligations (wages, interest, transfers)
 * Returns USD millions
 */
export function calculateFixedObligations(year: SimulationYear): number {
  const nonOilGdp = calculateNonOilGdp(year);

  const wages = (PARAMETERS.fiscal.wages[year] ?? 0.06) * nonOilGdp;
  const interest = PARAMETERS.fiscal.interest * nonOilGdp;
  const transfers = PARAMETERS.fiscal.transfers * nonOilGdp;

  // CFAF billions → USD millions
  const totalCfaf = wages + interest + transfers;
  return totalCfaf / PARAMETERS.fiscal.cfafPerUsd * 1000;
}

/**
 * Calculate deficit limit (CEMAC convergence)
 *
 * DEFICIT_LIMIT = REVENUE + (MAX_DEFICIT × GDP) - FIXED_OBLIGATIONS - SOCIAL_FLOOR
 */
export function calculateDeficitLimit(
  year: SimulationYear,
  controls: ControlInputs
): number {
  const revenue = calculateAnnualRevenue(year, controls).total;
  const gdp = calculateTotalGdp(year);
  const fixedObligations = calculateFixedObligations(year);

  // Social floor is % of current spending (approximate)
  const socialFloor = fixedObligations * PARAMETERS.fiscal.socialFloor;

  // Max deficit allows (revenue + deficit allowance - obligations)
  const deficitAllowance = Math.abs(PARAMETERS.fiscal.maxDeficit) * gdp;

  return revenue + deficitAllowance - fixedObligations - socialFloor;
}

/**
 * Calculate contingent liability limit
 */
export function calculateContingentLimit(year: SimulationYear): number {
  const gdp = calculateTotalGdp(year);
  const existingContingent = PARAMETERS.fiscal.contingent2025 * gdp;

  return PARAMETERS.fiscal.maxContingent * gdp - existingContingent;
}

/**
 * Calculate debt headroom
 */
export function calculateDebtHeadroom(year: SimulationYear): number {
  const gdp = calculateTotalGdp(year);
  const currentDebt = PARAMETERS.fiscal.debtGdp2025 * gdp;

  return PARAMETERS.fiscal.debtCeiling * gdp - currentDebt;
}

/**
 * Calculate fiscal space (minimum of all constraints)
 */
export function calculateFiscalSpace(
  year: SimulationYear,
  controls: ControlInputs
): number {
  const cofinLimit = calculateCofinancingLimit(year, controls);
  const deficitLimit = calculateDeficitLimit(year, controls);
  const contingentLimit = calculateContingentLimit(year);
  const debtHeadroom = calculateDebtHeadroom(year);

  return Math.min(cofinLimit, deficitLimit, contingentLimit, debtHeadroom);
}

// ============================================================================
// CO-FINANCING CALCULATIONS
// ============================================================================

/**
 * Calculate co-financing demand for a project by modality
 *
 * COFIN_DEMAND = CAPEX × COFIN_RATE[modality]
 */
export function calculateCofinancingDemand(
  capexUsdM: number,
  modality: Modality
): number {
  return capexUsdM * PARAMETERS.modalities[modality].cofinancingRate;
}

/**
 * Calculate contingent liability from a project
 */
export function calculateContingentLiability(
  capexUsdM: number,
  modality: Modality
): number {
  return capexUsdM * PARAMETERS.modalities[modality].contingentLiabilityRate;
}

// ============================================================================
// FISCAL STATUS
// ============================================================================

/**
 * Calculate debt ratio for a year
 */
export function calculateDebtRatio(
  year: SimulationYear,
  newBorrowing: number = 0
): number {
  const gdp = calculateTotalGdp(year);
  const baseDebt = PARAMETERS.fiscal.debtGdp2025 * calculateTotalGdp(2025);

  return (baseDebt + newBorrowing) / gdp;
}

/**
 * Determine fiscal status based on fiscal ratio
 */
export function getFiscalStatus(
  cofinDemand: number,
  fiscalSpace: number
): StatusLevel {
  if (fiscalSpace <= 0) return 'RED';

  const ratio = cofinDemand / fiscalSpace;
  const { green, yellow } = PARAMETERS.fiscalThresholds;

  if (ratio <= green) {
    return 'GREEN';
  } else if (ratio <= yellow) {
    return 'YELLOW';
  } else {
    return 'RED';
  }
}

/**
 * Determine debt status
 */
export function getDebtStatus(debtRatio: number): StatusLevel {
  if (debtRatio >= PARAMETERS.fiscal.debtCeiling) {
    return 'RED';
  } else if (debtRatio >= PARAMETERS.fiscal.debtWarning) {
    return 'YELLOW';
  } else {
    return 'GREEN';
  }
}

/**
 * Get combined fiscal status (worst of flow and debt)
 */
export function getCombinedFiscalStatus(
  flowStatus: StatusLevel,
  debtStatus: StatusLevel
): StatusLevel {
  const statusOrder: StatusLevel[] = ['GREEN', 'YELLOW', 'RED'];
  const flowIndex = statusOrder.indexOf(flowStatus);
  const debtIndex = statusOrder.indexOf(debtStatus);

  return statusOrder[Math.max(flowIndex, debtIndex)]!;
}

// ============================================================================
// FULL FISCAL PROJECTION
// ============================================================================

/**
 * Generate full fiscal projection for all simulation years
 */
export function generateFiscalProjection(
  controls: ControlInputs,
  cofinByYear: Record<number, number>
): AnnualFiscalData[] {
  const projection: AnnualFiscalData[] = [];

  for (const year of SIMULATION_YEARS) {
    const revenue = calculateAnnualRevenue(year, controls);
    const fiscalSpace = calculateFiscalSpace(year, controls);
    const cofinDemand = cofinByYear[year] ?? 0;
    const debtRatio = calculateDebtRatio(year);
    const nopdTarget = PARAMETERS.fiscal.nopdTargets[year] ?? -0.05;

    // Calculate NOPD actual (simplified)
    const nonOilGdpUsd = calculateNonOilGdp(year) / PARAMETERS.fiscal.cfafPerUsd * 1000;
    const nonOilSpending = calculateFixedObligations(year) + cofinDemand;
    const nopdActual = (nonOilSpending - revenue.nonOil) / nonOilGdpUsd;

    const flowStatus = getFiscalStatus(cofinDemand, fiscalSpace);
    const debtStatus = getDebtStatus(debtRatio);
    const fiscalStatus = getCombinedFiscalStatus(flowStatus, debtStatus);

    projection.push({
      year,
      revenue: revenue.total,
      oilRevenue: revenue.oil,
      nonOilRevenue: revenue.nonOil,
      donorGrants: revenue.donors,
      fiscalSpace,
      cofinancingDemand: cofinDemand,
      debtRatio,
      nopdActual,
      nopdTarget,
      fiscalStatus,
    });
  }

  return projection;
}

/**
 * Find the first year where fiscal breach occurs
 */
export function findBreachYear(
  fiscalProjection: AnnualFiscalData[]
): { year: number | null; reason: string | null } {
  for (const data of fiscalProjection) {
    if (data.fiscalStatus === 'RED') {
      const reasons: string[] = [];

      if (data.cofinancingDemand > data.fiscalSpace) {
        reasons.push('co-financing exceeds fiscal space');
      }
      if (data.debtRatio >= PARAMETERS.fiscal.debtCeiling) {
        reasons.push('debt ceiling breached');
      }

      return {
        year: data.year,
        reason: reasons.join('; ') || 'fiscal limit exceeded',
      };
    }
  }

  return { year: null, reason: null };
}
