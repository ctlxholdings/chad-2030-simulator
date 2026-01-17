/**
 * Chad 2030 Pipeline Simulator - Global State Context
 *
 * Provides simulation state to all components
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import type {
  ControlInputs,
  SimulationOutputs,
  SavedScenario,
} from '../engine/types';
import { DEFAULT_CONTROLS } from '../engine/types';
import { runSimulation } from '../engine/simulation';

// ============================================================================
// STATE TYPES
// ============================================================================

interface SimulationState {
  controls: ControlInputs;
  outputs: SimulationOutputs | null;
  scenarios: SavedScenario[];
  isCalculating: boolean;
  lastCalculationTime: number;
  error: string | null;
}

type SimulationAction =
  | { type: 'SET_CONTROLS'; payload: Partial<ControlInputs> }
  | { type: 'SET_OUTPUTS'; payload: SimulationOutputs }
  | { type: 'SET_CALCULATING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SAVE_SCENARIO'; payload: SavedScenario }
  | { type: 'DELETE_SCENARIO'; payload: string }
  | { type: 'LOAD_SCENARIO'; payload: SavedScenario }
  | { type: 'LOAD_SCENARIOS'; payload: SavedScenario[] };

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: SimulationState = {
  controls: DEFAULT_CONTROLS,
  outputs: null,
  scenarios: [],
  isCalculating: false,
  lastCalculationTime: 0,
  error: null,
};

// ============================================================================
// REDUCER
// ============================================================================

function simulationReducer(
  state: SimulationState,
  action: SimulationAction
): SimulationState {
  switch (action.type) {
    case 'SET_CONTROLS':
      return {
        ...state,
        controls: { ...state.controls, ...action.payload },
        error: null,
      };

    case 'SET_OUTPUTS':
      return {
        ...state,
        outputs: action.payload,
        isCalculating: false,
        lastCalculationTime: performance.now(),
      };

    case 'SET_CALCULATING':
      return {
        ...state,
        isCalculating: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isCalculating: false,
      };

    case 'SAVE_SCENARIO':
      // Max 4 user scenarios (excluding presets)
      const userScenarios = state.scenarios.filter((s) => !s.isPreset);
      if (userScenarios.length >= 4) {
        return state; // Don't save if at limit
      }
      return {
        ...state,
        scenarios: [...state.scenarios, action.payload],
      };

    case 'DELETE_SCENARIO':
      return {
        ...state,
        scenarios: state.scenarios.filter((s) => s.id !== action.payload),
      };

    case 'LOAD_SCENARIO':
      return {
        ...state,
        controls: action.payload.controls,
      };

    case 'LOAD_SCENARIOS':
      return {
        ...state,
        scenarios: action.payload,
      };

    default:
      return state;
  }
}

// ============================================================================
// CONTEXT
// ============================================================================

interface SimulationContextValue {
  state: SimulationState;
  updateControls: (controls: Partial<ControlInputs>) => void;
  saveScenario: (name: string) => void;
  deleteScenario: (id: string) => void;
  loadScenario: (scenario: SavedScenario) => void;
  resetToDefaults: () => void;
}

const SimulationContext = createContext<SimulationContextValue | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

const STORAGE_KEY = 'chad2030_scenarios';

export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(simulationReducer, initialState);

  // Load saved scenarios from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const scenarios = JSON.parse(saved) as SavedScenario[];
        dispatch({ type: 'LOAD_SCENARIOS', payload: scenarios });
      }
    } catch (e) {
      console.error('Failed to load scenarios:', e);
    }
  }, []);

  // Save scenarios to localStorage when they change
  useEffect(() => {
    try {
      // Only save user scenarios, not presets
      const userScenarios = state.scenarios.filter((s) => !s.isPreset);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userScenarios));
    } catch (e) {
      console.error('Failed to save scenarios:', e);
    }
  }, [state.scenarios]);

  // Run simulation when controls change
  useEffect(() => {
    const runSim = async () => {
      dispatch({ type: 'SET_CALCULATING', payload: true });

      try {
        // Small delay to allow UI to update with loading state
        await new Promise((resolve) => setTimeout(resolve, 10));

        const result = runSimulation(state.controls);
        dispatch({ type: 'SET_OUTPUTS', payload: result.outputs });
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Simulation failed';
        dispatch({ type: 'SET_ERROR', payload: message });
      }
    };

    runSim();
  }, [state.controls]);

  // Actions
  const updateControls = useCallback((controls: Partial<ControlInputs>) => {
    // Normalize modality percentages if needed
    const normalized = normalizeModalityPercentages(controls);
    dispatch({ type: 'SET_CONTROLS', payload: normalized });
  }, []);

  const saveScenario = useCallback(
    (name: string) => {
      if (!state.outputs) return;

      const scenario: SavedScenario = {
        id: `scenario_${Date.now()}`,
        name,
        createdAt: new Date().toISOString(),
        controls: { ...state.controls },
        outputs: state.outputs,
        isPreset: false,
      };

      dispatch({ type: 'SAVE_SCENARIO', payload: scenario });
    },
    [state.controls, state.outputs]
  );

  const deleteScenario = useCallback((id: string) => {
    dispatch({ type: 'DELETE_SCENARIO', payload: id });
  }, []);

  const loadScenario = useCallback((scenario: SavedScenario) => {
    dispatch({ type: 'LOAD_SCENARIO', payload: scenario });
  }, []);

  const resetToDefaults = useCallback(() => {
    dispatch({ type: 'SET_CONTROLS', payload: DEFAULT_CONTROLS });
  }, []);

  const value = useMemo(
    () => ({
      state,
      updateControls,
      saveScenario,
      deleteScenario,
      loadScenario,
      resetToDefaults,
    }),
    [state, updateControls, saveScenario, deleteScenario, loadScenario, resetToDefaults]
  );

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useSimulation() {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Normalize modality percentages to sum to 100%
 */
function normalizeModalityPercentages(
  controls: Partial<ControlInputs>
): Partial<ControlInputs> {
  const { pctGovLed, pctPPP, pctPrivate } = controls;

  // If none are being updated, return as-is
  if (pctGovLed === undefined && pctPPP === undefined && pctPrivate === undefined) {
    return controls;
  }

  // Calculate current total
  const govLed = pctGovLed ?? 0;
  const ppp = pctPPP ?? 0;
  const priv = pctPrivate ?? 0;
  const total = govLed + ppp + priv;

  // If already at 100%, return as-is
  if (Math.abs(total - 100) < 0.01) {
    return controls;
  }

  // Normalize to 100%
  if (total > 0) {
    return {
      ...controls,
      pctGovLed: Math.round((govLed / total) * 100),
      pctPPP: Math.round((ppp / total) * 100),
      pctPrivate: 100 - Math.round((govLed / total) * 100) - Math.round((ppp / total) * 100),
    };
  }

  return controls;
}
