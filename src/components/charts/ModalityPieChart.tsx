/**
 * Investment by modality pie chart
 */

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { Modality } from '../../engine/types';
import { formatCurrency } from '../../utils/formatters';

interface ModalityPieChartProps {
  data: Record<Modality, number>;
}

const COLORS = {
  GOV_LED: '#C1272D',
  PPP: '#D4961F',
  FULLY_PRIVATE: '#6B7280',
};

const LABELS = {
  GOV_LED: 'Government-Led',
  PPP: 'PPP',
  FULLY_PRIVATE: 'Fully Private',
};

export function ModalityPieChart({ data }: ModalityPieChartProps) {
  const chartData = Object.entries(data)
    .filter(([_, value]) => value > 0)
    .map(([modality, value]) => ({
      name: LABELS[modality as Modality],
      value,
      modality: modality as Modality,
    }));

  if (chartData.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-500">
        No investment data
      </div>
    );
  }

  return (
    <div className="h-40 sm:h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={70}
            paddingAngle={2}
            dataKey="value"
            label={({ percent }) =>
              percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''
            }
            labelLine={false}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[entry.modality]}
                stroke="white"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              fontSize: '12px',
            }}
            formatter={(value: number) => formatCurrency(value)}
          />
          <Legend
            wrapperStyle={{ fontSize: '10px' }}
            formatter={(value) => value}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Horizontal bar variant for mobile
 */
export function ModalityBarChart({ data }: ModalityPieChartProps) {
  const total = Object.values(data).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-2">
      {Object.entries(data).map(([modality, value]) => {
        const percent = total > 0 ? (value / total) * 100 : 0;
        return (
          <div key={modality} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">{LABELS[modality as Modality]}</span>
              <span className="font-medium">{formatCurrency(value)}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${percent}%`,
                  backgroundColor: COLORS[modality as Modality],
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
