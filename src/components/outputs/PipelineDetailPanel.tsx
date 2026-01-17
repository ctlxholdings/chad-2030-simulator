/**
 * Pipeline detail panel with FID breakdown and drop statistics
 */

import { useSimulation } from '../../context/SimulationContext';
import { FIDsChart } from '../charts/FIDsChart';
import { formatNumber, formatMonths, formatCurrency } from '../../utils/formatters';
import type { GateNumber } from '../../engine/types';

const GATE_NAMES: Record<GateNumber, string> = {
  2: 'Partnership Agreement',
  3: 'Feasibility Authorization',
  4: 'Cabinet Approval',
  5: 'Parliamentary Ratification',
  6: 'Financial Close',
};

export function PipelineDetailPanel() {
  const { state } = useSimulation();
  const { outputs, controls } = state;

  if (!outputs) {
    return <div className="p-4 text-gray-500">Loading...</div>;
  }

  const { pipelineByYear, dropsByGate, avgTimeToFid, nDropped, nFid } = outputs;
  const totalActivated = controls.nActive;

  return (
    <div className="space-y-6">
      {/* Summary metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Projects Activated"
          value={formatNumber(totalActivated)}
          sublabel="Entering pipeline"
        />
        <MetricCard
          label="FIDs Achieved"
          value={formatNumber(nFid)}
          sublabel={`${((nFid / totalActivated) * 100).toFixed(0)}% success rate`}
        />
        <MetricCard
          label="Projects Dropped"
          value={formatNumber(nDropped)}
          sublabel={`${((nDropped / totalActivated) * 100).toFixed(0)}% attrition`}
        />
        <MetricCard
          label="Avg Time to FID"
          value={formatMonths(avgTimeToFid)}
          sublabel="Stage 2 to Close"
        />
      </div>

      {/* FIDs by year chart */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-bold text-gray-900 mb-4">FIDs by Year</h3>
        <FIDsChart data={pipelineByYear} />
        <p className="text-xs text-gray-500 mt-2">
          Projects reaching Financial Close each year. Golden bar indicates final year.
        </p>
      </div>

      {/* Pipeline funnel */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-bold text-gray-900 mb-4">Pipeline Funnel</h3>
        <PipelineFunnel
          activated={totalActivated}
          dropsByGate={dropsByGate}
          fids={nFid}
        />
      </div>

      {/* Drop statistics table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h3 className="font-bold text-gray-900 p-4 border-b">Gate Attrition</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-700">Gate</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">Name</th>
                <th className="px-4 py-2 text-right font-medium text-gray-700">Dropped</th>
                <th className="px-4 py-2 text-right font-medium text-gray-700">% of Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {([2, 3, 4, 5, 6] as GateNumber[]).map((gate) => {
                const drops = dropsByGate[gate];
                const pct = nDropped > 0 ? (drops / nDropped) * 100 : 0;
                return (
                  <tr key={gate} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">Gate {gate}</td>
                    <td className="px-4 py-2 text-gray-600">{GATE_NAMES[gate]}</td>
                    <td className="px-4 py-2 text-right">{formatNumber(drops)}</td>
                    <td className="px-4 py-2 text-right">{pct.toFixed(0)}%</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50 font-medium">
              <tr>
                <td className="px-4 py-2">Total</td>
                <td className="px-4 py-2"></td>
                <td className="px-4 py-2 text-right">{formatNumber(nDropped)}</td>
                <td className="px-4 py-2 text-right">100%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Annual pipeline table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h3 className="font-bold text-gray-900 p-4 border-b">Annual Pipeline Data</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-700">Year</th>
                <th className="px-4 py-2 text-right font-medium text-gray-700">FIDs</th>
                <th className="px-4 py-2 text-right font-medium text-gray-700">Cumulative</th>
                <th className="px-4 py-2 text-right font-medium text-gray-700">Dropped</th>
                <th className="px-4 py-2 text-right font-medium text-gray-700">In-Flight</th>
                <th className="px-4 py-2 text-right font-medium text-gray-700">Investment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pipelineByYear.map((row) => (
                <tr key={row.year} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{row.year}</td>
                  <td className="px-4 py-2 text-right">{formatNumber(row.fids)}</td>
                  <td className="px-4 py-2 text-right">{formatNumber(row.cumulativeFids)}</td>
                  <td className="px-4 py-2 text-right">{formatNumber(row.dropped)}</td>
                  <td className="px-4 py-2 text-right">{formatNumber(row.inFlight)}</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(row.investmentMobilized)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  sublabel,
}: {
  label: string;
  value: string;
  sublabel: string;
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-lg font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-400">{sublabel}</div>
    </div>
  );
}

interface PipelineFunnelProps {
  activated: number;
  dropsByGate: Record<GateNumber, number>;
  fids: number;
}

function PipelineFunnel({ activated, dropsByGate, fids }: PipelineFunnelProps) {
  const stages = [
    { label: 'Activated', count: activated },
    { label: 'After G2', count: activated - dropsByGate[2] },
    { label: 'After G3', count: activated - dropsByGate[2] - dropsByGate[3] },
    { label: 'After G4', count: activated - dropsByGate[2] - dropsByGate[3] - dropsByGate[4] },
    { label: 'After G5', count: activated - dropsByGate[2] - dropsByGate[3] - dropsByGate[4] - dropsByGate[5] },
    { label: 'FID', count: fids },
  ];

  const maxCount = activated;

  return (
    <div className="space-y-2">
      {stages.map((stage, index) => {
        const width = maxCount > 0 ? (stage.count / maxCount) * 100 : 0;
        return (
          <div key={stage.label} className="flex items-center gap-3">
            <span className="w-20 text-sm text-gray-600">{stage.label}</span>
            <div className="flex-1 h-6 bg-gray-100 rounded relative overflow-hidden">
              <div
                className="h-full rounded transition-all"
                style={{
                  width: `${width}%`,
                  backgroundColor: index === stages.length - 1 ? '#22C55E' : '#C1272D',
                }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                {Math.round(stage.count)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
