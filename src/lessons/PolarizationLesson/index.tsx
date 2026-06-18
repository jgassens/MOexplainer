import { useState } from 'react';
import { ConceptCard } from '../../components/ConceptCard/ConceptCard';
import { ControlPanel, PresetButtonRow, ResetButton, SliderControl } from '../../components/ControlPanel/ControlPanel';
import { TwoLevelEnergyDiagram } from '../../components/EnergyDiagram/EnergyDiagram';
import { EquationCard } from '../../components/EquationCard/EquationCard';
import { LessonShell } from '../../components/LessonShell/LessonShell';
import { MoleculeComparisonDiagram } from '../../components/OrbitalCanvas/OrbitalCanvas';
import { PredictionCard } from '../../components/PredictionCard/PredictionCard';
import { mixTwoOrbitals } from '../../models/mixing';
import type { LessonComponentProps } from '../types';

type Preset = 'cc' | 'co' | 'cn' | 'custom';

const presetDiff: Record<Preset, number> = {
  cc: 0,
  co: 1.2,
  cn: 0.75,
  custom: 0.9,
};

export function PolarizationLesson(props: LessonComponentProps) {
  const [preset, setPreset] = useState<Preset>('co');
  const [difference, setDifference] = useState(1.2);
  const result = mixTwoOrbitals(0, -difference, 0.35);
  const atomB = difference < 0.15 ? 'C' : preset === 'co' ? 'O' : preset === 'cn' ? 'N' : 'X';
  const molecule = preset === 'co' ? 'formaldehyde' : difference < 0.15 ? 'ethylene' : undefined;
  const bondingCaption =
    difference < 0.15
      ? 'balanced weights'
      : atomB === 'O'
        ? 'more oxygen-like'
        : atomB === 'N'
          ? 'more nitrogen-like'
          : 'more lower-energy atom-like';
  const antibondingCaption = difference < 0.15 ? 'balanced weights' : 'larger carbon weight';

  const choosePreset = (nextPreset: Preset) => {
    setPreset(nextPreset);
    setDifference(presetDiff[nextPreset]);
  };

  const reset = () => choosePreset('co');

  return (
    <LessonShell
      {...props}
      purpose="Connect electronegativity to lower starting orbital energy and polarized molecular orbitals."
      feedback={
        difference < 0.15
          ? 'The two atoms start at similar energy, so the pi and pi* weights are nearly balanced.'
          : 'The bonding MO is becoming more like the lower-energy atom, while the antibonding MO is becoming more like carbon.'
      }
    >
      <div className="lesson-grid lesson-grid--wide-visual">
        <div className="lesson-stack">
          <EquationCard
            equation="\text{higher EN}\Rightarrow\text{lower orbital energy}"
            definitions={[
              { symbol: 'EN', meaning: 'electronegativity. Higher EN means the atom holds electrons more tightly.' },
              { symbol: 'electronegativity', meaning: 'a tendency to hold electrons more tightly.' },
              { symbol: 'polarized MO', meaning: 'a molecular orbital with unequal weights on the two atoms.' },
              { symbol: 'lobe size', meaning: 'a drawing cue for weight size, not electric charge.' },
            ]}
          />
          <ConceptCard title="Why C-O and C-N look different">
            <p>
              More electronegative atoms hold their valence electrons more tightly, so their starting orbitals
              are lower in energy. In this model, atom B is the more electronegative partner when the energy
              difference is positive.
            </p>
            <p>
              The mixed-orbital picture uses source colors for atom character. The lower, bonding MO leans
              toward the lower-energy atom. The higher, antibonding MO keeps a larger carbon contribution.
            </p>
          </ConceptCard>
          <ControlPanel description="Choose a bond preset or set a custom starting-energy difference. A larger difference means atom B begins at lower energy than carbon.">
            <PresetButtonRow
              label="Bond presets"
              description="C-C is the equal-energy limit. C-N is moderately polarized. C-O is the carbonyl-like case with a lower oxygen p orbital."
              presets={[
                { value: 'cc', label: 'C-C' },
                { value: 'co', label: 'C-O' },
                { value: 'cn', label: 'C-N' },
                { value: 'custom', label: 'Custom' },
              ]}
              onChoose={choosePreset}
            />
            <SliderControl
              label="energy difference"
              description="This represents how much lower atom B's starting p orbital is than carbon's. Larger values mimic a more electronegative partner."
              value={difference}
              min={0}
              max={2}
              step={0.1}
              onChange={(value) => {
                setPreset('custom');
                setDifference(value);
              }}
            />
            <p className="control-note">Preset: {preset.toUpperCase().replace('CC', 'C-C').replace('CO', 'C-O').replace('CN', 'C-N')}</p>
            <ResetButton onReset={reset} />
          </ControlPanel>
        </div>
        <div className="visual-column visual-column--mixed">
          <div className="visual-card">
            <MoleculeComparisonDiagram
              molecule={molecule}
              atomA="C"
              atomB={atomB}
              lowerShare={{ a: result.lower.aShare, b: result.lower.bShare }}
              upperShare={{ a: result.upper.aShare, b: result.upper.bShare }}
              bondingCaption={bondingCaption}
              antibondingCaption={antibondingCaption}
            />
          </div>
          <TwoLevelEnergyDiagram
            energyA={0}
            energyB={-difference}
            lowerEnergy={result.lowerEnergy}
            upperEnergy={result.upperEnergy}
            labelA="C"
            labelB={atomB}
          />
        </div>
      </div>
      <PredictionCard prompt="Choose C-O, then C-N. Which MO resembles the lower-energy atom more, and which one has the larger carbon weight?" />
    </LessonShell>
  );
}
