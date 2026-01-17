/**
 * Debt/GDP trajectory chart with IMF ceiling
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { AnnualFiscalData } from '../../engine/types';
import { PARAMETERS } from '../../engine/parameters';

interface DebtTrajectoryChartProps {
  data: AnnualFiscalData[];
}

export function DebtTrajectoryChart({ data }: DebtTrajectoryChartProps) {
  const chartData = data.map((d) => ({
    year: d.year.toString(),
    debtRatio: d.debtRatio * 100,
    ceiling: PARAMETERS.fiscal.debtCeiling * 100,
    warning: PARAMETERS.fiscal.debtWarning * 100,
  }));

  return (
    <div className="h-40 sm:h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 5, left: -15, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="year"
            tick={{ fill: '#6B7280', fontSize: 10 }}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          <YAxis
            domain={[0, 50]}
            tick={{ fill: '#6B7280', fontSize: 10 }}
            axisLine={{ stroke: '#E5E7EB' }}
            tickFormatter={(v) => `${v}%`}
            width={40}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              fontSize: '11px',
            }}
            formatter={(value: number) => [`${value.toFixed(1)}%`, 'Debt/GDP']}
          />
          <ReferenceLine
            y={PARAMETERS.fiscal.debtCeiling * 100}
            stroke="#EF4444"
            strokeDasharray="5 5"
          />
          <ReferenceLine
            y={PARAMETERS.fiscal.debtWarning * 100}
            stroke="#F59E0B"
            strokeDasharray="3 3"
          />
          <Line
            type="monotone"
            dataKey="debtRatio"
            stroke="#C1272D"
            strokeWidth={2}
            dot={{ fill: '#C1272D', strokeWidth: 1, r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * NOPD trajectory (non-oil primary deficit)
 */
export function NOPDChart({ data }: DebtTrajectoryChartProps) {
  const chartData = data.map((d) => ({
    year: d.year.toString(),
    actual: Math.abs(d.nopdActual * 100),
    target: Math.abs(d.nopdTarget * 100),
  }));

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="year"
            tick={{ fill: '#6B7280', fontSize: 12 }}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          <YAxis
            tick={{ fill: '#6B7280', fontSize: 12 }}
            axisLine={{ stroke: '#E5E7EB' }}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              fontSize: '12px',
            }}
            formatter={(value: number, name: string) => [
              `${value.toFixed(1)}%`,
              name === 'actual' ? 'NOPD (actual)' : 'NOPD (target)',
            ]}
          />
          <Line
            type="monotone"
            dataKey="target"
            stroke="#22C55E"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: '#22C55E', r: 3 }}
            name="target"
          />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#C1272D"
            strokeWidth={3}
            dot={{ fill: '#C1272D', r: 4 }}
            name="actual"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
