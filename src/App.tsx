/**
 * Main App Component - Chad 2030 Pipeline Simulator
 */

import { useState } from 'react';
import { Layout } from './components/layout/Layout';
import { ControlPanel } from './components/controls/ControlPanel';
import { FiscalDetailPanel } from './components/outputs/FiscalDetailPanel';
import { PipelineDetailPanel } from './components/outputs/PipelineDetailPanel';
import { InvestmentDetailPanel } from './components/outputs/InvestmentDetailPanel';
import { ScenarioComparison } from './components/scenarios/ScenarioComparison';
import { useSimulation } from './context/SimulationContext';

type TabId = 'fiscal' | 'pipeline' | 'investment' | 'scenarios';

interface Tab {
  id: TabId;
  label: string;
}

const TABS: Tab[] = [
  { id: 'fiscal', label: 'Fiscal' },
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'investment', label: 'Investment' },
  { id: 'scenarios', label: 'Scenarios' },
];

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('fiscal');
  const { resetToDefaults } = useSimulation();

  return (
    <Layout>
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column: Controls */}
        <div className="lg:col-span-1">
          <div className="sticky top-32">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Controls</h2>
              <button
                onClick={resetToDefaults}
                className="
                  text-sm text-brand-burgundy hover:underline
                  focus:outline-none focus:ring-2 focus:ring-brand-burgundy focus:ring-offset-2
                "
              >
                Reset to defaults
              </button>
            </div>
            <ControlPanel />
          </div>
        </div>

        {/* Right column: Output panels */}
        <div className="lg:col-span-2">
          {/* Tab navigation */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="flex gap-1" aria-label="Output sections">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    px-4 py-3 text-sm font-medium border-b-2 transition-colors
                    ${
                      activeTab === tab.id
                        ? 'border-brand-burgundy text-brand-burgundy'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                    }
                  `}
                  aria-selected={activeTab === tab.id}
                  role="tab"
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab content */}
          <div role="tabpanel" aria-label={`${activeTab} panel`}>
            {activeTab === 'fiscal' && <FiscalDetailPanel />}
            {activeTab === 'pipeline' && <PipelineDetailPanel />}
            {activeTab === 'investment' && <InvestmentDetailPanel />}
            {activeTab === 'scenarios' && <ScenarioComparison />}
          </div>
        </div>
      </div>

      {/* Mobile-only quick stats below fold */}
      <div className="lg:hidden mt-8 pt-6 border-t border-gray-200">
        <QuickStats />
      </div>
    </Layout>
  );
}

/**
 * Quick stats summary for mobile view
 */
function QuickStats() {
  const { state } = useSimulation();
  const { outputs } = state;

  if (!outputs) return null;

  const stats = [
    { label: 'Dropped', value: outputs.nDropped },
    { label: 'Avg Time', value: `${outputs.avgTimeToFid.toFixed(0)} mo` },
    { label: 'Prep Cost', value: `$${(outputs.prepCost).toFixed(0)}M` },
    { label: 'Peak Load', value: `${(outputs.peakLoadRatio * 100).toFixed(0)}%` },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-sm font-medium text-gray-500 mb-3">Quick Stats</h3>
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-lg font-bold text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
