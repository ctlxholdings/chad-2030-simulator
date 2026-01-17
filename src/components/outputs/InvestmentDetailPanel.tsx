/**
 * Investment detail panel with breakdown by modality
 */

import { useSimulation } from '../../context/SimulationContext';
import { ModalityPieChart, ModalityBarChart } from '../charts/ModalityPieChart';
import { formatCurrency, formatPercent } from '../../utils/formatters';

export function InvestmentDetailPanel() {
  const { state } = useSimulation();
  const { outputs } = state;

  if (!outputs) {
    return <div className="p-4 text-gray-500">Loading...</div>;
  }

  const {
    investmentTotal,
    investmentPrivate,
    cofinancingTotal,
    investmentByModality,
    prepCost,
    nFid,
  } = outputs;

  const avgProjectSize = nFid > 0 ? investmentTotal / nFid : 0;

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden">
      {/* Summary metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        <MetricCard
          label="Total Investment"
          value={formatCurrency(investmentTotal)}
          sublabel="CAPEX mobilized"
          highlight
        />
        <MetricCard
          label="Private Capital"
          value={formatCurrency(investmentPrivate)}
          sublabel={`${formatPercent(investmentTotal > 0 ? investmentPrivate / investmentTotal : 0)} of total`}
        />
        <MetricCard
          label="Gov Co-Financing"
          value={formatCurrency(cofinancingTotal)}
          sublabel={`${formatPercent(investmentTotal > 0 ? cofinancingTotal / investmentTotal : 0)} of total`}
        />
        <MetricCard
          label="Prep Costs"
          value={formatCurrency(prepCost)}
          sublabel="Transaction costs"
        />
      </div>

      {/* Investment by modality */}
      <div className="bg-white rounded-lg shadow p-3 sm:p-4 overflow-hidden">
        <h3 className="font-bold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Investment by Modality</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="hidden md:block">
            <ModalityPieChart data={investmentByModality} />
          </div>
          <div className="md:hidden">
            <ModalityBarChart data={investmentByModality} />
          </div>
          <div className="space-y-4">
            <InvestmentRow
              label="Government-Led"
              value={investmentByModality.GOV_LED}
              total={investmentTotal}
              cofinRate={1.0}
              color="#C1272D"
            />
            <InvestmentRow
              label="PPP"
              value={investmentByModality.PPP}
              total={investmentTotal}
              cofinRate={0.3}
              color="#D4961F"
            />
            <InvestmentRow
              label="Fully Private"
              value={investmentByModality.FULLY_PRIVATE}
              total={investmentTotal}
              cofinRate={0.0}
              color="#6B7280"
            />
          </div>
        </div>
      </div>

      {/* Investment efficiency */}
      <div className="bg-white rounded-lg shadow p-3 sm:p-4 overflow-hidden">
        <h3 className="font-bold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Investment Efficiency</h3>
        <div className="space-y-4">
          <EfficiencyMetric
            label="Average Project Size"
            value={formatCurrency(avgProjectSize)}
            description="Investment per FID project"
          />
          <EfficiencyMetric
            label="Leverage Ratio"
            value={`${(cofinancingTotal > 0 ? investmentTotal / cofinancingTotal : 0).toFixed(1)}x`}
            description="Total investment per $ of gov co-financing"
          />
          <EfficiencyMetric
            label="Private Capital Ratio"
            value={formatPercent(investmentTotal > 0 ? investmentPrivate / investmentTotal : 0)}
            description="Share of investment from private sector"
          />
          <EfficiencyMetric
            label="Prep Cost Ratio"
            value={formatPercent(investmentTotal > 0 ? prepCost / investmentTotal : 0, 2)}
            description="Transaction costs as % of investment"
          />
        </div>
      </div>

      {/* Financing structure */}
      <div className="bg-white rounded-lg shadow p-3 sm:p-4 overflow-hidden">
        <h3 className="font-bold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Financing Structure</h3>
        <div className="space-y-3">
          <FinancingBar
            label="Private Capital"
            value={investmentPrivate}
            total={investmentTotal}
            color="#22C55E"
          />
          <FinancingBar
            label="Government Co-Financing"
            value={cofinancingTotal}
            total={investmentTotal}
            color="#C1272D"
          />
        </div>
        <p className="text-xs text-gray-500 mt-4">
          Shifting modality mix toward PPP and Fully Private reduces government
          co-financing burden while maintaining investment levels.
        </p>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  sublabel,
  highlight = false,
}: {
  label: string;
  value: string;
  sublabel: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-lg p-2 sm:p-3 overflow-hidden ${highlight ? 'bg-brand-burgundy text-white' : 'bg-gray-50'}`}>
      <div className={`text-xs mb-1 truncate ${highlight ? 'text-red-200' : 'text-gray-500'}`}>
        {label}
      </div>
      <div className={`text-base sm:text-lg font-bold truncate ${highlight ? 'text-white' : 'text-gray-900'}`}>
        {value}
      </div>
      <div className={`text-xs truncate ${highlight ? 'text-red-200' : 'text-gray-400'}`}>
        {sublabel}
      </div>
    </div>
  );
}

function InvestmentRow({
  label,
  value,
  total,
  cofinRate,
  color,
}: {
  label: string;
  value: number;
  total: number;
  cofinRate: number;
  color: string;
}) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  const cofin = value * cofinRate;

  return (
    <div className="border-b border-gray-100 pb-3 last:border-0">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
        <span className="font-medium text-gray-900">{label}</span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div>
          <span className="text-gray-500">Investment: </span>
          <span className="font-medium">{formatCurrency(value)}</span>
        </div>
        <div>
          <span className="text-gray-500">Share: </span>
          <span className="font-medium">{pct.toFixed(0)}%</span>
        </div>
        <div>
          <span className="text-gray-500">Co-Fin: </span>
          <span className="font-medium">{formatCurrency(cofin)}</span>
        </div>
      </div>
    </div>
  );
}

function EfficiencyMetric({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <div>
        <div className="font-medium text-gray-900">{label}</div>
        <div className="text-xs text-gray-500">{description}</div>
      </div>
      <div className="text-lg font-bold text-brand-burgundy">{value}</div>
    </div>
  );
}

function FinancingBar({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? (value / total) * 100 : 0;

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-700">{label}</span>
        <span className="font-medium">
          {formatCurrency(value)} ({pct.toFixed(0)}%)
        </span>
      </div>
      <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
