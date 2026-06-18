import { useState } from 'react';
import { ConceptCard } from '../../components/ConceptCard/ConceptCard';
import { ControlPanel, ResetButton, SliderControl } from '../../components/ControlPanel/ControlPanel';
import { SplittingEnergyDiagram } from '../../components/EnergyDiagram/EnergyDiagram';
import { EquationCard } from '../../components/EquationCard/EquationCard';
import { LessonShell } from '../../components/LessonShell/LessonShell';
import { GeometryDiagram } from '../../components/OrbitalCanvas/OrbitalCanvas';
import { PredictionCard } from '../../components/PredictionCard/PredictionCard';
import { geometryOverlap } from '../../models/overlap';
import type { LessonComponentProps } from '../types';

export function GeometryLesson(props: LessonComponentProps) {
  const [twist, setTwist] = useState(0);
  const overlap = geometryOverlap(twist);
  const separation = 1.8 * overlap;

  const reset = () => setTwist(0);

  return (
    <LessonShell
      {...props}
      purpose="Twist adjacent p orbitals and watch pi overlap fade as the orbitals become perpendicular."
      feedback={
        twist > 80
          ? 'At about 90 degrees, the qualitative pi overlap approaches zero, so the pi/pi* separation nearly disappears.'
          : twist > 35
            ? 'The orbital alignment is poorer, so overlap and energy separation are both smaller.'
            : 'Aligned p orbitals have strong pi overlap in this teaching model.'
      }
    >
      <div className="lesson-grid lesson-grid--wide-visual">
        <div className="lesson-stack">
          <EquationCard
            equation="\text{useful overlap}\propto \cos(\theta)"
            definitions={[
              { symbol: 'theta', meaning: 'the twist angle between adjacent p orbitals.' },
              { symbol: 'useful overlap', meaning: 'the part of the overlap that can make a pi interaction.' },
              { symbol: 'geometry', meaning: 'the three-dimensional arrangement of atoms and orbitals.' },
            ]}
          />
          <ConceptCard title="Why geometry can turn mixing on or off">
            <p>
              Pi overlap needs neighboring p orbitals to point in compatible directions. If one p orbital twists
              out of alignment, the same atoms and electrons are present, but the useful overlap shrinks.
            </p>
            <p>
              This is the orbital reason conjugated systems prefer near-planar arrangements: aligned p orbitals
              can share electrons, while perpendicular p orbitals barely communicate.
            </p>
          </ConceptCard>
          <ControlPanel description="Twist one p orbital relative to the other. The model keeps the same orbitals but changes their alignment.">
            <SliderControl
              label="twist angle"
              description="This corresponds to a dihedral angle between adjacent p orbitals, like twisting part of a conjugated molecule out of plane."
              value={twist}
              min={0}
              max={90}
              step={1}
              unit="deg"
              onChange={setTwist}
            />
            <div className="metric-grid" aria-label="Geometry metrics">
              <span>overlap</span>
              <strong>{overlap.toFixed(3)}</strong>
              <span>pi/pi* separation</span>
              <strong>{separation.toFixed(3)}</strong>
            </div>
            <ResetButton onReset={reset} />
          </ControlPanel>
          <PredictionCard prompt="Set the twist angle to 90 degrees. Why does the pi interaction almost vanish?" />
        </div>
        <div className="visual-column">
          <div className="visual-card">
            <GeometryDiagram twist={twist} />
          </div>
          <SplittingEnergyDiagram separation={separation} />
        </div>
      </div>
    </LessonShell>
  );
}
