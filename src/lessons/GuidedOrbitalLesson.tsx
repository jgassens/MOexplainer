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
  bondingElectrons: 2 | 4;
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
  bondingElectrons: 2,
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

function signedDecimal(value: number): string {
  if (Math.abs(value) < 0.005) return '0.00';
  return `${value > 0 ? '+' : '−'}${Math.abs(value).toFixed(2)}`;
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
  const centerA = 0.6;
  const centerB = bonding ? 0.6 : -0.6;
  const centerPsi = centerA + centerB;
  const centerDensity = centerPsi ** 2;
  const lowerShift = -0.72 * state.interaction;
  const upperShift = 1.08 * state.interaction;
  const energySplit = upperShift - lowerShift;
  const netEnergy = 2 * lowerShift + (state.bondingElectrons === 4 ? 2 * upperShift : 0);
  const energyLabel = netEnergy < 0 ? 'net stabilizing' : 'net destabilizing';
  const energyCopy =
    state.bondingElectrons === 2
      ? 'Two electrons occupy only the lower bonding MO, so the interaction makes a bond.'
      : 'Four electrons fill both MOs. The antibonding rise is larger, so the filled-filled interaction is repulsive.';
  const lowerY = 250 - lowerShift * 62;
  const upperY = 170 - upperShift * 62;
  const bridgeOpacity = 0.28;
  const interactionFill = ((state.interaction - 0.18) / (0.95 - 0.18)) * 100;
  return (
    <div className="guided-visual-block">
      <div className="guided-control-row bonding-control-row" aria-label="Bonding and antibonding controls">
        <div className="bonding-control-group">
          <span className="bonding-control-heading">Combination to inspect</span>
          <div className="bonding-button-group">
            <button type="button" className={bonding ? 'is-active' : ''} onClick={() => setState({ phase: 'bonding' })}>show ψ+ bonding</button>
            <button type="button" className={!bonding ? 'is-active' : ''} onClick={() => setState({ phase: 'antibonding' })}>show ψ− antibonding</button>
          </div>
        </div>
        <label className="bonding-slider-control">
          <span>interaction strength <strong>{state.interaction.toFixed(2)}</strong></span>
          <input type="range" min="0.18" max="0.95" step="0.01" value={state.interaction} onChange={(event) => setState({ interaction: Number(event.currentTarget.value) })} />
          <em className="bonding-slider-note">This slider changes the teaching-model interaction, not bond length and not orbital-cloud size. A stronger interaction widens the ψ+/ψ− energy split.</em>
        </label>
        <div className="bonding-control-group">
          <span className="bonding-control-heading">Electron count</span>
          <div className="bonding-button-group">
            <button type="button" className={state.bondingElectrons === 2 ? 'is-active' : ''} onClick={() => setState({ bondingElectrons: 2 })}>2 e−: bonding MO occupied</button>
            <button type="button" className={state.bondingElectrons === 4 ? 'is-active' : ''} onClick={() => setState({ bondingElectrons: 4 })}>4 e−: both MOs occupied</button>
          </div>
        </div>
      </div>

      <div className="bonding-readout-grid" aria-label="Bonding and antibonding orbital mixing readouts">
        <div className="bonding-readout-card">
          <span>Signed addition at the bond center</span>
          <strong>{signedDecimal(centerA)} + {signedDecimal(centerB)} = {signedDecimal(centerPsi)}</strong>
          <p>{bonding ? 'Same phase gives a large wave amplitude between nuclei.' : 'Opposite phase cancels the wave amplitude between nuclei.'}</p>
        </div>
        <div className="bonding-readout-card">
          <span>Then square ψ to see density</span>
          <strong>|ψ|² = {centerDensity.toFixed(2)}</strong>
          <p>{bonding ? 'Density builds in the bonding region.' : 'Zero density at the center marks a node.'}</p>
        </div>
        <div className="bonding-readout-card">
          <span>What the slider changes</span>
          <strong>energy split = {energySplit.toFixed(2)} teaching units</strong>
          <p>Stronger interaction separates ψ+ and ψ− more. It does not make the bond breathe.</p>
        </div>
        <div className={`bonding-readout-card ${netEnergy > 0 ? 'is-destabilizing' : 'is-stabilizing'}`}>
          <span>Electron occupancy decides the consequence</span>
          <strong>{energyLabel}: {signedDecimal(netEnergy)} teaching units</strong>
          <p>{energyCopy}</p>
        </div>
      </div>

      <svg className="guided-main-svg bonding-mixing-svg bonding-mixing-svg--desktop" viewBox="0 0 920 450" role="img" aria-label="Orbital mixing workbench showing signed addition, density, node, and bonding-antibonding energy pair">
        <defs>
          <marker id="bonding-arrowhead" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="strokeWidth">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#8c8175" />
          </marker>
        </defs>
        <text className="guided-panel-title" x="28" y="34">Two starting orbitals make two molecular orbitals</text>
        <text className="guided-svg-label" x="28" y="58">The selected combination is {bonding ? 'ψ+ = φA + φB, the lower bonding MO.' : 'ψ− = φA − φB, the higher antibonding MO with a node.'}</text>

        <rect className="bonding-panel-bg" x="28" y="82" width="285" height="318" rx="18" />
        <text className="guided-panel-title guided-panel-title--small" x="50" y="118">1. Start with two p orbitals</text>
        <PiLobes x={125} y={230} signs={[1, -1]} scale={0.9} />
        <PiLobes x={230} y={230} signs={bonding ? [1, -1] : [-1, 1]} scale={0.9} />
        <text className="guided-svg-label" x="104" y="326">φA</text>
        <text className="guided-svg-label" x="212" y="326">{bonding ? 'φB' : '−φB'}</text>
        <line className="guided-bond-axis" x1="92" x2="263" y1="230" y2="230" />
        <circle className="bonding-center-probe" cx="178" cy="230" r="12" />
        <text className="guided-svg-label" x="84" y="365">read the signs where the orbitals meet</text>

        <path className="bonding-flow-arrow" d="M 330 230 C 358 230, 378 230, 406 230" />
        <text className="guided-svg-label" x="338" y="207">add ψ values</text>

        <rect className="bonding-panel-bg" x="422" y="82" width="215" height="318" rx="18" />
        <text className="guided-panel-title guided-panel-title--small" x="444" y="118">2. Resulting MO</text>
        <text className="guided-svg-label" x="444" y="142">{bonding ? 'constructive overlap' : 'destructive overlap'}</text>
        {bonding ? (
          <g>
            <ellipse className="guided-density-bridge" cx="529" cy="230" rx="92" ry="58" style={{ opacity: bridgeOpacity }} />
            <PiLobes x={485} y={230} signs={[1, -1]} scale={0.78} />
            <PiLobes x={573} y={230} signs={[1, -1]} scale={0.78} />
            <text className="bonding-result-label" x="529" y="331">density between nuclei</text>
          </g>
        ) : (
          <g>
            <PiLobes x={485} y={230} signs={[1, -1]} scale={0.78} />
            <PiLobes x={573} y={230} signs={[-1, 1]} scale={0.78} />
            <rect className="guided-node-band" x="523" y="146" width="12" height="170" rx="6" />
            <text className="bonding-result-label" x="500" y="335">node: ψ = 0</text>
          </g>
        )}
        <line className="guided-bond-axis" x1="455" x2="603" y1="230" y2="230" />

        <path className="bonding-flow-arrow" d="M 650 230 C 676 230, 696 230, 722 230" />
        <text className="guided-svg-label" x="660" y="207">place electrons</text>

        <rect className="bonding-panel-bg" x="736" y="82" width="156" height="318" rx="18" />
        <text className="guided-panel-title guided-panel-title--small" x="758" y="118">3. Energy pair</text>
        <line className="guided-energy-axis" x1="758" x2="758" y1="145" y2="338" />
        <text className="guided-svg-label" x="744" y="137">energy</text>
        <line className="bonding-starting-level" x1="772" x2="820" y1="226" y2="226" />
        <text className="guided-svg-label" x="775" y="218">φA, φB</text>
        <line className="guided-mixing-line" x1="820" x2="862" y1="226" y2={upperY} />
        <line className="guided-mixing-line" x1="820" x2="862" y1="226" y2={lowerY} />
        <EnergyLevel x1={830} x2={880} y={upperY} label="ψ−" occupied={state.bondingElectrons === 4} />
        <EnergyLevel x1={830} x2={880} y={lowerY} label="ψ+" occupied />
        <text className="guided-svg-label" x="758" y="350">interaction</text>
        <rect className="guided-meter-bg" x="758" y="360" width="108" height="14" rx="7" />
        <rect className="guided-meter-fill" x="758" y="360" width={Math.max(6, interactionFill * 1.08)} height="14" rx="7" />
        <text className="guided-svg-label" x="758" y="393">{state.bondingElectrons} electrons: {energyLabel}</text>
      </svg>

      <svg className="guided-main-svg bonding-mixing-svg bonding-mixing-svg--mobile" viewBox="0 0 360 820" role="img" aria-label="Stacked orbital mixing workbench showing signed addition, density, node, and bonding-antibonding energy pair">
        <defs>
          <marker id="bonding-arrowhead-mobile" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="strokeWidth">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#8c8175" />
          </marker>
        </defs>
        <text className="guided-panel-title guided-panel-title--small" x="18" y="30">Two starting orbitals make two MOs</text>
        <text className="guided-svg-label" x="18" y="52">{bonding ? 'ψ+ adds at the bond center.' : 'ψ− cancels at the bond center.'}</text>

        <rect className="bonding-panel-bg" x="18" y="70" width="324" height="190" rx="16" />
        <text className="guided-panel-title guided-panel-title--small" x="36" y="102">1. Read the signs</text>
        <PiLobes x={112} y={166} signs={[1, -1]} scale={0.86} />
        <PiLobes x={244} y={166} signs={bonding ? [1, -1] : [-1, 1]} scale={0.86} />
        <line className="guided-bond-axis" x1="78" x2="276" y1="166" y2="166" />
        <circle className="bonding-center-probe" cx="178" cy="166" r="12" />
        <text className="guided-svg-label" x="85" y="230">φA</text>
        <text className="guided-svg-label" x="225" y="230">{bonding ? 'φB' : '−φB'}</text>
        <text className="guided-svg-label" x="36" y="244">{signedDecimal(centerA)} + {signedDecimal(centerB)} = {signedDecimal(centerPsi)}</text>

        <path className="bonding-flow-arrow" markerEnd="url(#bonding-arrowhead-mobile)" d="M 180 274 C 180 290, 180 304, 180 320" />
        <text className="guided-svg-label" x="196" y="302">add ψ</text>

        <rect className="bonding-panel-bg" x="18" y="334" width="324" height="205" rx="16" />
        <text className="guided-panel-title guided-panel-title--small" x="36" y="366">2. Square the result</text>
        <text className="guided-svg-label" x="36" y="389">|ψ|² = {centerDensity.toFixed(2)}</text>
        {bonding ? (
          <g>
            <ellipse className="guided-density-bridge" cx="180" cy="448" rx="72" ry="50" style={{ opacity: bridgeOpacity }} />
            <PiLobes x={124} y={448} signs={[1, -1]} scale={0.76} />
            <PiLobes x={236} y={448} signs={[1, -1]} scale={0.76} />
            <text className="bonding-result-label" x="180" y="515" textAnchor="middle">density between nuclei</text>
          </g>
        ) : (
          <g>
            <PiLobes x={124} y={448} signs={[1, -1]} scale={0.76} />
            <PiLobes x={236} y={448} signs={[-1, 1]} scale={0.76} />
            <rect className="guided-node-band" x="173" y="380" width="14" height="136" rx="7" />
            <text className="bonding-result-label" x="180" y="520" textAnchor="middle">node: ψ = 0</text>
          </g>
        )}

        <path className="bonding-flow-arrow" markerEnd="url(#bonding-arrowhead-mobile)" d="M 180 554 C 180 570, 180 584, 180 600" />
        <text className="guided-svg-label" x="196" y="582">place e−</text>

        <rect className="bonding-panel-bg" x="18" y="614" width="324" height="178" rx="16" />
        <text className="guided-panel-title guided-panel-title--small" x="36" y="646">3. Energy pair</text>
        <line className="guided-energy-axis" x1="62" x2="62" y1="668" y2="760" />
        <text className="guided-svg-label" x="36" y="664">energy</text>
        <line className="bonding-starting-level" x1="96" x2="156" y1="714" y2="714" />
        <text className="guided-svg-label" x="98" y="704">φA, φB</text>
        <line className="guided-mixing-line" x1="156" x2="226" y1="714" y2={660 + (upperY - 130) * 0.48} />
        <line className="guided-mixing-line" x1="156" x2="226" y1="714" y2={700 + (lowerY - 230) * 0.48} />
        <EnergyLevel x1={220} x2={286} y={660 + (upperY - 130) * 0.48} label="ψ−" occupied={state.bondingElectrons === 4} />
        <EnergyLevel x1={220} x2={286} y={700 + (lowerY - 230) * 0.48} label="ψ+" occupied />
        <text className="guided-svg-label" x="36" y="764">split = {energySplit.toFixed(2)} teaching units</text>
        <text className="guided-svg-label" x="36" y="784">{state.bondingElectrons} electrons: {energyLabel}</text>
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
