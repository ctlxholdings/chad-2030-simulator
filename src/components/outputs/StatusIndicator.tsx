/**
 * Fiscal status traffic light indicator
 */

import type { StatusLevel } from '../../engine/types';
import { formatStatusForScreenReader, getStatusIcon } from '../../utils/formatters';

interface StatusIndicatorProps {
  status: StatusLevel;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const sizeClasses = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
};

const statusClasses = {
  GREEN: 'bg-status-green status-green',
  YELLOW: 'bg-status-yellow status-yellow',
  RED: 'bg-status-red status-red',
};

const statusLabels = {
  GREEN: 'Safe',
  YELLOW: 'Caution',
  RED: 'Breach',
};

export function StatusIndicator({
  status,
  size = 'md',
  showLabel = false,
}: StatusIndicatorProps) {
  const ariaLabel = `Fiscal status: ${formatStatusForScreenReader(status)}`;
  const icon = getStatusIcon(status);

  return (
    <div className="flex items-center gap-2">
      <div
        className={`
          ${sizeClasses[size]}
          ${statusClasses[status]}
          rounded-full flex items-center justify-center
          text-white font-bold shadow-md
        `}
        role="status"
        aria-label={ariaLabel}
      >
        {icon}
      </div>
      {showLabel && (
        <span className="text-sm font-medium text-gray-700">
          {statusLabels[status]}
        </span>
      )}
    </div>
  );
}

/**
 * Compact status badge for tables/lists
 */
export function StatusBadge({ status }: { status: StatusLevel }) {
  const bgClasses = {
    GREEN: 'bg-green-100 text-green-800',
    YELLOW: 'bg-yellow-100 text-yellow-800',
    RED: 'bg-red-100 text-red-800',
  };

  return (
    <span
      className={`
        inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
        ${bgClasses[status]}
      `}
    >
      {getStatusIcon(status)} {statusLabels[status]}
    </span>
  );
}
