/**
 * Preset scenarios for quick start
 */

import type { ControlInputs, SavedScenario } from '../engine/types';
import { DEFAULT_CONTROLS } from '../engine/types';
import { runSimulation } from '../engine/simulation';

// Preset configurations
const PRESET_CONFIGS: Array<{
  name: string;
  description: string;
  controls: Partial<ControlInputs>;
}> = [
  {
    name: 'Baseline (DIY)',
    description: 'Default configuration with no interventions',
    controls: {
      advisor: false,
      pmuAdd: 0,
      nChampion: 0,
    },
  },
  {
    name: 'With Advisor',
    description: 'Transaction advisor enabled',
    controls: {
      advisor: true,
      pmuAdd: 0,
      nChampion: 0,
    },
  },
  {
    name: 'Max Capacity',
    description: 'Full resources: Advisor + PMU + Champions',
    controls: {
      advisor: true,
      pmuAdd: 15,
      nChampion: 20,
    },
  },
  {
    name: 'Fiscal Safe',
    description: 'PPP-heavy modality to stay green',
    controls: {
      advisor: true,
      pctGovLed: 40,
      pctPPP: 50,
      pctPrivate: 10,
    },
  },
  {
    name: 'Oil Shock',
    description: 'Stress test at $50/bbl',
    controls: {
      oilPrice: 50,
    },
  },
];

/**
 * Generate preset scenarios with computed outputs
 */
export function generatePresets(): SavedScenario[] {
  return PRESET_CONFIGS.map((config, index) => {
    const controls: ControlInputs = {
      ...DEFAULT_CONTROLS,
      ...config.controls,
    };

    const result = runSimulation(controls);

    return {
      id: `preset_${index}`,
      name: config.name,
      createdAt: new Date(0).toISOString(), // Epoch for presets
      controls,
      outputs: result.outputs,
      isPreset: true,
    };
  });
}

/**
 * Get preset by name
 */
export function getPresetByName(name: string): SavedScenario | undefined {
  const presets = generatePresets();
  return presets.find((p) => p.name === name);
}
