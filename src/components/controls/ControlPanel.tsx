/**
 * Main control panel containing all user inputs
 */

import { useSimulation } from '../../context/SimulationContext';
import { Toggle } from './Toggle';
import { Slider } from './Slider';
import { SegmentedControl } from './Dropdown';
import { ModalitySliders } from './ModalitySliders';
import type { RiskLevel, OilPriceScenario } from '../../engine/types';

export function ControlPanel() {
  const { state, updateControls } = useSimulation();
  const { controls } = state;

  return (
    <div className="space-y-4 sm:space-y-6 overflow-hidden">
      {/* Portfolio Section */}
      <section className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-bold text-brand-burgundy mb-4 pb-2 border-b">
          Portfolio
        </h2>
        <div className="space-y-5">
          <Slider
            label="Projects to Activate"
            value={controls.nActive}
            min={20}
            max={268}
            step={1}
            onChange={(nActive) =>
              updateControls({
                nActive,
                nChampion: Math.min(controls.nChampion, nActive),
              })
            }
            formatValue={(v) => `${v} projects`}
            description="Number of projects entering the pipeline"
          />

          <ModalitySliders
            pctGovLed={controls.pctGovLed}
            pctPPP={controls.pctPPP}
            pctPrivate={controls.pctPrivate}
            onChange={({ pctGovLed, pctPPP, pctPrivate }) =>
              updateControls({ pctGovLed, pctPPP, pctPrivate })
            }
          />
        </div>
      </section>

      {/* Interventions Section */}
      <section className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-bold text-brand-burgundy mb-4 pb-2 border-b">
          Interventions
        </h2>
        <div className="space-y-5">
          <Toggle
            label="Transaction Advisor"
            checked={controls.advisor}
            onChange={(advisor) => updateControls({ advisor })}
            description="Engage professional advisor to accelerate pipeline"
          />

          <Slider
            label="PMU Expansion"
            value={controls.pmuAdd}
            min={0}
            max={15}
            step={1}
            onChange={(pmuAdd) => updateControls({ pmuAdd })}
            formatValue={(v) => `+${v} FTE`}
            description="Additional Project Management Unit staff"
          />

          <Slider
            label="Champion Projects"
            value={controls.nChampion}
            min={0}
            max={Math.min(20, controls.nActive)}
            step={1}
            onChange={(nChampion) => updateControls({ nChampion })}
            formatValue={(v) => `${v} projects`}
            description="Flagship projects with senior government champion"
          />
        </div>
      </section>

      {/* Assumptions Section */}
      <section className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-bold text-brand-burgundy mb-4 pb-2 border-b">
          Assumptions
        </h2>
        <div className="space-y-5">
          <SegmentedControl
            label="Oil Price Scenario"
            value={controls.oilPrice}
            options={[
              { value: 50 as OilPriceScenario, label: '$50' },
              { value: 65 as OilPriceScenario, label: '$65' },
              { value: 75 as OilPriceScenario, label: '$75' },
            ]}
            onChange={(oilPrice) =>
              updateControls({ oilPrice: oilPrice as OilPriceScenario })
            }
          />

          <Slider
            label="Donor Realization"
            value={controls.donorRate * 100}
            min={50}
            max={90}
            step={5}
            onChange={(v) => updateControls({ donorRate: v / 100 })}
            formatValue={(v) => `${v}%`}
            description="Expected % of pledged donor support"
          />

          <SegmentedControl
            label="Political Stability"
            value={controls.politicalRisk}
            options={[
              { value: 'LOW' as RiskLevel, label: 'Low Risk' },
              { value: 'MED' as RiskLevel, label: 'Medium' },
              { value: 'HIGH' as RiskLevel, label: 'High Risk' },
            ]}
            onChange={(politicalRisk) =>
              updateControls({ politicalRisk: politicalRisk as RiskLevel })
            }
          />
        </div>
      </section>
    </div>
  );
}
