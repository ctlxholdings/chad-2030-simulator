/**
 * Chad 2030 Pipeline Simulator - Type Definitions
 *
 * This file defines all TypeScript interfaces for the simulation engine.
 * Based on 01_CONCEPTUAL_MODEL_SPEC.md
 */

// ============================================================================
// ENUMS
// ============================================================================

/** Project execution modality */
export type Modality = 'GOV_LED' | 'PPP' | 'FULLY_PRIVATE';

/** Project priority tier (1 = highest priority) */
export type Tier = 1 | 2 | 3;

/** Project lifecycle state */
export type ProjectState =
  | 'NOT_STARTED'
  | 'IN_STAGE_2'
  | 'IN_STAGE_3'
  | 'IN_STAGE_4'
  | 'IN_STAGE_5'
  | 'IN_STAGE_6'
  | 'AT_GATE_2'
  | 'AT_GATE_3'
  | 'AT_GATE_4'
  | 'AT_GATE_5'
  | 'AT_GATE_6'
  | 'DROPPED'
  | 'FID_ACHIEVED';

/** Fiscal/Capacity status indicator */
export type StatusLevel = 'GREEN' | 'YELLOW' | 'RED';

/** Political risk level */
export type RiskLevel = 'LOW' | 'MED' | 'HIGH';

/** Oil price scenario */
export type OilPriceScenario = 50 | 55 | 65 | 67 | 75;

/** Sector classification */
export type Sector =
  | 'Energy'
  | 'Transport'
  | 'Water'
  | 'Digital'
  | 'Agriculture'
  | 'Mining'
  | 'Health'
  | 'Education'
  | 'Tourism'
  | 'Manufacturing'
  | 'Other';

/** Stage number (2-6 are actively modeled) */
export type StageNumber = 2 | 3 | 4 | 5 | 6;

/** Gate number (2-6 are actively modeled) */
export type GateNumber = 2 | 3 | 4 | 5 | 6;

// ============================================================================
// PROJECT ENTITY
// ============================================================================

/** A project in the pipeline (immutable attributes) */
export interface Project {
  id: string;
  name: string;
  sector: Sector;
  tier: Tier;
  valueUsdM: number; // Total project cost in millions USD
  modality: Modality | null; // Null until assigned at Gate 2
  hasChampion: boolean;
}

/** Runtime state of a project during simulation */
export interface ProjectRuntime {
  projectId: string;
  state: ProjectState;
  timeInStage: number; // Months spent in current stage
  modality: Modality | null; // Locked at Gate 2
  fidYear: number | null; // Year FID achieved (if any)
  dropGate: GateNumber | null; // Gate where dropped (if dropped)
}

// ============================================================================
// USER CONTROLS (INPUTS)
// ============================================================================

/** All user-adjustable parameters */
export interface ControlInputs {
  // Interventions
  advisor: boolean; // Transaction advisor enabled
  advisorMonths: number; // Duration of advisor engagement (12-24)
  pmuAdd: number; // Additional PMU staff (0-15)
  nChampion: number; // Number of championed projects (0-20)

  // Portfolio
  nActive: number; // Projects to activate (20-268)
  pctGovLed: number; // % gov-led modality (0-100)
  pctPPP: number; // % PPP modality (0-100)
  pctPrivate: number; // % fully private modality (0-100)

  // Assumptions
  oilPrice: OilPriceScenario; // Oil price scenario
  donorRate: number; // Donor realization rate (0.5-0.9)
  politicalRisk: RiskLevel; // Political stability
}

/** Default control values */
export const DEFAULT_CONTROLS: ControlInputs = {
  advisor: false,
  advisorMonths: 18,
  pmuAdd: 0,
  nChampion: 0,
  nActive: 50,
  pctGovLed: 40,
  pctPPP: 40,
  pctPrivate: 20,
  oilPrice: 65,
  donorRate: 0.7,
  politicalRisk: 'MED',
};

// ============================================================================
// SIMULATION OUTPUTS
// ============================================================================

/** Annual fiscal data */
export interface AnnualFiscalData {
  year: number;
  revenue: number; // Total government revenue (USD millions)
  oilRevenue: number;
  nonOilRevenue: number;
  donorGrants: number;
  fiscalSpace: number; // Max co-financing allowed
  cofinancingDemand: number; // Co-financing required by FIDs
  debtRatio: number; // Public debt / GDP
  nopdActual: number; // Non-oil primary deficit / non-oil GDP
  nopdTarget: number; // Target NOPD
  fiscalStatus: StatusLevel;
}

/** Annual pipeline data */
export interface AnnualPipelineData {
  year: number;
  fids: number; // FIDs achieved this year
  cumulativeFids: number;
  dropped: number; // Projects dropped this year
  inFlight: number; // Projects still in pipeline
  investmentMobilized: number; // USD millions
  privateCapital: number; // USD millions
  govCofinancing: number; // USD millions
}

/** Complete simulation outputs */
export interface SimulationOutputs {
  // Primary metrics (always visible)
  nFid: number; // Total FIDs achieved
  investmentTotal: number; // Total investment mobilized (USD millions)
  investmentPrivate: number; // Private capital mobilized
  cofinancingTotal: number; // Total gov co-financing required
  fiscalStatus: StatusLevel; // Overall fiscal status

  // Secondary metrics
  nDropped: number; // Total projects dropped
  avgTimeToFid: number; // Average months from Stage 2 to FID
  prepCost: number; // Total preparation cost (USD millions)

