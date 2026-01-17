/**
 * Scenario comparison table and management
 */

import { useState, useMemo } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { ScenarioCard, ScenarioRow } from './ScenarioCard';
import { generatePresets } from '../../data/presets';

export function ScenarioComparison() {
  const { state, saveScenario, deleteScenario, loadScenario } = useSimulation();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Get presets and user scenarios
  const presets = useMemo(() => generatePresets(), []);
  const userScenarios = state.scenarios.filter((s) => !s.isPreset);
  const allScenarios = [...presets, ...userScenarios];

  const canSave = userScenarios.length < 4;

  const handleSave = () => {
    if (newName.trim() && canSave) {
      saveScenario(newName.trim());
      setNewName('');
      setShowSaveModal(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this scenario? This cannot be undone.')) {
      deleteScenario(id);
    }
  };

  return (
    <div className="space-y-4 w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-gray-900">Scenarios</h2>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex border border-gray-300 rounded-md overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 text-sm ${
                viewMode === 'grid'
                  ? 'bg-brand-burgundy text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
              aria-label="Grid view"
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 text-sm ${
                viewMode === 'table'
                  ? 'bg-brand-burgundy text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
              aria-label="Table view"
            >
              Table
            </button>
          </div>

          {/* Save button */}
          <button
            onClick={() => setShowSaveModal(true)}
            disabled={!canSave}
            className={`
              px-4 py-2 rounded-md text-sm font-medium min-h-[44px]
              ${
                canSave
                  ? 'bg-brand-burgundy text-white hover:bg-brand-burgundy/90'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            Save Current
          </button>
        </div>
      </div>

      {/* Slots remaining */}
      <p className="text-sm text-gray-500">
        {4 - userScenarios.length} of 4 custom scenario slots available
      </p>

      {/* Grid view */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {allScenarios.map((scenario) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              onLoad={() => loadScenario(scenario)}
              onDelete={
                !scenario.isPreset ? () => handleDelete(scenario.id) : undefined
              }
            />
          ))}
        </div>
      )}

      {/* Table view */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Scenario
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-700">
                    FIDs
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-700">
                    Investment
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-gray-700">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-700">
                    Co-Fin
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-700">
                    Time
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {allScenarios.map((scenario) => (
                  <ScenarioRow
                    key={scenario.id}
                    scenario={scenario}
                    onLoad={() => loadScenario(scenario)}
                    onDelete={
                      !scenario.isPreset
                        ? () => handleDelete(scenario.id)
                        : undefined
                    }
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Save modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Save Current Scenario
            </h3>
            <div className="mb-4">
              <label
                htmlFor="scenario-name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Scenario Name
              </label>
              <input
                id="scenario-name"
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g., Optimistic PPP Mix"
                className="
                  w-full px-3 py-2 border border-gray-300 rounded-md
                  focus:outline-none focus:ring-2 focus:ring-brand-burgundy
                "
                autoFocus
                maxLength={50}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowSaveModal(false)}
                className="
                  px-4 py-2 border border-gray-300 text-gray-700 rounded-md
                  text-sm font-medium hover:bg-gray-50
                "
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!newName.trim()}
                className={`
                  px-4 py-2 rounded-md text-sm font-medium
                  ${
                    newName.trim()
                      ? 'bg-brand-burgundy text-white hover:bg-brand-burgundy/90'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
