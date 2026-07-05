import { useMemo, useState } from 'react';
import { AssessmentCard } from '../components/Assessment';
import { LessonShell } from '../components/LessonShell/LessonShell';
import { scrollToPageTop } from '../utils/scroll';
import '../styles/moexplainer-guided-rest.css';
import type { LessonComponentProps } from './types';
import {
  guidedLessonContent,
  type GoingDeeperPanelData,
  type GuidedRestLessonId,
  type VisualKind,
} from './guidedLessonContent';

interface ControlState {
  phase: 'bonding' | 'antibonding';
  distance: number;
  compactness: number;
  energyGap: number;
  interaction: number;
  electronegativity: number;
  molecule: 'ethylene' | 'formaldehyde';
  twist: number;
  geometry: number;
  electrons: 6 | 7 | 8;
  atomCount: number;
  orbitalIndex: number;
  calculationFeature: 'nodes' | 'phase' | 'coefficients';
}

const defaultState: ControlState = {
  phase: 'bonding',
  distance: 2.2,
  compactness: 0.9,
  energyGap: 0.9,
  interaction: 0.38,
  electronegativity: 1.2,
  molecule: 'formaldehyde',
  twist: 0,
  geometry: 0.55,
  electrons: 8,
  atomCount: 4,
  orbitalIndex: 2,
  calculationFeature: 'nodes',
};

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function percent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function signText(sign: 1 | -1): string {
  return sign > 0 ? '+' : '−';
}

function phaseClass(sign: 1 | -1): string {
  return sign > 0 ? 'guided-positive' : 'guided-negative';
}

function twoLevelMixing(energyGap: number, interaction: number) {
  const gap = Math.max(0, energyGap);
  const root = Math.sqrt((gap / 2) ** 2 + interaction ** 2);
  const lowerEnergy = -gap / 2 - root;
  const upperEnergy = -gap / 2 + root;
  const mixing = gap === 0 ? 0.5 : 0.5 * (1 - gap / Math.sqrt(gap ** 2 + 4 * interaction ** 2));
  return {
    lowerEnergy,
    upperEnergy,
    lowerA: mixing,
    lowerB: 1 - mixing,
    upperA: 1 - mixing,
    upperB: mixing,
    split: upperEnergy - lowerEnergy,
  };
}

function PiLobes({ x, y, signs, scale = 1 }: { x: number; y: number; signs: [1 | -1, 1 | -1]; scale?: number }) {
  const [top, bottom] = signs;
  return (
    <g
      className="guided-pi-lobes"
      transform={`translate(${x} ${y}) scale(${scale})`}
      aria-label={`p orbital lobes with ${signText(top)} phase above and ${signText(bottom)} phase below`}
    >
      <ellipse className={phaseClass(top)} cx="0" cy="-24" rx="18" ry="28" />
      <ellipse className={phaseClass(bottom)} cx="0" cy="24" rx="18" ry="28" />
      <text className="guided-phase-label" x="0" y="-22" textAnchor="middle" dominantBaseline="middle">{signText(top)}</text>
      <text className="guided-phase-label" x="0" y="27" textAnchor="middle" dominantBaseline="middle">{signText(bottom)}</text>
      <circle className="guided-nucleus" cx="0" cy="0" r="7" />
    </g>
  );
}

function SoftLobe({ cx, cy, rx, ry, sign }: { cx: number; cy: number; rx: number; ry: number; sign: 1 | -1 }) {
  return (
    <g>
      <ellipse className={`${phaseClass(sign)} guided-soft-surface`} cx={cx} cy={cy} rx={rx} ry={ry} />
      <text className="guided-phase-label guided-phase-label--soft" x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">{signText(sign)}</text>
    </g>
  );
}

function EnergyLevel({ x1, x2, y, label, occupied = false }: { x1: number; x2: number; y: number; label: string; occupied?: boolean }) {
  return (
    <g>
      <line className="guided-energy-level" x1={x1} x2={x2} y1={y} y2={y} />
      <text className="guided-svg-label" x={x2 + 8} y={y + 4}>{label}</text>
      {occupied ? (
        <g className="guided-electrons">
          <text x={(x1 + x2) / 2 - 10} y={y - 6}>↑</text>
          <text x={(x1 + x2) / 2 + 4} y={y - 6}>↓</text>
        </g>
      ) : null}
    </g>
  );
}

