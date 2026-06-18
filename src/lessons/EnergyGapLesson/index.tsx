import { useState } from 'react';
import { ConceptCard } from '../../components/ConceptCard/ConceptCard';
import { ControlPanel, ResetButton, SliderControl } from '../../components/ControlPanel/ControlPanel';
import { TwoLevelEnergyDiagram } from '../../components/EnergyDiagram/EnergyDiagram';
import { EquationCard } from '../../components/EquationCard/EquationCard';
import { LessonShell } from '../../components/LessonShell/LessonShell';
import { PredictionCard } from '../../components/PredictionCard/PredictionCard';
import { mixTwoOrbitals } from '../../models/mixing';
import type { LessonComponentProps } from '../types';

function ContributionBars({ a, b }: { a: number; b: number }) {
  return (
    <div className="contribution-bars" aria-label="Relative orbital contributions">
      <span>A</span>
      <meter min={0} max={1} value={a} />
      <strong>{Math.round(a * 100)}%</strong>
      <span>B</span>
      <meter min={0} max={1} value={b} />
      <strong>{Math.round(b * 100)}%</strong>
    </div>
  );
}

export function EnergyGapLesson(props: LessonComponentProps) {
  const [energyA, setEnergyA] = useState(0);
  const [energyB, setEnergyB] = useState(-0.8);
  const [interaction, setInteraction] = useState(0.32);
  const result = mixTwoOrbitals(energyA, energyB, interaction);

  const reset = () => {
    setEnergyA(0);
    setEnergyB(-0.8);
    setInteraction(0.32);
  };

  const lowerAtom = energyA < energyB ? 'A' : energyB < energyA ? 'B' : 'both atoms equally';
  const feedback =
    result.startingGap < 0.15
      ? 'Equal starting energies produce evenly shared molecular orbitals.'
      : `The lower MO is becoming more like ${lowerAtom}, the lower-energy starting orbital.`;

  return (
    <LessonShell
      {...props}
      purpose="Change the starting orbital energies and see how a larger gap reduces mixing."
      feedback={feedback}
    >
      <div className="lesson-grid">
        <div className="lesson-stack">
          <EquationCard
            equation="\psi=c_A\phi_A+c_B\phi_B"
            definitions={[
              { symbol: 'psi', meaning: 'the molecular orbital made from the two starting orbitals.' },
              { symbol: 'cA and cB', meaning: 'weights that multiply the starting orbitals.' },
              { symbol: 'phiA and phiB', meaning: 'the starting orbitals on atoms A and B.' },
              { symbol: 'starting energy', meaning: 'where each atomic orbital begins before mixing.' },
              { symbol: 'interaction', meaning: 'the strength of the orbital mixing in this teaching model.' },
            ]}
            note="All energies are relative energy in arbitrary teaching units."
          />
          <ConceptCard title="Why energy matching matters">
            <p>
              Orbitals mix best when they are close in energy and have useful overlap. If one starting orbital
              is much lower, the lower MO keeps more of that lower-energy character, and the upper MO keeps
              more of the higher-energy character.
            </p>
            <p>
              Chemically, lower starting energy often tracks greater electronegativity. Oxygen and nitrogen p
              orbitals begin lower than carbon p orbitals, so C-O and C-N pi systems become polarized.
            </p>
          </ConceptCard>
          <ControlPanel description="Move the two starting orbital energies and change the overlap strength. Watch how the lower and upper MO weights respond.">
            <SliderControl
              label="starting energy A"
              description="This stands for the energy of the starting orbital on atom or fragment A before mixing."
              value={energyA}
              min={-1.8}
              max={1.8}
              step={0.1}
              onChange={setEnergyA}
            />
            <SliderControl
              label="starting energy B"
              description="Lower values mimic a more electronegative atom or a more stabilized fragment orbital."
              value={energyB}
              min={-1.8}
              max={1.8}
              step={0.1}
              onChange={setEnergyB}
            />
            <SliderControl
              label="overlap strength"
              description="This bundles distance, orbital size, and alignment into one knob for how strongly the two orbitals interact."
              value={interaction}
              min={0.05}
              max={0.7}
              step={0.05}
              onChange={setInteraction}
            />
            <ResetButton onReset={reset} />
          </ControlPanel>
          <div className="mini-panel">
            <h3>Lower MO weights</h3>
            <ContributionBars a={result.lower.aShare} b={result.lower.bShare} />
            <h3>Upper MO weights</h3>
            <ContributionBars a={result.upper.aShare} b={result.upper.bShare} />
          </div>
        </div>
        <div className="visual-card">
          <TwoLevelEnergyDiagram
            energyA={energyA}
            energyB={energyB}
            lowerEnergy={result.lowerEnergy}
            upperEnergy={result.upperEnergy}
          />
        </div>
      </div>
      <PredictionCard prompt="Make A and B equal in energy. What happens to the two weights in each molecular orbital?" />
      <details className="going-deeper">
        <summary>Going deeper</summary>
        <p>
          The site computes the two-level result with a small hidden algebra model. The main lesson only uses its
          chemistry consequence: closer starting energies mix more strongly.
        </p>
      </details>
    </LessonShell>
  );
}
