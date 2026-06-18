import { useState } from 'react';
import { ConceptCard } from '../../components/ConceptCard/ConceptCard';
import { ControlPanel, ResetButton, ToggleGroup } from '../../components/ControlPanel/ControlPanel';
import { SplittingEnergyDiagram } from '../../components/EnergyDiagram/EnergyDiagram';
import { EquationCard } from '../../components/EquationCard/EquationCard';
import { LessonShell } from '../../components/LessonShell/LessonShell';
import { BondingPairDiagram } from '../../components/OrbitalCanvas/OrbitalCanvas';
import { PredictionCard } from '../../components/PredictionCard/PredictionCard';
import type { LessonComponentProps } from '../types';

export function BondingLesson(props: LessonComponentProps) {
  const [compare, setCompare] = useState<'bonding' | 'both'>('both');
  const [interaction, setInteraction] = useState<'moderate' | 'strong'>('moderate');
  const separation = interaction === 'strong' ? 1.8 : 1.1;

  const reset = () => {
    setCompare('both');
    setInteraction('moderate');
  };

  return (
    <LessonShell
      {...props}
      purpose="Compare in-phase and out-of-phase combinations and connect the node to the energy diagram."
      feedback={
        compare === 'both'
          ? 'Bonding is lower in energy and has buildup between nuclei. Antibonding is higher and has a node between nuclei.'
          : 'The bonding combination reinforces between the atoms and moves below the starting levels.'
      }
    >
      <div className="lesson-grid lesson-grid--wide-visual">
        <div className="lesson-stack">
          <EquationCard
            equation="\psi_+=\phi_A+\phi_B\quad\psi_-=\phi_A-\phi_B"
            definitions={[
              { symbol: 'psi+ and psi-', meaning: 'the bonding and antibonding molecular orbitals.' },
              { symbol: 'phiA and phiB', meaning: 'the starting orbitals on atoms A and B.' },
              { symbol: 'bonding', meaning: 'in-phase combination with buildup between nuclei.' },
              { symbol: 'antibonding', meaning: 'out-of-phase combination with a node between nuclei.' },
              { symbol: 'node', meaning: 'a place where psi is zero.' },
            ]}
          />
          <ConceptCard title="Why one orbital goes down and one goes up">
            <p>
              When the facing lobes have the same phase, electron density builds between the nuclei. That
              bonding MO is lower in energy because the electrons help hold the atoms together.
            </p>
            <p>
              When the facing lobes have opposite phase, they cancel between the atoms. The node removes
              density from the bonding region, so the antibonding MO is higher in energy.
            </p>
            <p>
              The same idea applies to sigma and pi bonds. Sigma bonds put density along the bond axis. Pi
              bonds come from side-by-side p orbitals and put density above and below that axis.
            </p>
          </ConceptCard>
          <ControlPanel description="Switch between the bonding picture alone and the bonding/antibonding comparison, then change the interaction strength shown in the energy diagram.">
            <ToggleGroup
              label="View"
              description="Compare both to see the pair formed from the same two starting orbitals. The number of MOs equals the number of starting orbitals."
              value={compare}
              options={[
                { value: 'both', label: 'Compare both' },
                { value: 'bonding', label: 'Bonding only' },
              ]}
              onChange={setCompare}
            />
            <ToggleGroup
              label="Interaction"
              description="Stronger useful overlap makes the bonding-antibonding energy separation larger in this teaching model."
              value={interaction}
              options={[
                { value: 'moderate', label: 'moderate' },
                { value: 'strong', label: 'stronger' },
              ]}
              onChange={setInteraction}
            />
            <ResetButton onReset={reset} />
          </ControlPanel>
          <PredictionCard prompt="Which picture has a node between the atoms, and why is that the higher-energy combination?" />
        </div>
        <div className="visual-column">
          <div className="visual-card">
            <BondingPairDiagram compare={compare === 'both'} />
          </div>
          <SplittingEnergyDiagram separation={separation} />
        </div>
      </div>
    </LessonShell>
  );
}