  // Detailed data by year
  fiscalByYear: AnnualFiscalData[];
  pipelineByYear: AnnualPipelineData[];

  // Drop statistics by gate
  dropsByGate: Record<GateNumber, number>;

  // Investment by modality
  investmentByModality: Record<Modality, number>;

  // Capacity status
  capacityStatus: StatusLevel;
  peakLoadRatio: number;

  // Breach info
  breachYear: number | null; // Year fiscal breach occurs (if any)
  breachReason: string | null;

  // Validation
  isWithinBounds: boolean; // True if results within expected ranges
  boundsWarning: string | null;
}

// ============================================================================
// SCENARIO
// ============================================================================

/** A saved scenario configuration */
export interface SavedScenario {
  id: string;
  name: string;
  createdAt: string; // ISO timestamp
  controls: ControlInputs;
  outputs: SimulationOutputs;
  isPreset: boolean; // True for built-in presets
}

// ============================================================================
// SIMULATION PARAMETERS (CONSTANTS)
// ============================================================================

/** Stage duration configuration */
export interface StageDuration {
  baseDuration: number; // Base duration in months
  stdDev: number; // Standard deviation for Monte Carlo
}

/** Gate pass rate configuration */
export interface GatePassRate {
  baseRate: number; // Base pass rate (0-1)
  floor: number; // Minimum rate
  ceiling: number; // Maximum rate
}

/** Modality modifier configuration */
export interface ModalityModifiers {
  durationMultipliers: Record<StageNumber, number>;
  passRateAdjustments: Record<GateNumber, number>;
  cofinancingRate: number;
  contingentLiabilityRate: number;
}

/** Complete parameter configuration */
export interface SimulationParameters {
  // Initial conditions
  init: {
    nProjects: number;
    capexTotal: number;
    capexAvg: number;
    capexMin: number;
    capexMax: number;
    nTier1: number;
    nTier2: number;
    nTier3: number;
    startYear: number;
    endYear: number;
    durationMonths: number;
  };

  // Stage durations
  stages: Record<StageNumber, StageDuration>;

  // Gate pass rates
  gates: Record<GateNumber, GatePassRate>;

  // Modality modifiers
  modalities: Record<Modality, ModalityModifiers>;

  // Intervention modifiers
  advisorDurationMod: Record<StageNumber, number>;
  advisorLiftMod: Record<GateNumber, number>;
  pmuMaxDurationReduction: Record<StageNumber, number>;
  pmuMaxLiftMod: Record<GateNumber, number>;
  championDurationReduction: number;
  championLift: number;

  // Political risk modifiers
  riskDurationMod: Record<RiskLevel, Record<StageNumber, number>>;
  riskPassPenalty: Record<RiskLevel, Record<GateNumber, number>>;

  // Capacity
  pmuBase: number;
  projectsPerFte: number;
  stage4Max: number;
  stage5MaxAnnual: number;
  capacityThresholds: { green: number; yellow: number; red: number };
  capacityPenalties: {
    durationYellow: number;
    durationRed: number;
    passYellow: number;
    passRed: number;
  };

  // Fiscal
  fiscal: {
    oilProd2025: number;
    oilProdGrowth: Record<number, number>; // Year -> growth rate
    govTakeRate: number;
    daysPerYear: number;
    oilPrices: Record<OilPriceScenario, number>;
    nonOilGdp2025: number;
    nonOilGrowth: Record<number, number>; // Year -> growth rate
    nonOilTaxRate: Record<number, number>; // Year -> tax rate
    totalGdp2025: number;
    cfafPerUsd: number;
    maxCofinSafe: number;
    maxCofinBreach: number;
    maxDeficit: number;
    maxContingent: number;
    debtCeiling: number;
    debtWarning: number;
    nopdTargets: Record<number, number>; // Year -> target
    donorBaseline: Record<number, number>; // Year -> baseline %
    wages: Record<number, number>; // Year -> % of non-oil GDP
    interest: number;
    transfers: number;
    socialFloor: number;
    contingent2025: number;
    debtGdp2025: number;
  };

  // Stage costs
  stageCosts: Record<Modality, Record<StageNumber, number>>; // USD thousands

  // Expected outcome bounds
  bounds: {
    fidBaselineMin: number;
    fidBaselineMax: number;
    fidAdvMin: number;
    fidAdvMax: number;
    fidAdvPmuMin: number;
    fidAdvPmuMax: number;
    fidOptMin: number;
    fidOptMax: number;
    timeBaselineMin: number;
    timeBaselineMax: number;
    timeOptMin: number;
    timeOptMax: number;
    invMax: number;
  };

  // Fiscal thresholds for status
  fiscalThresholds: { green: number; yellow: number; red: number };
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/** Year range for the simulation */
export type SimulationYear = 2025 | 2026 | 2027 | 2028 | 2029 | 2030;

/** Result of a simulation run */
export interface SimulationResult {
  outputs: SimulationOutputs;
  projectStates: ProjectRuntime[];
  executionTimeMs: number;
}

/** Comparison data for scenarios */
export interface ScenarioComparison {
  scenarios: SavedScenario[];
  metrics: Array<{
    label: string;
    key: keyof SimulationOutputs;
    format: 'number' | 'currency' | 'percent' | 'status' | 'months';
  }>;
}