function BondingVisual({ state, setState }: { state: ControlState; setState: (patch: Partial<ControlState>) => void }) {
  const bonding = state.phase === 'bonding';
  const split = 0.55 + state.interaction;
  return (
    <div className="guided-visual-block">
      <div className="guided-control-row">
        <button type="button" className={bonding ? 'is-active' : ''} onClick={() => setState({ phase: 'bonding' })}>same phase</button>
        <button type="button" className={!bonding ? 'is-active' : ''} onClick={() => setState({ phase: 'antibonding' })}>opposite phase</button>
        <label>interaction strength {state.interaction.toFixed(2)}
          <input type="range" min="0.15" max="0.75" step="0.01" value={state.interaction} onChange={(event) => setState({ interaction: Number(event.currentTarget.value) })} />
        </label>
      </div>
      <svg className="guided-main-svg" viewBox="0 0 760 360" role="img" aria-label="Bonding and antibonding orbital visual with plus and minus phase labels">
        <text className="guided-panel-title" x="34" y="34">{bonding ? 'Bonding: in-phase overlap' : 'Antibonding: out-of-phase overlap'}</text>
        <PiLobes x={250} y={150} signs={[1, -1]} />
        <PiLobes x={390} y={150} signs={bonding ? [1, -1] : [-1, 1]} />
        {bonding ? (
          <ellipse className="guided-density-bridge" cx="320" cy="150" rx="108" ry="48" />
        ) : (
          <g>
            <rect className="guided-node-band" x="314" y="68" width="12" height="164" rx="6" />
            <text className="guided-svg-label" x="292" y="252">node</text>
          </g>
        )}
        <line className="guided-bond-axis" x1="178" x2="462" y1="150" y2="150" />
        <EnergyLevel x1={560} x2={640} y={104 - split * 26} label={bonding ? 'sigma* / pi*' : 'selected MO'} occupied={!bonding} />
        <EnergyLevel x1={560} x2={640} y={238 + split * 26} label={bonding ? 'selected MO' : 'sigma / pi'} occupied={bonding} />
        <line className="guided-energy-axis" x1="540" x2="540" y1="70" y2="286" />
        <text className="guided-svg-label" x="524" y="62">energy</text>
      </svg>
    </div>
  );
}

function OverlapVisual({ state, setState }: { state: ControlState; setState: (patch: Partial<ControlState>) => void }) {
  const phaseSign = state.phase === 'bonding' ? 1 : -1;
  const rawOverlap = Math.exp(-state.distance * state.distance / (2.6 * state.compactness));
  const usefulOverlap = rawOverlap * phaseSign;
  const split = Math.abs(usefulOverlap) * 1.8;
  return (
    <div className="guided-visual-block">
      <div className="guided-control-row guided-control-row--stacked">
        <label>distance {state.distance.toFixed(2)} <input type="range" min="1.2" max="4.2" step="0.01" value={state.distance} onChange={(event) => setState({ distance: Number(event.currentTarget.value) })} /></label>
        <label>orbital spread {state.compactness.toFixed(2)} <input type="range" min="0.45" max="1.45" step="0.01" value={state.compactness} onChange={(event) => setState({ compactness: Number(event.currentTarget.value) })} /></label>
        <button type="button" className={state.phase === 'bonding' ? 'is-active' : ''} onClick={() => setState({ phase: 'bonding' })}>matched phase</button>
        <button type="button" className={state.phase === 'antibonding' ? 'is-active' : ''} onClick={() => setState({ phase: 'antibonding' })}>opposite phase</button>
      </div>
      <svg className="guided-main-svg" viewBox="0 0 760 330" role="img" aria-label="Overlap model with plus and minus phase labels">
        <text className="guided-panel-title" x="34" y="34">Useful overlap S = {usefulOverlap.toFixed(3)}</text>
        <text className="guided-svg-label" x="34" y="58">Energy separation = {split.toFixed(3)} teaching units</text>
        <PiLobes x={300 - state.distance * 26} y={160} signs={[1, -1]} scale={state.compactness} />
        <PiLobes x={300 + state.distance * 26} y={160} signs={state.phase === 'bonding' ? [1, -1] : [-1, 1]} scale={state.compactness} />
        <rect className="guided-meter-bg" x="520" y="104" width="170" height="24" rx="12" />
        <rect className="guided-meter-fill" x="520" y="104" width={Math.max(2, Math.abs(usefulOverlap) * 170)} height="24" rx="12" />
        <text className="guided-svg-label" x="520" y="152">useful overlap magnitude</text>
        <EnergyLevel x1={540} x2={630} y={220 - split * 28} label="upper" />
        <EnergyLevel x1={540} x2={630} y={260 + split * 28} label="lower" occupied />
      </svg>
    </div>
  );
}

