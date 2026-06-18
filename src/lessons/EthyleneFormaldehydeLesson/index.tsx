import { useState } from 'react';
import { ConceptCard } from '../../components/ConceptCard/ConceptCard';
import { ControlPanel, ResetButton, ToggleGroup } from '../../components/ControlPanel/ControlPanel';
import { TwoLevelEnergyDiagram } from '../../components/EnergyDiagram/EnergyDiagram';
import { EquationCard } from '../../components/EquationCard/EquationCard';
import { LessonShell } from '../../components/LessonShell/LessonShell';
import { MoleculeComparisonDiagram } from '../../components/OrbitalCanvas/OrbitalCanvas';
import { PredictionCard } from '../../components/PredictionCard/PredictionCard';
import { mixTwoOrbitals } from '../../models/mixing';
import type { LessonComponentProps } from '../types';

type Molecule = 'ethylene' | 'formaldehyde';

export function EthyleneFormaldehydeLesson(props: LessonComponentProps) {
  const [molecule, setMolecule] = useState<Molecule>('ethylene');
  const isEthylene = molecule === 'ethylene';
  const energyB = isEthylene ? 0 : -1.2;
  const result = mixTwoOrbitals(0, energyB, 0.38);

  const reset = () => setMolecule('ethylene');

  return (
    <LessonShell
      {...props}
      purpose="Switch directly between ethylene and formaldehyde to see how oxygen changes the pi and pi* pictures."
      feedback={
        isEthylene
          ? 'Ethylene uses two similar carbon p orbitals, so pi and pi* have balanced carbon weights.'
          : 'In formaldehyde, pi is more oxygen-like, while pi* has the larger carbon weight. That carbon weight helps explain nucleophilic attack at carbon.'
      }
    >
      <div className="lesson-grid lesson-grid--wide-visual">
        <div className="lesson-stack">
          <EquationCard
            equation={isEthylene ? '\\pi,\\pi^*\\text{ from C and C p orbitals}' : '\\pi,\\pi^*\\text{ from C and O p orbitals}'}
            definitions={[
              { symbol: 'pi', meaning: 'the bonding pi molecular orbital made from adjacent p orbitals.' },
              { symbol: 'HOMO', meaning: 'highest occupied molecular orbital.' },
              { symbol: 'LUMO', meaning: 'lowest unoccupied molecular orbital.' },
              { symbol: 'pi*', meaning: 'the antibonding pi orbital with a node between atoms.' },
            ]}
            note={
              isEthylene
                ? 'Ethylene has a pi bonding HOMO and a pi* antibonding LUMO in this two-orbital picture.'
                : 'Formaldehyde has a pi* LUMO. Its HOMO is not simply the bonding pi orbital; oxygen lone-pair orbitals are also important.'
            }
          />
          <ConceptCard title="Why these two molecules matter">
            <p>
              Ethylene is the clean reference case: two carbon p orbitals start at the same energy, so the pi
              and pi* orbitals have balanced carbon character.
            </p>
            <p>
              Formaldehyde keeps the same pi framework, but oxygen lowers one starting p orbital. The pi
              bonding MO becomes more oxygen-like, while pi* has the larger carbon contribution. That is why
              carbonyl reactivity often focuses on attack at carbon.
            </p>
            <p>
              These pi and pi* pictures are group orbitals: transferable pieces that chemists reuse when they
              reason about larger alkenes, carbonyls, and conjugated functional groups.
            </p>
          </ConceptCard>
          <ControlPanel description="Switch the molecule while keeping the comparison in the same place, so the coefficient changes are easy to see.">
            <ToggleGroup
              label="Molecule"
              description="Use ethylene as the equal-carbon baseline, then switch to formaldehyde to isolate the effect of oxygen."
              value={molecule}
              options={[
                { value: 'ethylene', label: 'Ethylene' },
                { value: 'formaldehyde', label: 'Formaldehyde' },
              ]}
              onChange={setMolecule}
            />
            <ResetButton onReset={reset} />
          </ControlPanel>
          <PredictionCard prompt="Switch to formaldehyde. Why does the pi* picture have a larger carbon lobe?" />
        </div>
        <div className="visual-column visual-column--mixed">
          <div className="visual-card">
            <MoleculeComparisonDiagram
              molecule={molecule}
              lowerShare={{ a: result.lower.aShare, b: result.lower.bShare }}
              upperShare={{ a: result.upper.aShare, b: result.upper.bShare }}
            />
          </div>
          <TwoLevelEnergyDiagram
            energyA={0}
            energyB={energyB}
            lowerEnergy={result.lowerEnergy}
            upperEnergy={result.upperEnergy}
            labelA="C"
            labelB={isEthylene ? 'C' : 'O'}
          />
        </div>
      </div>
    </LessonShell>
  );
}
