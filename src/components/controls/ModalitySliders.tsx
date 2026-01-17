/**
 * Linked modality sliders that sum to 100%
 */

import { useCallback } from 'react';

interface ModalitySlidersProps {
  pctGovLed: number;
  pctPPP: number;
  pctPrivate: number;
  onChange: (values: { pctGovLed: number; pctPPP: number; pctPrivate: number }) => void;
}

export function ModalitySliders({
  pctGovLed,
  pctPPP,
  pctPrivate,
  onChange,
}: ModalitySlidersProps) {
  // When one slider changes, distribute the difference to others proportionally
  const handleGovLedChange = useCallback(
    (value: number) => {
      const othersTotal = pctPPP + pctPrivate;

      if (othersTotal === 0) {
        // If others are zero, split evenly
        const remaining = 100 - value;
        onChange({
          pctGovLed: value,
          pctPPP: Math.round(remaining / 2),
          pctPrivate: remaining - Math.round(remaining / 2),
        });
      } else {
        // Distribute proportionally
        const pppShare = pctPPP / othersTotal;
        const remaining = 100 - value;
        onChange({
          pctGovLed: value,
          pctPPP: Math.round(remaining * pppShare),
          pctPrivate: remaining - Math.round(remaining * pppShare),
        });
      }
    },
    [pctGovLed, pctPPP, pctPrivate, onChange]
  );

  const handlePPPChange = useCallback(
    (value: number) => {
      const othersTotal = pctGovLed + pctPrivate;

      if (othersTotal === 0) {
        const remaining = 100 - value;
        onChange({
          pctGovLed: Math.round(remaining / 2),
          pctPPP: value,
          pctPrivate: remaining - Math.round(remaining / 2),
        });
      } else {
        const govShare = pctGovLed / othersTotal;
        const remaining = 100 - value;
        onChange({
          pctGovLed: Math.round(remaining * govShare),
          pctPPP: value,
          pctPrivate: remaining - Math.round(remaining * govShare),
        });
      }
    },
    [pctGovLed, pctPPP, pctPrivate, onChange]
  );

  const handlePrivateChange = useCallback(
    (value: number) => {
      const othersTotal = pctGovLed + pctPPP;

      if (othersTotal === 0) {
        const remaining = 100 - value;
        onChange({
          pctGovLed: Math.round(remaining / 2),
          pctPPP: remaining - Math.round(remaining / 2),
          pctPrivate: value,
        });
      } else {
        const govShare = pctGovLed / othersTotal;
        const remaining = 100 - value;
        onChange({
          pctGovLed: Math.round(remaining * govShare),
          pctPPP: remaining - Math.round(remaining * govShare),
          pctPrivate: value,
        });
      }
    },
    [pctGovLed, pctPPP, pctPrivate, onChange]
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="font-medium text-gray-900">Modality Split</span>
        <span className="text-xs text-gray-500">(must sum to 100%)</span>
      </div>

      {/* Visual stacked bar */}
      <div className="h-8 flex rounded-md overflow-hidden border border-gray-300">
        <div
          className="bg-brand-burgundy flex items-center justify-center text-white text-xs font-medium transition-all"
          style={{ width: `${pctGovLed}%` }}
          title={`Government-Led: ${pctGovLed}%`}
        >
          {pctGovLed >= 10 && `${pctGovLed}%`}
        </div>
        <div
          className="bg-brand-gold flex items-center justify-center text-white text-xs font-medium transition-all"
          style={{ width: `${pctPPP}%` }}
          title={`PPP: ${pctPPP}%`}
        >
          {pctPPP >= 10 && `${pctPPP}%`}
        </div>
        <div
          className="bg-gray-500 flex items-center justify-center text-white text-xs font-medium transition-all"
          style={{ width: `${pctPrivate}%` }}
          title={`Fully Private: ${pctPrivate}%`}
        >
          {pctPrivate >= 10 && `${pctPrivate}%`}
        </div>
      </div>

      {/* Individual sliders */}
      <div className="space-y-3">
        <SliderRow
          label="Government-Led"
          value={pctGovLed}
          onChange={handleGovLedChange}
          color="bg-brand-burgundy"
        />
        <SliderRow
          label="PPP"
          value={pctPPP}
          onChange={handlePPPChange}
          color="bg-brand-gold"
        />
        <SliderRow
          label="Fully Private"
          value={pctPrivate}
          onChange={handlePrivateChange}
          color="bg-gray-500"
        />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-brand-burgundy" />
          <span>Gov-Led (100% cofin)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-brand-gold" />
          <span>PPP (30% cofin)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-gray-500" />
          <span>Private (0% cofin)</span>
        </div>
      </div>
    </div>
  );
}

interface SliderRowProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  color: string;
}

function SliderRow({ label, value, onChange, color }: SliderRowProps) {
  return (
    <div className="flex items-center gap-3">
      <span className={`w-3 h-3 rounded ${color}`} />
      <span className="w-28 text-sm text-gray-700">{label}</span>
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1"
        aria-label={`${label}: ${value}%`}
      />
      <span className="w-12 text-right text-sm font-mono">{value}%</span>
    </div>
  );
}