function EnergyGapVisual({ state, setState }: { state: ControlState; setState: (patch: Partial<ControlState>) => void }) {
  const result = twoLevelMixing(state.energyGap, state.interaction);
  return (
    <div className="guided-visual-block">
      <div className="guided-control-row guided-control-row--stacked">
        <label>starting energy gap {state.energyGap.toFixed(2)} <input type="range" min="0" max="2.8" step="0.01" value={state.energyGap} onChange={(event) => setState({ energyGap: Number(event.currentTarget.value) })} /></label>
        <label>interaction / overlap {state.interaction.toFixed(2)} <input type="range" min="0.08" max="0.8" step="0.01" value={state.interaction} onChange={(event) => setState({ interaction: Number(event.currentTarget.value) })} /></label>
      </div>
      <svg className="guided-main-svg" viewBox="0 0 760 360" role="img" aria-label="Energy gap mixing model">
        <text className="guided-panel-title" x="34" y="36">Two-level mixing</text>
        <EnergyLevel x1={90} x2={170} y={160} label="A" occupied />
        <EnergyLevel x1={90} x2={170} y={160 + state.energyGap * 48} label="B lower" occupied />
        <EnergyLevel x1={560} x2={650} y={160 + result.lowerEnergy * 54 + 85} label="lower MO" occupied />
        <EnergyLevel x1={560} x2={650} y={160 - result.upperEnergy * 54 - 55} label="upper MO" />
        <line className="guided-mixing-line" x1="170" y1="160" x2="560" y2={160 + result.lowerEnergy * 54 + 85} />
        <line className="guided-mixing-line" x1="170" y1={160 + state.energyGap * 48} x2="560" y2={160 + result.lowerEnergy * 54 + 85} />
        <line className="guided-mixing-line" x1="170" y1="160" x2="560" y2={160 - result.upperEnergy * 54 - 55} />
        <line className="guided-mixing-line" x1="170" y1={160 + state.energyGap * 48} x2="560" y2={160 - result.upperEnergy * 54 - 55} />
        <foreignObject x="250" y="96" width="240" height="180">
          <div className="guided-mini-readout">
            <strong>Lower MO character</strong>
            <span>A: {percent(result.lowerA)}</span>
            <span>B: {percent(result.lowerB)}</span>
            <strong>Upper MO character</strong>
            <span>A: {percent(result.upperA)}</span>
            <span>B: {percent(result.upperB)}</span>
          </div>
        </foreignObject>
      </svg>
    </div>
  );
}

