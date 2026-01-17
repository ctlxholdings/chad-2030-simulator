/**
 * Co-financing demand vs fiscal space chart
 */

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { AnnualFiscalData } from '../../engine/types';
import { formatCurrency } from '../../utils/formatters';

interface CoFinancingChartProps {
  data: AnnualFiscalData[];
}

// Smart currency formatter for Y-axis
function formatYAxisCurrency(v: number): string {
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}B`;
  if (v > 0) return `$${v.toFixed(0)}M`;
  return '$0';
}

export function CoFinancingChart({ data }: CoFinancingChartProps) {
  const chartData = data.map((d) => ({
    year: d.year.toString(),
    demand: d.cofinancingDemand,
    space: d.fiscalSpace,
    status: d.fiscalStatus,
  }));

  return (
    <div className="h-56 sm:h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="year"
            tick={{ fill: '#6B7280', fontSize: 10 }}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          <YAxis
            tick={{ fill: '#6B7280', fontSize: 10 }}
            axisLine={{ stroke: '#E5E7EB' }}
            tickFormatter={formatYAxisCurrency}
            width={55}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              fontSize: '11px',
            }}
            formatter={(value: number, name: string) => [
              formatCurrency(value),
              name === 'demand' ? 'Demand' : 'Space',
            ]}
          />
          <Legend
            wrapperStyle={{ fontSize: '10px' }}
            formatter={(value) =>
              value === 'demand' ? 'Demand' : 'Limit'
            }
          />
          <Bar
            dataKey="demand"
            fill="#C1272D"
            radius={[4, 4, 0, 0]}
            name="demand"
          />
          <Line
            type="monotone"
            dataKey="space"
            stroke="#22C55E"
            strokeWidth={2}
            dot={{ fill: '#22C55E', strokeWidth: 1, r: 3 }}
            name="space"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Revenue breakdown chart
 */
export function RevenueChart({ data }: CoFinancingChartProps) {
  const chartData = data.map((d) => ({
    year: d.year.toString(),
    oil: d.oilRevenue,
    nonOil: d.nonOilRevenue,
    donors: d.donorGrants,
  }));

  return (
    <div className="h-40 sm:h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="year"
            tick={{ fill: '#6B7280', fontSize: 10 }}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          <YAxis
            tick={{ fill: '#6B7280', fontSize: 10 }}
            axisLine={{ stroke: '#E5E7EB' }}
            tickFormatter={formatYAxisCurrency}
            width={55}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              fontSize: '11px',
            }}
            formatter={(value: number) => formatCurrency(value)}
          />
          <Bar dataKey="oil" stackId="revenue" fill="#1F2937" name="Oil" />
          <Bar dataKey="nonOil" stackId="revenue" fill="#6B7280" name="Non-Oil" />
          <Bar dataKey="donors" stackId="revenue" fill="#D4961F" name="Donors" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
