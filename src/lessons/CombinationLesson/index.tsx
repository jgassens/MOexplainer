import { useMemo, useState } from 'react';
import { ConceptCard } from '../../components/ConceptCard/ConceptCard';
import { ControlPanel, PresetButtonRow, ResetButton, SliderControl, ToggleGroup } from '../../components/ControlPanel/ControlPanel';
import { EquationCard } from '../../components/EquationCard/EquationCard';
import { LessonShell } from '../../components/LessonShell/LessonShell';
import { CombinationDiagram } from '../../components/OrbitalCanvas/OrbitalCanvas';
import { PredictionCard } from '../../components/PredictionCard/PredictionCard';
import { phaseRelationship } from '../../models/orbitals';
import type { LessonComponentProps } from '../types';

type Preset = 'same' | 'opposite' | 'mostly-a' | 'mostly-b';
type Phase = 1 | -1;

export function CombinationLesson(props: LessonComponentProps) {
  const [weightA, setWeightA] = useState(1);
  const [weightB, setWeightB] = useState(1);
  const [phaseB, setPhaseB] = useState<Phase>(1);

  const effectiveB = weightB * phaseB;
  const relation = useMemo(() => phaseRelationship(weightA, effectiveB), [weightA, effectiveB]);

  const applyPreset = (preset: Preset) => {
    if (preset === 'same') {
      setWeightA(1);
      setWeightB(1);
      setPhaseB(1);
    }
    if (preset === 'opposite') {
      setWeightA(1);
      setWeightB(1);
      setPhaseB(-1);
    }
    if (preset === 'mostly-a') {
      setWeightA(1.25);
      setWeightB(0.45);
      setPhaseB(1);
    }
    if (preset === 'mostly-b') {
      setWeightA(0.45);
      setWeightB(1.25);
      setPhaseB(1);
    }
  };

  const reset = () => applyPreset('same');

  const feedback =
    relation === 'opposite phase'
      ? 'A node has appeared between equivalent atoms because the two contributions cancel there.'
      : Math.abs(weightA - weightB) > 0.2
        ? `The resulting MO is weighted more strongly toward ${weightA > weightB ? 'A' : 'B'}.`
        : 'The equal, same-phase weights build up between the two atoms.';

  return (
    <LessonShell
      {...props}
      purpose="Change the weights in the molecular-orbital equation and watch the result update beside the equation."
      feedback={feedback}
    >
      <div className="lesson-grid">
        <div className="lesson-stack">
          <EquationCard
            equation={`\\psi = ${weightA.toFixed(2)}\\phi_A ${effectiveB >= 0 ? '+' : '-'} ${Math.abs(effectiveB).toFixed(2)}\\phi_B`}
            definitions={[
              { symbol: 'phiA', meaning: 'starting orbital on atom A.' },
              { symbol: 'phiB', meaning: 'starting orbital on atom B.' },
              { symbol: 'weights', meaning: 'numbers that multiply each starting orbital before adding them.' },
              { symbol: 'psi', meaning: 'the resulting molecular orbital.' },
            ]}
            note="Multiply the value of each starting orbital by its weight, and then add the values at every point in space."
          />
          <ConceptCard title="Why add orbitals at all?">
            <p>
              The chapter treats orbitals like wave functions: if two starting orbitals can interact, chemists
              build new molecular orbitals by adding and subtracting them. Same signs reinforce. Opposite
              signs cancel and can make a node.
            </p>
            <p>
              The weights tell you how much of each starting orbital is present in the new MO. Unequal
              weights are the first hint of a polarized bond or an orbital that is mostly on one atom.
            </p>
          </ConceptCard>
          <ControlPanel description="Change the two weights and the relative phase of orbital B. The live equation and picture update from the same values.">
            <SliderControl
              label="weight on orbital A"
              description="A larger weight means atom A contributes more to the displayed molecular orbital."
              value={weightA}
              min={0}
              max={1.5}
              step={0.05}
              onChange={setWeightA}
            />
            <SliderControl
              label="weight on orbital B"
              description="A larger weight means atom B contributes more. In real molecules this often follows atom type, energy, and geometry."
              value={weightB}
              min={0}
              max={1.5}
              step={0.05}
              onChange={setWeightB}
            />
            <ToggleGroup
              label="phase of orbital B"
              description="This is the relative sign of B compared with A. It stands for whether the facing lobes match or oppose each other."
              value={String(phaseB) as '1' | '-1'}
              options={[
                { value: '1', label: 'same phase' },
                { value: '-1', label: 'flip B' },
              ]}
              onChange={(value) => setPhaseB(value === '1' ? 1 : -1)}
            />
            <PresetButtonRow
              label="Combination presets"
              presets={[
                { value: 'same', label: 'Equal, same phase' },
                { value: 'opposite', label: 'Equal, opposite phase' },
                { value: 'mostly-a', label: 'Mostly A' },
                { value: 'mostly-b', label: 'Mostly B' },
              ]}
              onChoose={applyPreset}
            />
            <ResetButton onReset={reset} />
          </ControlPanel>
        </div>
        <div className="visual-card">
          <CombinationDiagram weightA={weightA} weightB={weightB} phaseB={phaseB} />
        </div>
      </div>
      <PredictionCard prompt="Set equal weights, then flip B. Why does a node appear between the atoms?" />
    </LessonShell>
  );
}