function PolarizationVisual({ state, setState }: { state: ControlState; setState: (patch: Partial<ControlState>) => void }) {
  const result = twoLevelMixing(state.electronegativity, 0.42);
  return (
    <div className="guided-visual-block">
      <div className="guided-control-row guided-control-row--stacked">
        <button type="button" onClick={() => setState({ electronegativity: 0 })}>C=C</button>
        <button type="button" onClick={() => setState({ electronegativity: 0.75 })}>C=N</button>
        <button type="button" onClick={() => setState({ electronegativity: 1.2 })}>C=O</button>
        <label>heteroatom energy lowering {state.electronegativity.toFixed(2)} <input type="range" min="0" max="2" step="0.01" value={state.electronegativity} onChange={(event) => setState({ electronegativity: Number(event.currentTarget.value) })} /></label>
      </div>
      <svg className="guided-main-svg" viewBox="0 0 760 340" role="img" aria-label="Polarized pi system model with phase labels">
        <text className="guided-panel-title" x="34" y="34">Polarized pi system</text>
        <text className="guided-svg-label" x="34" y="58">Lower pi MO: heteroatom character {percent(result.lowerB)}. Upper pi*: carbon character {percent(result.upperA)}.</text>
        <PiLobes x={250} y={162} signs={[1, -1]} scale={0.72} />
        <PiLobes x={390} y={162} signs={[1, -1]} scale={0.72 + result.lowerB * 0.32} />
        <text className="guided-svg-label" x="226" y="258">C</text>
        <text className="guided-svg-label" x="382" y="258">{state.electronegativity < 0.15 ? 'C' : 'X'}</text>
        <rect className="guided-meter-bg" x="520" y="95" width="180" height="22" rx="11" />
        <rect className="guided-meter-fill" x="520" y="95" width={180 * result.lowerB} height="22" rx="11" />
        <text className="guided-svg-label" x="520" y="137">lower pi MO toward lower-energy atom</text>
        <rect className="guided-meter-bg" x="520" y="185" width="180" height="22" rx="11" />
        <rect className="guided-meter-fill guided-meter-fill--accent" x="520" y="185" width={180 * result.upperA} height="22" rx="11" />
        <text className="guided-svg-label" x="520" y="227">pi* LUMO coefficient toward carbon</text>
      </svg>
    </div>
  );
}

function EthyleneFormaldehydeVisual({ state, setState }: { state: ControlState; setState: (patch: Partial<ControlState>) => void }) {
  const formaldehyde = state.molecule === 'formaldehyde';
  return (
    <div className="guided-visual-block">
      <div className="guided-control-row">
        <button type="button" className={!formaldehyde ? 'is-active' : ''} onClick={() => setState({ molecule: 'ethylene' })}>ethylene C=C</button>
        <button type="button" className={formaldehyde ? 'is-active' : ''} onClick={() => setState({ molecule: 'formaldehyde' })}>formaldehyde C=O</button>
      </div>
      <svg className="guided-main-svg" viewBox="0 0 760 360" role="img" aria-label="Ethylene formaldehyde comparison with phase labels">
        <text className="guided-panel-title" x="34" y="36">{formaldehyde ? 'Formaldehyde: same framework, polarized coefficients' : 'Ethylene: symmetric pi framework'}</text>
        <text className="guided-svg-label" x="34" y="62">HOMO: {formaldehyde ? 'oxygen lone-pair-type MO or polarized pi below it' : 'pi C=C'}</text>
        <text className="guided-svg-label" x="34" y="84">LUMO: {formaldehyde ? 'pi* with larger carbon coefficient' : 'symmetric pi*'}</text>
        <PiLobes x={250} y={170} signs={[1, -1]} scale={formaldehyde ? 1.05 : 0.94} />
        <PiLobes x={395} y={170} signs={[1, -1]} scale={formaldehyde ? 0.72 : 0.94} />
        <text className="guided-svg-label" x="244" y="266">C</text>
        <text className="guided-svg-label" x="388" y="266">{formaldehyde ? 'O' : 'C'}</text>
        <g transform="translate(540 95)">
          <text className="guided-svg-label" x="0" y="0">pi*</text>
          <PiLobes x={40} y={48} signs={[1, -1]} scale={formaldehyde ? 0.98 : 0.82} />
          <PiLobes x={120} y={48} signs={[-1, 1]} scale={formaldehyde ? 0.54 : 0.82} />
          <text className="guided-svg-label" x="0" y="132">large acceptor lobe on C</text>
        </g>
      </svg>
    </div>
  );
}

