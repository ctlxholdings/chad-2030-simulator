/**
 * Formatting utilities for display
 */

/**
 * Format a number as currency (USD)
 */
export function formatCurrency(value: number, compact = true): string {
  if (compact) {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}B`;
    }
    return `$${value.toFixed(0)}M`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value * 1_000_000);
}

/**
 * Format a number as a percentage
 */
export function formatPercent(value: number, decimals = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format a number with commas
 */
export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format months duration
 */
export function formatMonths(value: number): string {
  return `${value.toFixed(1)} mo`;
}

/**
 * Format a date from ISO string
 */
export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format status for screen readers
 */
export function formatStatusForScreenReader(status: 'GREEN' | 'YELLOW' | 'RED'): string {
  switch (status) {
    case 'GREEN':
      return 'green, within IMF limits';
    case 'YELLOW':
      return 'yellow, approaching limits';
    case 'RED':
      return 'red, IMF limits exceeded';
  }
}

/**
 * Get status icon
 */
export function getStatusIcon(status: 'GREEN' | 'YELLOW' | 'RED'): string {
  switch (status) {
    case 'GREEN':
      return '✓';
    case 'YELLOW':
      return '⚠';
    case 'RED':
      return '✗';
  }
}
