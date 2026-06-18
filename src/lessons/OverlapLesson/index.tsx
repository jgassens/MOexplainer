import { useState } from 'react';
import { ConceptCard } from '../../components/ConceptCard/ConceptCard';
import { ControlPanel, ResetButton, SliderControl, ToggleGroup } from '../../components/ControlPanel/ControlPanel';
import { SplittingEnergyDiagram } from '../../components/EnergyDiagram/EnergyDiagram';
import { EquationCard } from '../../components/EquationCard/EquationCard';
import { LessonShell } from '../../components/LessonShell/LessonShell';
import { OverlapDiagram } from '../../components/OrbitalCanvas/OrbitalCanvas';
import { PredictionCard } from '../../components/PredictionCard/PredictionCard';
import { overlapModel } from '../../models/overlap';
import type { LessonComponentProps } from '../types';

type Phase = 1 | -1;

export function OverlapLesson(props: LessonComponentProps) {
  const [distance, setDistance] = useState(2.4);
  const [compactness, setCompactness] = useState(0.8);
  const [relativePhase, setRelativePhase] = useState<Phase>(1);
  const overlap = overlapModel(distance, compactness, relativePhase);

  const reset = () => {
    setDistance(2.4);
    setCompactness(0.8);
    setRelativePhase(1);
  };

  const feedback =
    distance > 3.3
      ? 'The orbitals are farther apart, so the useful overlap and energy separation are smaller.'
      : compactness > 1.35
        ? 'The orbitals are more compact. At the same distance, they reach each other less strongly.'
        : relativePhase === -1
          ? 'Flipping relative phase changes the sign of the overlap and selects the antibonding pattern.'
          : 'The orbitals overlap more strongly when nearby regions with matching phase meet.';

  return (
    <LessonShell
      {...props}
      purpose="Use a fixed-scale picture to see how distance, size, and relative phase change orbital overlap."
      feedback={feedback}
    >
      <div className="lesson-grid lesson-grid--wide-visual">
        <div className="lesson-stack">
          <EquationCard
            equation="S=\int \phi_A\phi_B\,d\tau"
            definitions={[
              { symbol: 'S', meaning: 'overlap score.' },
              { symbol: 'phiA phiB', meaning: 'the product of the two orbital values at each point.' },
              { symbol: 'dtau', meaning: 'a tiny piece of space in the formal expression.' },
            ]}
            note="You will not calculate this integral. It represents adding the product of the two orbital values over all space."
          />
          <ConceptCard title="What overlap means chemically">
            <p>
              Overlap asks how much two orbitals occupy the same region of space with matching phase. More
              useful overlap usually means a stronger orbital interaction and a larger pi/pi* or sigma/sigma*
              energy split.
            </p>
            <p>
              The sliders stand in for real structural changes: bond length changes distance, atom size changes
              how spread out an orbital is, and orbital orientation controls whether phases reinforce or cancel.
            </p>
            <p>
              This is also why hybrid orbitals matter in organic chemistry: they point electron density in
              useful directions, which can improve overlap with a neighboring orbital.
            </p>
          </ConceptCard>
          <ControlPanel description="Change the atom spacing, orbital size, and relative phase while the drawing scale and energy scale stay fixed.">
            <SliderControl
              label="distance between atoms"
              description="This corresponds to moving nuclei closer or farther apart, like changing bond length or stretching a bond."
              value={distance}
              min={1.2}
              max={4.5}
              step={0.1}
              onChange={setDistance}
            />
            <SliderControl
              label="orbital compactness"
              description="Compact orbitals are pulled closer to the nucleus. Oxygen-like orbitals are smaller than carbon-like orbitals; larger atoms can have more spread-out valence orbitals."
              value={compactness}
              min={0.35}
              max={1.8}
              step={0.05}
              onChange={setCompactness}
            />
            <ToggleGroup
              label="relative phase"
              description="This corresponds to whether the lobes that meet have the same sign or opposite signs."
              value={String(relativePhase) as '1' | '-1'}
              options={[
                { value: '1', label: 'matched' },
                { value: '-1', label: 'mismatched' },
              ]}
              onChange={(value) => setRelativePhase(value === '1' ? 1 : -1)}
            />
            <div className="metric-grid" aria-label="Overlap metrics">
              <span>signed S</span>
              <strong>{overlap.signedOverlap.toFixed(3)}</strong>
              <span>useful overlap</span>
              <strong>{overlap.usefulOverlap.toFixed(3)}</strong>
              <span>energy separation</span>
              <strong>{overlap.energySeparation.toFixed(3)}</strong>
            </div>
            <ResetButton onReset={reset} />
          </ControlPanel>
        </div>
        <div className="visual-column">
          <div className="visual-card">
            <OverlapDiagram distance={distance} compactness={compactness} relativePhase={relativePhase} />
          </div>
          <SplittingEnergyDiagram separation={overlap.energySeparation} />
        </div>
      </div>
      <PredictionCard prompt="Move the atoms farther apart while keeping the scale fixed. What happens to the energy separation?" />
    </LessonShell>
  );
}
