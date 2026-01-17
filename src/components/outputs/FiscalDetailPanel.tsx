/**
 * Fiscal detail panel with charts and metrics
 */

import { useSimulation } from '../../context/SimulationContext';
import { CoFinancingChart, RevenueChart } from '../charts/CoFinancingChart';
import { DebtTrajectoryChart } from '../charts/DebtTrajectoryChart';
import { StatusBadge } from './StatusIndicator';
import { formatCurrency, formatPercent } from '../../utils/formatters';

export function FiscalDetailPanel() {
  const { state } = useSimulation();
  const { outputs } = state;

  if (!outputs) {
    return <div className="p-4 text-gray-500">Loading...</div>;
  }

  const { fiscalByYear, cofinancingTotal, breachYear, breachReason } = outputs;

  // Get 2030 data for summary
  const data2030 = fiscalByYear.find((d) => d.year === 2030);

  return (
    <div className="space-y-6">
      {/* Summary metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Total Co-Financing"
          value={formatCurrency(cofinancingTotal)}
          sublabel="2025-2030"
        />
        <MetricCard
          label="2030 Fiscal Space"
          value={formatCurrency(data2030?.fiscalSpace ?? 0)}
          sublabel="Annual limit"
        />
        <MetricCard
          label="2030 Debt/GDP"
          value={formatPercent(data2030?.debtRatio ?? 0, 1)}
          sublabel={`Ceiling: ${formatPercent(0.33, 0)}`}
        />
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">2030 Status</div>
          <StatusBadge status={data2030?.fiscalStatus ?? 'GREEN'} />
        </div>
      </div>

      {/* Breach warning */}
      {breachYear && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-medium text-red-800 mb-1">Fiscal Breach Detected</h4>
          <p className="text-sm text-red-700">
            IMF limits exceeded in {breachYear}
            {breachReason && `: ${breachReason}`}
          </p>
        </div>
      )}

      {/* Co-financing chart */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-bold text-gray-900 mb-4">
          Co-Financing Demand vs Fiscal Space
        </h3>
        <CoFinancingChart data={fiscalByYear} />
        <p className="text-xs text-gray-500 mt-2">
          Bars show annual co-financing demand from FIDs. Green line shows maximum
          available fiscal space.
        </p>
      </div>

      {/* Debt trajectory */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-bold text-gray-900 mb-4">Public Debt Trajectory</h3>
        <DebtTrajectoryChart data={fiscalByYear} />
        <p className="text-xs text-gray-500 mt-2">
          IMF ECF QPC requires debt below 33% of GDP. Yellow warning at 30%.
        </p>
      </div>

      {/* Revenue breakdown */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-bold text-gray-900 mb-4">Government Revenue Sources</h3>
        <RevenueChart data={fiscalByYear} />
      </div>

      {/* Annual fiscal table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h3 className="font-bold text-gray-900 p-4 border-b">Annual Fiscal Data</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-700">Year</th>
                <th className="px-4 py-2 text-right font-medium text-gray-700">Revenue</th>
                <th className="px-4 py-2 text-right font-medium text-gray-700">Co-Fin Demand</th>
                <th className="px-4 py-2 text-right font-medium text-gray-700">Fiscal Space</th>
                <th className="px-4 py-2 text-right font-medium text-gray-700">Debt/GDP</th>
                <th className="px-4 py-2 text-center font-medium text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {fiscalByYear.map((row) => (
                <tr key={row.year} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{row.year}</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(row.revenue)}</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(row.cofinancingDemand)}</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(row.fiscalSpace)}</td>
                  <td className="px-4 py-2 text-right">{formatPercent(row.debtRatio, 1)}</td>
                  <td className="px-4 py-2 text-center">
                    <StatusBadge status={row.fiscalStatus} />
                  </td>
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