function TwistGeometryVisual({ state, setState }: { state: ControlState; setState: (patch: Partial<ControlState>) => void }) {
  const radians = (state.twist * Math.PI) / 180;
  const overlap = Math.max(0, Math.cos(radians));
  const separation = 1.8 * overlap;
  const flattenedScale = 0.25 + 0.75 * overlap;
  return (
    <div className="guided-visual-block">
      <div className="guided-control-row guided-control-row--stacked">
        <label>twist angle {state.twist.toFixed(0)}° <input type="range" min="0" max="90" step="1" value={state.twist} onChange={(event) => setState({ twist: Number(event.currentTarget.value) })} /></label>
        <button type="button" onClick={() => setState({ twist: 0 })}>aligned</button>
        <button type="button" onClick={() => setState({ twist: 90 })}>perpendicular</button>
      </div>
      <svg className="guided-main-svg" viewBox="0 0 760 340" role="img" aria-label="Twist angle and pi overlap model with phase labels">
        <text className="guided-panel-title" x="34" y="34">Pi overlap changes when one p orbital twists</text>
        <text className="guided-svg-label" x="34" y="58">Overlap ≈ cos(twist) = {overlap.toFixed(3)}; pi/pi* separation = {separation.toFixed(3)} teaching units</text>
        <PiLobes x={250} y={165} signs={[1, -1]} />
        <g transform={`translate(420 165) rotate(${state.twist * 0.35}) scale(${flattenedScale} 1)`}>
          <PiLobes x={0} y={0} signs={[1, -1]} />
        </g>
        <line className="guided-bond-axis" x1="250" x2="420" y1="165" y2="165" />
        <text className="guided-svg-label" x="226" y="270">p orbital A</text>
        <text className="guided-svg-label" x="386" y="270">p orbital B</text>
        {state.twist > 75 ? <text className="guided-svg-label" x="292" y="112">nearly no useful side-by-side overlap</text> : null}
        <rect className="guided-meter-bg" x="540" y="94" width="160" height="24" rx="12" />
        <rect className="guided-meter-fill" x="540" y="94" width={Math.max(2, overlap * 160)} height="24" rx="12" />
        <text className="guided-svg-label" x="540" y="145">alignment overlap</text>
        <EnergyLevel x1={555} x2={640} y={210 - separation * 24} label="pi*" />
        <EnergyLevel x1={555} x2={640} y={264 + separation * 24} label="pi" occupied />
      </svg>
    </div>
  );
}

function WalshGeometryVisual({ state, setState }: { state: ControlState; setState: (patch: Partial<ControlState>) => void }) {
  const keyOccupied = state.electrons === 8;
  const radical = state.electrons === 7;
  const stabilization = state.geometry * (keyOccupied ? 1.25 : radical ? 0.45 : 0);
  const penalty = state.geometry * 0.72;
  const preference = stabilization > penalty ? 'pyramidal / bent favored' : radical ? 'weak preference; substituents can decide' : 'planar favored';
  return (
    <div className="guided-visual-block">
      <div className="guided-control-row guided-control-row--stacked">
        <label>distortion from planar/linear {state.geometry.toFixed(2)} <input type="range" min="0" max="1" step="0.01" value={state.geometry} onChange={(event) => setState({ geometry: Number(event.currentTarget.value) })} /></label>
        <button type="button" className={state.electrons === 6 ? 'is-active' : ''} onClick={() => setState({ electrons: 6 })}>6 e−: BH3 / CH3+</button>
        <button type="button" className={state.electrons === 7 ? 'is-active' : ''} onClick={() => setState({ electrons: 7 })}>7 e−: radical</button>
        <button type="button" className={state.electrons === 8 ? 'is-active' : ''} onClick={() => setState({ electrons: 8 })}>8 e−: NH3 / CH3−</button>
      </div>
      <svg className="guided-main-svg" viewBox="0 0 760 340" role="img" aria-label="Walsh geometry model">
        <text className="guided-panel-title" x="34" y="34">Walsh-style geometry readout</text>
        <text className="guided-svg-label" x="34" y="58">Prediction: {preference}</text>
        <EnergyLevel x1={170} x2={250} y={98} label="virtual" />
        <EnergyLevel x1={170} x2={250} y={160} label="D p-type" occupied={state.electrons > 6} />
        <EnergyLevel x1={170} x2={250} y={232} label="A-C bonding" occupied />
        <EnergyLevel x1={510} x2={590} y={98 - state.geometry * 12} label="virtual" />
        <EnergyLevel x1={510} x2={590} y={160 + penalty * 40 - stabilization * 58} label="D' sigma(out)" occupied={state.electrons > 6} />
        <EnergyLevel x1={510} x2={590} y={232 + penalty * 30} label="A-C bonding" occupied />
        <text className="guided-svg-label" x="170" y="292">planar / linear</text>
        <text className="guided-svg-label" x="510" y="292">pyramidal / bent</text>
        <line className="guided-mixing-line" x1="250" y1="160" x2="510" y2={160 + penalty * 40 - stabilization * 58} />
      </svg>
    </div>
  );
}

