/**
 * Always-visible hero metrics section
 *
 * BINDING REQUIREMENT: Must be visible at all times without scrolling
 * Max height: 120px on mobile
 */

import { useSimulation } from '../../context/SimulationContext';
import { StatusIndicator } from '../outputs/StatusIndicator';
import { formatCurrency, formatNumber } from '../../utils/formatters';

export function HeroMetrics() {
  const { state } = useSimulation();
  const { outputs, isCalculating } = state;

  // Default values while calculating
  const fids = outputs?.nFid ?? 0;
  const investment = outputs?.investmentTotal ?? 0;
  const status = outputs?.fiscalStatus ?? 'GREEN';

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-4 hero-metrics">
          {/* FIDs */}
          <div className="flex-1 text-center">
            <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">
              Projects to FID
            </div>
            <div
              className="hero-value text-2xl md:text-3xl font-bold text-gray-900"
              aria-label={`Projects reaching financial close: ${fids}`}
            >
              {isCalculating ? (
                <span className="opacity-50">{fids}</span>
              ) : (
                formatNumber(fids)
              )}
            </div>
          </div>

          {/* Investment */}
          <div className="flex-1 text-center">
            <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">
              Investment
            </div>
            <div
              className="hero-value text-2xl md:text-3xl font-bold text-brand-burgundy"
              aria-label={`Total investment mobilized: ${investment} million dollars`}
            >
              {isCalculating ? (
                <span className="opacity-50">{formatCurrency(investment)}</span>
              ) : (
                formatCurrency(investment)
              )}
            </div>
          </div>

          {/* Fiscal Status */}
          <div className="flex-1 flex flex-col items-center">
            <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">
              Fiscal Status
            </div>
            <div className="flex items-center gap-2">
              {isCalculating ? (
                <div className="spinner" />
              ) : (
                <StatusIndicator status={status} size="lg" />
              )}
            </div>
          </div>
        </div>

        {/* Warning banner if breach */}
        {outputs?.breachYear && (
          <div className="mt-2 px-3 py-2 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">
              <span className="font-medium">Warning:</span> Fiscal limit breached in{' '}
              {outputs.breachYear}
              {outputs.breachReason && ` (${outputs.breachReason})`}
            </p>
          </div>
        )}

        {/* Bounds warning if any */}
        {outputs?.boundsWarning && (
          <div className="mt-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              <span className="font-medium">Note:</span> {outputs.boundsWarning}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
