/**
 * Slider component for numeric controls
 */

import { useState, useCallback } from 'react';
import { useDebouncedCallback } from '../../hooks/useDebounce';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
  description?: string;
  disabled?: boolean;
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  formatValue = (v) => v.toString(),
  description,
  disabled = false,
}: SliderProps) {
  const id = `slider-${label.toLowerCase().replace(/\s+/g, '-')}`;

  // Local state for immediate feedback during drag
  const [localValue, setLocalValue] = useState(value);

  // Debounced callback for expensive operations
  const debouncedOnChange = useDebouncedCallback(onChange, 100);

  // Update local value immediately, debounce parent update
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Number(e.target.value);
      setLocalValue(newValue);
      debouncedOnChange(newValue);
    },
    [debouncedOnChange]
  );

  // Sync local value when prop changes
  if (value !== localValue && !document.activeElement?.closest(`#${id}`)) {
    setLocalValue(value);
  }

  // Calculate fill percentage for visual progress
  const fillPercent = ((localValue - min) / (max - min)) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="font-medium text-gray-900">
          {label}
        </label>
        <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
          {formatValue(localValue)}
        </span>
      </div>
      {description && (
        <p id={`${id}-desc`} className="text-sm text-gray-500">
          {description}
        </p>
      )}
      <div className="relative">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue}
          onChange={handleChange}
          disabled={disabled}
          className="w-full"
          aria-label={`${label}: ${formatValue(localValue)}`}
          aria-describedby={description ? `${id}-desc` : undefined}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={localValue}
          style={{
            background: `linear-gradient(to right, #C1272D ${fillPercent}%, #E5E7EB ${fillPercent}%)`,
          }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-400">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  );
}