function piPattern(atomCount: number, orbitalIndex: number): number[] {
  return Array.from({ length: atomCount }, (_, atomIndex) => {
    const amplitude = Math.sin(((orbitalIndex + 1) * (atomIndex + 1) * Math.PI) / (atomCount + 1));
    return amplitude;
  });
}

function PiChainVisual({ state, setState }: { state: ControlState; setState: (patch: Partial<ControlState>) => void }) {
  const orbitalIndex = clamp(state.orbitalIndex, 0, state.atomCount - 1);
  const amplitudes = piPattern(state.atomCount, orbitalIndex);
  const nodeCount = orbitalIndex;
  return (
    <div className="guided-visual-block">
      <div className="guided-control-row guided-control-row--stacked">
        <label>number of p orbitals {state.atomCount} <input type="range" min="2" max="6" step="1" value={state.atomCount} onChange={(event) => setState({ atomCount: Number(event.currentTarget.value), orbitalIndex: clamp(state.orbitalIndex, 0, Number(event.currentTarget.value) - 1) })} /></label>
        <label>MO index {orbitalIndex + 1} of {state.atomCount} <input type="range" min="1" max={state.atomCount} step="1" value={orbitalIndex + 1} onChange={(event) => setState({ orbitalIndex: Number(event.currentTarget.value) - 1 })} /></label>
      </div>
      <svg className="guided-main-svg" viewBox="0 0 760 330" role="img" aria-label="Linear pi chain model with phase labels">
        <text className="guided-panel-title" x="34" y="34">Linear pi chain: {state.atomCount} AOs make {state.atomCount} MOs</text>
        <text className="guided-svg-label" x="34" y="58">Selected MO has {nodeCount} internal node{nodeCount === 1 ? '' : 's'} in this simple chain model.</text>
        {amplitudes.map((amplitude, index) => {
          const x = 130 + index * (500 / Math.max(1, state.atomCount - 1));
          const scale = 0.45 + Math.abs(amplitude) * 0.48;
          const sign = amplitude >= 0 ? 1 : -1;
          return <PiLobes key={index} x={x} y={170} signs={[sign as 1 | -1, (-sign) as 1 | -1]} scale={scale} />;
        })}
        {amplitudes.slice(0, -1).map((amplitude, index) => {
          const changesSign = amplitude * amplitudes[index + 1] < 0;
          const x = 130 + (index + 0.5) * (500 / Math.max(1, state.atomCount - 1));
          return changesSign ? <g key={index}><rect className="guided-node-band" x={x - 4} y="88" width="8" height="164" rx="4" /><text className="guided-svg-label" x={x - 16} y="270">node</text></g> : null;
        })}
      </svg>
    </div>
  );
}

