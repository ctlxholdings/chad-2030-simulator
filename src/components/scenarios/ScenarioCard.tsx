/**
 * Scenario card for display in list/grid
 */

import type { SavedScenario } from '../../engine/types';
import { StatusIndicator } from '../outputs/StatusIndicator';
import { formatCurrency, formatNumber, formatDate } from '../../utils/formatters';

interface ScenarioCardProps {
  scenario: SavedScenario;
  onLoad: () => void;
  onDelete?: () => void;
  isActive?: boolean;
}

export function ScenarioCard({
  scenario,
  onLoad,
  onDelete,
  isActive = false,
}: ScenarioCardProps) {
  const { name, createdAt, outputs, isPreset } = scenario;

  return (
    <div
      className={`
        bg-white rounded-lg shadow p-4 card-hover
        ${isActive ? 'ring-2 ring-brand-burgundy' : ''}
      `}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-gray-900">{name}</h3>
          {!isPreset && (
            <p className="text-xs text-gray-500">{formatDate(createdAt)}</p>
          )}
          {isPreset && (
            <span className="inline-block mt-1 px-2 py-0.5 bg-brand-gold/10 text-brand-gold text-xs rounded">
              Preset
            </span>
          )}
        </div>
        <StatusIndicator status={outputs.fiscalStatus} size="sm" />
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
        <div>
          <span className="text-gray-500">FIDs:</span>
          <span className="ml-1 font-medium">{formatNumber(outputs.nFid)}</span>
        </div>
        <div>
          <span className="text-gray-500">Investment:</span>
          <span className="ml-1 font-medium">{formatCurrency(outputs.investmentTotal)}</span>
        </div>
        <div>
          <span className="text-gray-500">Co-Fin:</span>
          <span className="ml-1 font-medium">{formatCurrency(outputs.cofinancingTotal)}</span>
        </div>
        <div>
          <span className="text-gray-500">Time:</span>
          <span className="ml-1 font-medium">{outputs.avgTimeToFid.toFixed(0)} mo</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onLoad}
          className="
            flex-1 px-3 py-2 bg-brand-burgundy text-white rounded-md
            text-sm font-medium hover:bg-brand-burgundy/90
            transition-colors min-h-[44px]
          "
        >
          Load
        </button>
        {!isPreset && onDelete && (
          <button
            onClick={onDelete}
            className="
              px-3 py-2 border border-gray-300 text-gray-700 rounded-md
              text-sm font-medium hover:bg-gray-50
              transition-colors min-h-[44px]
            "
            aria-label={`Delete scenario ${name}`}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Compact scenario row for comparison table
 */
export function ScenarioRow({
  scenario,
  onLoad,
  onDelete,
}: {
  scenario: SavedScenario;
  onLoad: () => void;
  onDelete?: () => void;
}) {
  const { name, outputs, isPreset } = scenario;

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3">
        <div className="font-medium text-gray-900">{name}</div>
        {isPreset && (
          <span className="text-xs text-brand-gold">Preset</span>
        )}
      </td>
      <td className="px-4 py-3 text-right font-medium">
        {formatNumber(outputs.nFid)}
      </td>
      <td className="px-4 py-3 text-right font-medium">
        {formatCurrency(outputs.investmentTotal)}
      </td>
      <td className="px-4 py-3 text-center">
        <StatusIndicator status={outputs.fiscalStatus} size="sm" />
      </td>
      <td className="px-4 py-3 text-right font-medium">
        {formatCurrency(outputs.cofinancingTotal)}
      </td>
      <td className="px-4 py-3 text-right">
        {outputs.avgTimeToFid.toFixed(0)} mo
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-1 justify-end">
          <button
            onClick={onLoad}
            className="
              px-2 py-1 bg-brand-burgundy text-white rounded text-xs
              hover:bg-brand-burgundy/90
            "
          >
            Load
          </button>
          {!isPreset && onDelete && (
            <button
              onClick={onDelete}
              className="
                px-2 py-1 border border-gray-300 text-gray-600 rounded text-xs
                hover:bg-gray-50
              "
            >
              Del
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
