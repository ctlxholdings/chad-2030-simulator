/**
 * FIDs by year bar chart
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { AnnualPipelineData } from '../../engine/types';

interface FIDsChartProps {
  data: AnnualPipelineData[];
}

export function FIDsChart({ data }: FIDsChartProps) {
  const chartData = data.map((d) => ({
    year: d.year.toString(),
    fids: d.fids,
    cumulative: d.cumulativeFids,
  }));

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="year"
            tick={{ fill: '#6B7280', fontSize: 12 }}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          <YAxis
            tick={{ fill: '#6B7280', fontSize: 12 }}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              fontSize: '12px',
            }}
            formatter={(value: number, name: string) => [
              value,
              name === 'fids' ? 'FIDs this year' : 'Cumulative FIDs',
            ]}
          />
          <Bar dataKey="fids" fill="#C1272D" radius={[4, 4, 0, 0]}>
            {chartData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={index === chartData.length - 1 ? '#D4961F' : '#C1272D'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Cumulative FIDs line chart
 */
export function CumulativeFIDsChart({ data }: FIDsChartProps) {
  const chartData = data.map((d) => ({
    year: d.year.toString(),
    cumulative: d.cumulativeFids,
  }));

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="year"
            tick={{ fill: '#6B7280', fontSize: 12 }}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          <YAxis
            tick={{ fill: '#6B7280', fontSize: 12 }}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              fontSize: '12px',
            }}
          />
          <Bar dataKey="cumulative" fill="#C1272D" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