function CalculationVisual({ state, setState }: { state: ControlState; setState: (patch: Partial<ControlState>) => void }) {
  const featureCopy = {
    nodes: 'The node pattern is the first check: does the calculated surface put zero amplitude where the cartoon predicts cancellation?',
    phase: 'The phase pattern is the second check: do neighboring lobes have the predicted relative sign?',
    coefficients: 'The coefficient check asks where the larger lobes or larger contributions are located.',
  }[state.calculationFeature];
  return (
    <div className="guided-visual-block">
      <div className="guided-control-row">
        <button type="button" className={state.calculationFeature === 'nodes' ? 'is-active' : ''} onClick={() => setState({ calculationFeature: 'nodes' })}>nodes</button>
        <button type="button" className={state.calculationFeature === 'phase' ? 'is-active' : ''} onClick={() => setState({ calculationFeature: 'phase' })}>phase</button>
        <button type="button" className={state.calculationFeature === 'coefficients' ? 'is-active' : ''} onClick={() => setState({ calculationFeature: 'coefficients' })}>coefficients</button>
      </div>
      <svg className="guided-main-svg" viewBox="0 0 760 330" role="img" aria-label="Qualitative versus calculated orbital comparison with phase labels">
        <text className="guided-panel-title" x="34" y="34">Compare the chemically meaningful features</text>
        <text className="guided-svg-label" x="34" y="60">{featureCopy}</text>
        <rect className="guided-comparison-panel" x="84" y="90" width="250" height="190" rx="18" />
        <text className="guided-panel-title guided-panel-title--small" x="108" y="126">qualitative cartoon</text>
        <PiLobes x={180} y={190} signs={[1, -1]} />
        <PiLobes x={258} y={190} signs={[-1, 1]} />
        <rect className="guided-node-band" x="216" y="126" width="8" height="128" rx="4" />
        <rect className="guided-comparison-panel" x="430" y="90" width="250" height="190" rx="18" />
        <text className="guided-panel-title guided-panel-title--small" x="454" y="126">calculated-style surface</text>
        <SoftLobe cx={510} cy={185} rx={56} ry={78} sign={1} />
        <SoftLobe cx={602} cy={185} rx={56} ry={78} sign={-1} />
        <rect className="guided-node-band" x="553" y="120" width="10" height="136" rx="5" />
      </svg>
    </div>
  );
}

function VisualPanel({ visual, state, setState }: { visual: VisualKind; state: ControlState; setState: (patch: Partial<ControlState>) => void }) {
  if (visual === 'bonding') return <BondingVisual state={state} setState={setState} />;
  if (visual === 'overlap') return <OverlapVisual state={state} setState={setState} />;
  if (visual === 'energy-gap') return <EnergyGapVisual state={state} setState={setState} />;
  if (visual === 'polarization') return <PolarizationVisual state={state} setState={setState} />;
  if (visual === 'ethylene-formaldehyde') return <EthyleneFormaldehydeVisual state={state} setState={setState} />;
  if (visual === 'twist-geometry') return <TwistGeometryVisual state={state} setState={setState} />;
  if (visual === 'walsh-geometry') return <WalshGeometryVisual state={state} setState={setState} />;
  if (visual === 'pi-chain') return <PiChainVisual state={state} setState={setState} />;
  return <CalculationVisual state={state} setState={setState} />;
}

function interactionSummaryFor(visual: VisualKind, state: ControlState): string {
  if (visual === 'bonding') return `phase=${state.phase}; interaction=${state.interaction.toFixed(2)}`;
  if (visual === 'overlap') return `phase=${state.phase}; distance=${state.distance.toFixed(2)}; compactness=${state.compactness.toFixed(2)}`;
  if (visual === 'energy-gap') return `energyGap=${state.energyGap.toFixed(2)}; interaction=${state.interaction.toFixed(2)}`;
  if (visual === 'polarization') return `heteroatomEnergyLowering=${state.electronegativity.toFixed(2)}`;
  if (visual === 'ethylene-formaldehyde') return `molecule=${state.molecule}`;
  if (visual === 'twist-geometry') return `twist=${state.twist.toFixed(0)}deg`;
  if (visual === 'walsh-geometry') return `distortion=${state.geometry.toFixed(2)}; electrons=${state.electrons}`;
  if (visual === 'pi-chain') return `atomCount=${state.atomCount}; orbitalIndex=${state.orbitalIndex + 1}`;
  return `comparisonFeature=${state.calculationFeature}`;
}

