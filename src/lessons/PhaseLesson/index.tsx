import { useState } from 'react';
import { ConceptCard } from '../../components/ConceptCard/ConceptCard';
import { ControlPanel, ResetButton, SliderControl, ToggleGroup } from '../../components/ControlPanel/ControlPanel';
import { EquationCard } from '../../components/EquationCard/EquationCard';
import { LessonShell } from '../../components/LessonShell/LessonShell';
import { SingleOrbitalDiagram } from '../../components/OrbitalCanvas/OrbitalCanvas';
import { PredictionCard } from '../../components/PredictionCard/PredictionCard';
import type { LessonComponentProps } from '../types';

type ViewMode = 'psi' | 'density';
type Phase = 1 | -1;

export function PhaseLesson(props: LessonComponentProps) {
  const [mode, setMode] = useState<ViewMode>('psi');
  const [globalPhase, setGlobalPhase] = useState<Phase>(1);
  const [displayThreshold, setDisplayThreshold] = useState(0.2);

  const reset = () => {
    setMode('psi');
    setGlobalPhase(1);
    setDisplayThreshold(0.2);
  };

  const feedback =
    displayThreshold > 0.45
      ? 'A higher display threshold makes the drawn lobes smaller. The orbital function and its node have not changed.'
      : mode === 'density'
      ? 'The density picture stays the same after a global sign flip because squaring removes the sign.'
      : globalPhase === -1
        ? 'The global sign changed. The phase labels swapped, but this alone does not change electron density.'
        : 'The two lobes show opposite signs of psi. The signs are phase, not electric charge.';

  return (
    <LessonShell
      {...props}
      purpose="Connect the colored orbital picture to a mathematical function. The picture represents psi; it is not the orbital itself."
      feedback={feedback}
    >
      <div className="lesson-grid">
        <div className="lesson-stack">
          <EquationCard
            equation="|\psi|^2 = |-\psi|^2\quad\quad\psi=\pm\tau"
            definitions={[
              { symbol: 'psi', meaning: 'the orbital function. It can be positive or negative.' },
              { symbol: '|psi|^2', meaning: 'electron density in this simple picture.' },
              { symbol: '-psi', meaning: 'the same orbital after a global phase flip.' },
              { symbol: 'tau', meaning: 'a display threshold. It changes the picture, not the orbital.' },
            ]}
            note="A threshold is a drawing choice. Raising it shows less of the same function."
          />
          <ConceptCard title="What is psi?">
            <p>
              Psi is the orbital function. In this lesson, think of it as a map that gives a positive or
              negative number at each point in space. The sign is phase. It is not electric charge.
            </p>
            <p>
              Chemists usually cannot draw every value of psi, so they draw a surface where the function is
              large enough to see. The threshold slider changes that drawing cutoff, like changing the isovalue
              in a computed orbital picture.
            </p>
          </ConceptCard>
          <ControlPanel description="Change whether you draw psi or density, flip the whole sign, and adjust the display threshold used to draw the orbital picture.">
            <ToggleGroup
              label="Show"
              description="Psi keeps the sign. Density squares psi, so the sign disappears."
              value={mode}
              options={[
                { value: 'psi', label: 'Show psi' },
                { value: 'density', label: 'Show |psi|^2' },
              ]}
              onChange={setMode}
            />
            <ToggleGroup
              label="Global phase"
              description="Flipping the whole orbital swaps every sign. It does not make a new density."
              value={String(globalPhase) as '1' | '-1'}
              options={[
                { value: '1', label: 'normal' },
                { value: '-1', label: 'flipped' },
              ]}
              onChange={(value) => setGlobalPhase(value === '1' ? 1 : -1)}
            />
            <SliderControl
              label="display threshold"
              description="A higher threshold hides the faint outer parts of the same orbital. It does not change the orbital, node, or energy."
              value={displayThreshold}
              min={0.05}
              max={0.6}
              step={0.05}
              onChange={setDisplayThreshold}
            />
            <ResetButton onReset={reset} />
          </ControlPanel>
          <PredictionCard prompt="Raise the display threshold, then flip the global phase while showing density. What changes, and what stays the same?" />
        </div>
        <div className="visual-card">
          <SingleOrbitalDiagram mode={mode} globalPhase={globalPhase} displayThreshold={displayThreshold} />
        </div>
      </div>
      <details className="going-deeper">
        <summary>Going deeper</summary>
        <p>
          A display threshold changes which part of a function is drawn. It does not change the function, its
          nodes, or its energy in the teaching model.
        </p>
      </details>
    </LessonShell>
  );
}
