/**
 * Toggle switch component for boolean controls
 */

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
  disabled?: boolean;
}

export function Toggle({
  label,
  checked,
  onChange,
  description,
  disabled = false,
}: ToggleProps) {
  const id = `toggle-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="flex items-center justify-between">
      <div>
        <label htmlFor={id} className="font-medium text-gray-900 cursor-pointer">
          {label}
        </label>
        {description && (
          <p className="text-sm text-gray-500">{description}</p>
        )}
      </div>
      <label className="toggle-switch" aria-label={`${label}: ${checked ? 'on' : 'off'}`}>
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          aria-describedby={description ? `${id}-desc` : undefined}
        />
        <span className="toggle-slider" />
      </label>
      {description && (
        <span id={`${id}-desc`} className="sr-only">
          {description}
        </span>
      )}
    </div>
  );
}