function GoingDeeperPanels({ panels }: { panels?: GoingDeeperPanelData[] }) {
  if (!panels?.length) return null;
  return (
    <div className="guided-going-deeper-list">
      {panels.map((panel) => (
        <details className="guided-going-deeper" key={panel.title}>
          <summary>Going deeper: {panel.title}</summary>
          <p>{panel.body}</p>
          {panel.terms?.length ? (
            <dl>
              {panel.terms.map((term) => (
                <div key={term.term}>
                  <dt>{term.term}</dt>
                  <dd>{term.meaning}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </details>
      ))}
    </div>
  );
}

export function GuidedOrbitalLesson({ lessonId, ...props }: LessonComponentProps & { lessonId: GuidedRestLessonId }) {
  const lesson = guidedLessonContent[lessonId];
  const [stageIndex, setStageIndex] = useState(0);
  const [state, setStateInternal] = useState<ControlState>(defaultState);
  const stage = lesson.stages[stageIndex];
  const atFirstStage = stageIndex === 0;
  const atLastStage = stageIndex === lesson.stages.length - 1;

  const setState = (patch: Partial<ControlState>) => setStateInternal((current) => ({ ...current, ...patch }));
  const chooseStage = (index: number) => setStageIndex(clamp(index, 0, lesson.stages.length - 1));
  const previous = () => {
    if (!atFirstStage) {
      chooseStage(stageIndex - 1);
      return;
    }
    props.onPrevious();
  };
  const next = () => {
    if (!atLastStage) {
      chooseStage(stageIndex + 1);
      return;
    }
    props.onNext();
  };
  const nextFromBottom = () => {
    next();
    scrollToPageTop();
  };
  const previousFromBottom = () => {
    previous();
    scrollToPageTop();
  };

  const interactionSummary = useMemo(() => interactionSummaryFor(lesson.visual, state), [lesson.visual, state]);

  const feedback = `${stage.title}: ${stage.correction} Current interaction state: ${interactionSummary}.`;

  return (
    <LessonShell
      {...props}
      purpose={lesson.purpose}
      question={lesson.question}
      feedback={feedback}
      showPhaseLegend
      showLearningCycle
    >
      <div className="guided-rest-lesson">
        <nav className="guided-stage-nav" aria-label="Lesson steps">
          {lesson.stages.map((item, index) => (
            <button
              type="button"
              key={item.id}
              onClick={() => chooseStage(index)}
              aria-current={index === stageIndex ? 'step' : undefined}
            >
              <span>{index + 1}</span>
              {item.shortTitle}
            </button>
          ))}
        </nav>

        <section className="guided-stage-card">
          <span>Step {stageIndex + 1} of {lesson.stages.length}</span>
          <h2>{stage.title}</h2>
          <p>{stage.lead}</p>
          <div className="guided-equation-strip">{stage.equation}</div>
          <p className="guided-correction">Do not read it this way: {stage.correction}</p>
        </section>

        <GoingDeeperPanels panels={stage.goingDeeper} />

        <VisualPanel visual={lesson.visual} state={state} setState={setState} />

        <AssessmentCard
          meta={props.meta}
          mode="practice"
          sectionId="checkpoint"
          sectionTitle="Embedded checkpoint"
          sectionLead={lesson.checkpointLead}
          items={lesson.checkpoints}
          interactionSummary={interactionSummary}
        />

        <section className="guided-explain-card">
          <h3>Explain the screen before moving on</h3>
          <p>
            Write one sentence that links what you changed to what happened in the orbital picture. Then write one sentence that states the chemical consequence. This is the bridge from manipulation to understanding.
          </p>
        </section>

        <AssessmentCard
          meta={props.meta}
          mode="graded"
          sectionId="end-of-lesson"
          sectionTitle="End-of-lesson submitted assessment"
          sectionLead={lesson.endLead}
          items={lesson.endItems}
          interactionSummary={interactionSummary}
        />

        <div className="guided-bottom-nav">
          <button type="button" onClick={previousFromBottom}>{atFirstStage ? 'Previous lesson' : 'Back one idea'}</button>
          <span>Step {stageIndex + 1} of {lesson.stages.length}</span>
          <button type="button" onClick={nextFromBottom}>{atLastStage ? 'Next lesson' : 'Continue'}</button>
        </div>
      </div>
    </LessonShell>
  );
}
