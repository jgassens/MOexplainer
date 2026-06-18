import { useEffect, useMemo, useState } from 'react';
import { ConceptCard } from '../../components/ConceptCard/ConceptCard';
import { ControlPanel, PresetButtonRow, ResetButton, SliderControl } from '../../components/ControlPanel/ControlPanel';
import { PiEnergyDiagram } from '../../components/EnergyDiagram/EnergyDiagram';
import { EquationCard } from '../../components/EquationCard/EquationCard';
import { LessonShell } from '../../components/LessonShell/LessonShell';
import { CoefficientChainDiagram } from '../../components/OrbitalCanvas/OrbitalCanvas';
import { PredictionCard } from '../../components/PredictionCard/PredictionCard';
import { occupancyForPiChain } from '../../models/piChain';
import type { LessonComponentProps } from '../types';

type Preset = 'ethylene' | 'allyl' | 'butadiene';

export function PiChainLesson(props: LessonComponentProps) {
  const [atomCount, setAtomCount] = useState(4);
  const [electronCount, setElectronCount] = useState(4);
  const [selectedIndex, setSelectedIndex] = useState(1);
  const levels = useMemo(() => occupancyForPiChain(atomCount, electronCount), [atomCount, electronCount]);
  const selected = levels[selectedIndex] ?? levels[0];

  useEffect(() => {
    setSelectedIndex((index) => Math.min(index, levels.length - 1));
    setElectronCount((count) => Math.min(count, atomCount * 2));
  }, [atomCount, levels.length]);

  const choosePreset = (preset: Preset) => {
    if (preset === 'ethylene') {
      setAtomCount(2);
      setElectronCount(2);
      setSelectedIndex(0);
    }
    if (preset === 'allyl') {
      setAtomCount(3);
      setElectronCount(3);
      setSelectedIndex(1);
    }
    if (preset === 'butadiene') {
      setAtomCount(4);
      setElectronCount(4);
      setSelectedIndex(1);
    }
  };

  const reset = () => choosePreset('butadiene');

  return (
    <LessonShell
      {...props}
      purpose="Build linear pi systems from two to six p orbitals and connect orbital count, nodes, and electron count."
      feedback={`This ${atomCount}-atom chain makes ${atomCount} pi molecular orbitals. The selected orbital has ${selected.nodeCount} node${selected.nodeCount === 1 ? '' : 's'}.`}
    >
      <div className="lesson-grid lesson-grid--wide-visual">
        <div className="lesson-stack">
          <EquationCard
            equation="N\ \text{p orbitals}\Rightarrow N\ \text{MOs}"
            definitions={[
              { symbol: 'N', meaning: 'the number of connected p orbitals in the chain.' },
              { symbol: 'MO', meaning: 'a molecular orbital.' },
              { symbol: 'pi orbital', meaning: 'a molecular orbital made from the chain of p orbitals.' },
              { symbol: 'node', meaning: 'a place where the sign of psi changes or passes through zero.' },
              { symbol: 'HOMO/LUMO', meaning: 'the highest occupied and lowest unoccupied molecular orbitals.' },
            ]}
          />
          <ConceptCard title="Why longer pi chains get more orbitals">
            <p>
              Each p orbital you add contributes one molecular orbital to the pi system. Two p orbitals make
              two pi MOs. Three make the allyl pattern. Four make the butadiene pattern.
            </p>
            <p>
              As you go higher in energy, the pi orbitals generally gain more nodes. Changing the electron
              count lets you compare cation, radical, neutral, and anion patterns without changing the carbon
              skeleton.
            </p>
            <p>
              That is the group-orbital idea from the chapter: once you understand ethylene, allyl, and
              butadiene, you can reuse those patterns inside larger organic structures.
            </p>
          </ConceptCard>
          <ControlPanel description="Change the chain length, choose which pi orbital to inspect, and set how many pi electrons fill the energy levels.">
            <PresetButtonRow
              label="Pi chain presets"
              description="Ethylene is two atoms, allyl is three, and butadiene is four. These are the chapter's small building blocks for larger organic pi systems."
              presets={[
                { value: 'ethylene', label: 'Ethylene' },
                { value: 'allyl', label: 'Allyl' },
                { value: 'butadiene', label: 'Butadiene' },
              ]}
              onChoose={choosePreset}
            />
            <SliderControl
              label="number of atoms"
              description="This is the number of connected p orbitals in the conjugated chain."
              value={atomCount}
              min={2}
              max={6}
              step={1}
              onChange={setAtomCount}
            />
            <SliderControl
              label="selected orbital"
              description="Move up the energy ladder to see how node count grows."
              value={selectedIndex + 1}
              min={1}
              max={atomCount}
              step={1}
              onChange={(value) => setSelectedIndex(value - 1)}
            />
            <SliderControl
              label="pi electrons"
              description="This fills the pi MOs from low to high energy. Odd counts model radicals; fewer or extra electrons model ions."
              value={electronCount}
              min={0}
              max={atomCount * 2}
              step={1}
              onChange={setElectronCount}
            />
            <ResetButton onReset={reset} />
          </ControlPanel>
        </div>
        <div className="visual-column">
          <div className="visual-card">
            <CoefficientChainDiagram orbital={selected} />
          </div>
          <PiEnergyDiagram levels={levels} selectedIndex={selectedIndex} />
        </div>
      </div>
      <PredictionCard prompt="Increase the chain from ethylene to butadiene. What happens to the spacing between pi energy levels?" />
    </LessonShell>
  );
}
