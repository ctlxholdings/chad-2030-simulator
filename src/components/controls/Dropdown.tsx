/**
 * Dropdown select component
 */

interface DropdownOption<T> {
  value: T;
  label: string;
  description?: string;
}

interface DropdownProps<T extends string | number> {
  label: string;
  value: T;
  options: DropdownOption<T>[];
  onChange: (value: T) => void;
  description?: string;
  disabled?: boolean;
}

export function Dropdown<T extends string | number>({
  label,
  value,
  options,
  onChange,
  description,
  disabled = false,
}: DropdownProps<T>) {
  const id = `dropdown-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block font-medium text-gray-900">
        {label}
      </label>
      {description && (
        <p id={`${id}-desc`} className="text-sm text-gray-500">
          {description}
        </p>
      )}
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        disabled={disabled}
        className="
          w-full px-3 py-2 border border-gray-300 rounded-md
          bg-white text-gray-900
          focus:outline-none focus:ring-2 focus:ring-brand-burgundy focus:border-transparent
          disabled:bg-gray-100 disabled:cursor-not-allowed
          min-h-[44px]
        "
        aria-describedby={description ? `${id}-desc` : undefined}
      >
        {options.map((option) => (
          <option key={String(option.value)} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * Segmented control for enum selection (alternative to dropdown)
 */
interface SegmentedControlProps<T extends string | number> {
  label: string;
  value: T;
  options: DropdownOption<T>[];
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div className="space-y-2">
      <span className="block font-medium text-gray-900">{label}</span>
      <div
        className="flex border border-gray-300 rounded-md overflow-hidden"
        role="radiogroup"
        aria-label={label}
      >
        {options.map((option) => (
          <button
            key={String(option.value)}
            type="button"
            onClick={() => onChange(option.value)}
            className={`
              flex-1 px-3 py-2 text-sm font-medium min-h-[44px]
              transition-colors
              ${
                value === option.value
                  ? 'bg-brand-burgundy text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }
              border-r border-gray-300 last:border-r-0
            `}
            role="radio"
            aria-checked={value === option.value}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
