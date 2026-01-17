/**
 * Simulation engine tests
 *
 * Verifies calculations match expected bounds from Parameter Dictionary
 */

import { describe, it, expect } from 'vitest';
import { runSimulation } from '../../src/engine/simulation';
import { DEFAULT_CONTROLS } from '../../src/engine/types';
import type { ControlInputs } from '../../src/engine/types';

describe('Simulation Engine', () => {
  describe('Baseline Scenario', () => {
    it('should produce FIDs within expected range (85-95)', () => {
      const result = runSimulation(DEFAULT_CONTROLS);

      expect(result.outputs.nFid).toBeGreaterThanOrEqual(85);
      expect(result.outputs.nFid).toBeLessThanOrEqual(95);
    });

    it('should produce investment within portfolio limits', () => {
      const result = runSimulation(DEFAULT_CONTROLS);

      expect(result.outputs.investmentTotal).toBeGreaterThan(0);
      expect(result.outputs.investmentTotal).toBeLessThanOrEqual(20500);
    });

    it('should have valid fiscal status', () => {
      const result = runSimulation(DEFAULT_CONTROLS);

      expect(['GREEN', 'YELLOW', 'RED']).toContain(result.outputs.fiscalStatus);
    });
  });

  describe('With Advisor', () => {
    const advisorControls: ControlInputs = {
      ...DEFAULT_CONTROLS,
      advisor: true,
    };

    it('should produce more FIDs than baseline (130-140)', () => {
      const result = runSimulation(advisorControls);

      expect(result.outputs.nFid).toBeGreaterThanOrEqual(130);
      expect(result.outputs.nFid).toBeLessThanOrEqual(140);
    });

    it('should reduce average time to FID', () => {
      const baseline = runSimulation(DEFAULT_CONTROLS);
      const withAdvisor = runSimulation(advisorControls);

      expect(withAdvisor.outputs.avgTimeToFid).toBeLessThan(
        baseline.outputs.avgTimeToFid
      );
    });
  });

  describe('Optimized Scenario', () => {
    const optimizedControls: ControlInputs = {
      ...DEFAULT_CONTROLS,
      advisor: true,
      pmuAdd: 15,
      nChampion: 20,
      pctGovLed: 40,
      pctPPP: 50,
      pctPrivate: 10,
    };

    it('should produce FIDs near upper bound (160-180)', () => {
      const result = runSimulation(optimizedControls);

      expect(result.outputs.nFid).toBeGreaterThanOrEqual(160);
      expect(result.outputs.nFid).toBeLessThanOrEqual(180);
    });

    it('should have faster time to FID than baseline', () => {
      const baseline = runSimulation(DEFAULT_CONTROLS);
      const optimized = runSimulation(optimizedControls);

      expect(optimized.outputs.avgTimeToFid).toBeLessThan(
        baseline.outputs.avgTimeToFid
      );
    });
  });

  describe('Oil Price Impact', () => {
    it('should worsen fiscal status with low oil price', () => {
      const lowOilControls: ControlInputs = {
        ...DEFAULT_CONTROLS,
        oilPrice: 50,
      };

      const baseResult = runSimulation(DEFAULT_CONTROLS);
      const lowOilResult = runSimulation(lowOilControls);

      // Fiscal status should be same or worse
      const statusOrder = { GREEN: 0, YELLOW: 1, RED: 2 };
      expect(statusOrder[lowOilResult.outputs.fiscalStatus]).toBeGreaterThanOrEqual(
        statusOrder[baseResult.outputs.fiscalStatus]
      );
    });
  });

  describe('Modality Impact', () => {
    it('should reduce co-financing with PPP-heavy mix', () => {
      const govLedHeavy: ControlInputs = {
        ...DEFAULT_CONTROLS,
        pctGovLed: 90,
        pctPPP: 8,
        pctPrivate: 2,
      };

      const pppHeavy: ControlInputs = {
        ...DEFAULT_CONTROLS,
        pctGovLed: 20,
        pctPPP: 70,
        pctPrivate: 10,
      };

      const govResult = runSimulation(govLedHeavy);
      const pppResult = runSimulation(pppHeavy);

      // PPP-heavy should have lower co-financing ratio
      const govCofinRatio =
        govResult.outputs.cofinancingTotal / govResult.outputs.investmentTotal;
      const pppCofinRatio =
        pppResult.outputs.cofinancingTotal / pppResult.outputs.investmentTotal;

      expect(pppCofinRatio).toBeLessThan(govCofinRatio);
    });
  });

  describe('Execution Performance', () => {
    it('should complete calculation in under 50ms', () => {
      const result = runSimulation(DEFAULT_CONTROLS);

      expect(result.executionTimeMs).toBeLessThan(50);
    });
  });

  describe('Output Consistency', () => {
    it('should produce deterministic results', () => {
      const result1 = runSimulation(DEFAULT_CONTROLS);
      const result2 = runSimulation(DEFAULT_CONTROLS);

      expect(result1.outputs.nFid).toBe(result2.outputs.nFid);
      expect(result1.outputs.investmentTotal).toBe(result2.outputs.investmentTotal);
    });

    it('should have consistent data across years', () => {
      const result = runSimulation(DEFAULT_CONTROLS);

      const totalFidsFromYears = result.outputs.pipelineByYear.reduce(
        (sum, year) => sum + year.fids,
        0
      );

      expect(totalFidsFromYears).toBe(result.outputs.nFid);
    });

    it('should have non-negative values', () => {
      const result = runSimulation(DEFAULT_CONTROLS);

      expect(result.outputs.nFid).toBeGreaterThanOrEqual(0);
      expect(result.outputs.investmentTotal).toBeGreaterThanOrEqual(0);
      expect(result.outputs.cofinancingTotal).toBeGreaterThanOrEqual(0);
      expect(result.outputs.nDropped).toBeGreaterThanOrEqual(0);
      expect(result.outputs.avgTimeToFid).toBeGreaterThan(0);
    });
  });
});
