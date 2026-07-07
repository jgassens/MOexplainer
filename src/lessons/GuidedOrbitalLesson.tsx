import { useMemo, useState, type MouseEvent, type ReactNode } from 'react';
import { AssessmentCard } from '../components/Assessment';
import { LessonShell } from '../components/LessonShell/LessonShell';
import { NoticeCard } from '../components/LessonShell/NoticeCard';
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

type SetControlState = (patch: Partial<ControlState>) => void;

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

function BondingEquationChooser({ state, setState }: { state: ControlState; setState: SetControlState }) {
  const bonding = state.phase === 'bonding';
  return (
    <div className="guided-equation-strip guided-equation-strip--interactive" aria-label="Choose the molecular orbital equation to inspect">
      <div className="guided-equation-options">
        <button type="button" className={bonding ? 'is-active' : ''} onClick={() => setState({ phase: 'bonding' })}>
          ψ+ = N(φA + φB)
        </button>
        <button type="button" className={!bonding ? 'is-active' : ''} onClick={() => setState({ phase: 'antibonding' })}>
          ψ− = N(φA − φB)
        </button>
      </div>
      <p>
        Two p atomic orbitals are the starting functions, φA and φB. A molecular orbital is made by adding or subtracting their signed amplitudes at every point in space. The in-phase combination, ψ+ = N(φA + φB), builds amplitude between the nuclei and gives a π bonding MO. The out-of-phase combination, ψ− = N(φA − φB), cancels between the nuclei and gives a node, producing a π* antibonding MO. The colors only mark relative phase; the absolute choice of color is arbitrary.
      </p>
    </div>
  );
}

function RotatingPiLobes({
  angle,
  scale = 1,
  signs,
  x,
  y,
}: {
  angle: number;
  scale?: number;
  signs: [1 | -1, 1 | -1];
  x: number;
  y: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <PiLobes x={0} y={0} signs={signs} scale={scale} />
    </g>
  );
}

function overlapLabelFor(overlap: number): string {
  if (overlap < 0.06) return 'zero';
  if (overlap < 0.34) return 'low';
  if (overlap < 0.72) return 'medium';
  return 'high';
}

function BondingVisual({ state, setState, onReviewPrevious }: { state: ControlState; setState: SetControlState; onReviewPrevious: () => void }) {
  const bonding = state.phase === 'bonding';
  const twistDegrees = state.twist;
  const overlap = clamp(Math.cos((twistDegrees * Math.PI) / 180), 0, 1);
  const overlapLabel = overlapLabelFor(overlap);
  const sampleMagnitude = 0.6 * overlap;
  const centerA = sampleMagnitude;
  const centerB = bonding ? sampleMagnitude : -sampleMagnitude;
  const centerPsi = centerA + centerB;
  const centerDensity = centerPsi ** 2;
  const lowerShift = -0.72 * overlap;
  const upperShift = 1.08 * overlap;
  const energySplit = upperShift - lowerShift;
  const netEnergy = 2 * lowerShift + (state.bondingElectrons === 4 ? 2 * upperShift : 0);
  const energyLabel = Math.abs(netEnergy) < 0.01 ? 'no net π bonding' : netEnergy < 0 ? 'net stabilizing' : 'net destabilizing';
  const energyCopy =
    overlap < 0.06
      ? 'At this twist the π overlap is essentially zero, so ψ+ and ψ− are nearly degenerate and there is little π bonding benefit to occupy.'
      : state.bondingElectrons === 2
        ? 'Both MOs exist. Two electrons fill only ψ+, so the filled bonding level makes the interaction stabilizing.'
        : 'Both MOs exist and both are filled. The ψ− antibonding penalty removes the bonding benefit and is net destabilizing in this teaching model.';
  const lowerY = 230 + 42 * overlap;
  const upperY = 230 - 42 * overlap;
  const lowerYMobile = 758 + 34 * overlap;
  const upperYMobile = 758 - 34 * overlap;
  const bridgeOpacity = overlap < 0.06 ? 0.03 : 0.16 + overlap * 0.42;
  const nodeOpacity = overlap < 0.06 ? 0.14 : 0.44 + overlap * 0.34;
  const overlapMeter = overlap * 100;
  const reviewPreviousLesson = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    onReviewPrevious();
  };
  const activeMoLabel = bonding ? 'ψ+ π bonding' : 'ψ− π* antibonding';
  const sampleEquationLabel = bonding ? 'ψ+(sample) = N[φA + φB]' : 'ψ−(sample) = N[φA − φB]';
  const centerBLabel = bonding ? 'φB(sample)' : '−φB(sample)';
  const densityCopy =
    overlap < 0.06
      ? 'At 90° twist, there is essentially no shared π-overlap sample to square.'
      : bonding
        ? 'density builds in the bonding region'
        : 'a node forms between the nuclei';
  return (
    <div className="guided-visual-block">
      <div className="guided-control-row bonding-control-row" aria-label="Bonding and antibonding controls">
        <div className="bonding-control-group">
          <span className="bonding-control-heading">Combination to inspect</span>
          <div className="bonding-button-group">
            <button type="button" className={bonding ? 'is-active' : ''} onClick={() => setState({ phase: 'bonding' })}>show ψ+ π bonding</button>
            <button type="button" className={!bonding ? 'is-active' : ''} onClick={() => setState({ phase: 'antibonding' })}>show ψ− π* antibonding</button>
          </div>
        </div>
        <label className="bonding-slider-control">
          <span>p-orbital twist angle / π overlap <strong>{twistDegrees.toFixed(0)}°</strong></span>
          <input
            type="range"
            min="0"
            max="90"
            step="1"
            value={twistDegrees}
            aria-label="p-orbital twist angle / pi overlap"
            onChange={(event) => setState({ twist: Number(event.currentTarget.value) })}
          />
          <strong className="bonding-slider-value">relative overlap S ≈ cos({twistDegrees.toFixed(0)}°) = {overlap.toFixed(2)}; energy split ∝ |S|</strong>
          <em className="bonding-slider-note">Twisting the p orbitals changes overlap, not phase. Parallel p orbitals have maximum π overlap. As the orbitals twist toward perpendicular, overlap decreases and the ψ+/ψ− energy split shrinks.</em>
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
          <span>Pointwise AO amplitudes</span>
          <strong>{signedDecimal(centerA)} + {signedDecimal(centerB)} = {signedDecimal(centerPsi)}</strong>
          <p>
            At this marked point, the MO amplitude is calculated from the signed AO amplitudes. For ψ+, add φA and φB. For ψ−, subtract them. After the MO amplitude is formed, square it to get electron density.{' '}
            <a href="#lesson-2-combine-values" onClick={reviewPreviousLesson}>Review Lesson 2.</a>
          </p>
        </div>
        <div className="bonding-readout-card">
          <span>From one point to the whole orbital</span>
          <strong>|ψ|² = {centerDensity.toFixed(2)}</strong>
          <p>The sample point shows the local arithmetic. The real MO is obtained by doing the same signed combination at every point in space. If the signs reinforce throughout the bond region, electron density connects the atoms. If the signs cancel between the atoms, a node separates the lobes.</p>
        </div>
        <div className="bonding-readout-card">
          <span>Twist changes overlap, not the phase rule</span>
          <strong>twist = {twistDegrees.toFixed(0)}°; S ≈ {overlap.toFixed(2)}</strong>
          <p>Parallel p orbitals have strong π overlap. Twisting one p orbital toward perpendicular reduces overlap and shrinks the ψ+/ψ− energy gap. At 90°, the π overlap is essentially zero. The bonding vs antibonding distinction still comes from the + or − linear combination.</p>
        </div>
        <div className={`bonding-readout-card ${netEnergy > 0 ? 'is-destabilizing' : 'is-stabilizing'}`}>
          <span>Electron occupancy decides the consequence</span>
          <strong>{energyLabel}: {signedDecimal(netEnergy)} arbitrary relative energy units</strong>
          <p>{energyCopy}</p>
        </div>
      </div>

      <svg className="guided-main-svg bonding-mixing-svg bonding-mixing-svg--desktop" viewBox="0 0 940 520" role="img" aria-label="Orbital mixing workbench showing twisted p atomic orbitals, pointwise signed amplitudes, and the pi/pi star energy pair">
        <defs>
          <marker id="bonding-arrowhead" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="strokeWidth">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#8c8175" />
          </marker>
        </defs>
        <text className="guided-panel-title" x="28" y="34">Relative phase chooses ψ+ or ψ−; twist controls overlap and energy splitting</text>
        <text className="guided-svg-label" x="28" y="58">Selected combination: {activeMoLabel}. Twist stays {twistDegrees.toFixed(0)}° when you switch phase.</text>

        <rect className="bonding-panel-bg" x="24" y="82" width="280" height="392" rx="18" />
        <text className="guided-panel-title guided-panel-title--small" x="44" y="116">1. Starting AOs and twist</text>
        <text className="guided-svg-label" x="44" y="140">φA fixed; φB rotates</text>
        <line className="guided-bond-axis" x1="78" x2="252" y1="248" y2="248" />
        <circle className="bonding-center-probe" cx="165" cy="248" r="11" />
        <PiLobes x={106} y={248} signs={[1, -1]} scale={0.86} />
        <RotatingPiLobes x={224} y={248} signs={[1, -1]} scale={0.86} angle={twistDegrees} />
        <path className="bonding-rotation-arc" d="M 205 171 A 84 84 0 0 1 280 248" />
        <text className="guided-svg-label" x="75" y="354">φA</text>
        <text className="guided-svg-label" x="205" y="354">φB</text>
        <text className="bonding-result-label" x="44" y="386">π overlap {overlapLabel}</text>
        <text className="guided-svg-label" x="44" y="410">twist angle = {twistDegrees.toFixed(0)}°</text>
        <text className="guided-svg-label" x="44" y="432">relative overlap S ≈ cos({twistDegrees.toFixed(0)}°) = {overlap.toFixed(2)}</text>
        <rect className="guided-meter-bg" x="44" y="444" width="214" height="14" rx="7" />
        <rect className="guided-meter-fill" x="44" y="444" width={Math.max(0, overlapMeter * 2.14)} height="14" rx="7" />

        <path className="bonding-flow-arrow" d="M 314 248 C 328 248, 338 248, 352 248" />
        <text className="guided-svg-label" x="313" y="225">sample φ values</text>

        <rect className="bonding-panel-bg" x="362" y="82" width="252" height="392" rx="18" />
        <text className="guided-panel-title guided-panel-title--small" x="382" y="116">2. Signed amplitude at one point</text>
        <text className="guided-svg-label" x="382" y="145">{sampleEquationLabel}</text>
        <text className="bonding-sample-line" x="382" y="186">φA(sample) = {signedDecimal(centerA)}</text>
        <text className="bonding-sample-line" x="382" y="216">{centerBLabel} = {signedDecimal(centerB)}</text>
        <text className="bonding-sample-line bonding-sample-line--result" x="382" y="262">{signedDecimal(centerA)} + {signedDecimal(centerB)} = {signedDecimal(centerPsi)}</text>
        <text className="bonding-sample-line" x="382" y="300">density = |ψ|² = {centerDensity.toFixed(2)}</text>
        <text className="guided-svg-label" x="382" y="336">{densityCopy}</text>
        <text className="guided-svg-label" x="382" y="386">This is one marked point only.</text>
        <text className="guided-svg-label" x="382" y="410">The full MO repeats the same signed</text>
        <text className="guided-svg-label" x="382" y="432">combination throughout space.</text>

        <path className="bonding-flow-arrow" d="M 624 248 C 638 248, 648 248, 662 248" />
        <text className="guided-svg-label" x="623" y="225">form both MOs</text>

        <rect className="bonding-panel-bg" x="672" y="82" width="244" height="392" rx="18" />
        <text className="guided-panel-title guided-panel-title--small" x="692" y="116">3. Two MOs and energy splitting</text>
        <text className="guided-svg-label" x="692" y="140">splitting ∝ |S| = {overlap.toFixed(2)}</text>
        <g>
          <rect className={`bonding-mo-row-bg ${bonding ? 'is-selected' : ''}`} x="690" y="158" width="118" height="92" rx="14" />
          <text className="bonding-result-label" x="704" y="180">ψ+ π</text>
          <ellipse className="guided-density-bridge" cx="750" cy="215" rx="44" ry="22" style={{ opacity: bridgeOpacity }} />
          <line className="guided-bond-axis" x1="710" x2="790" y1="215" y2="215" />
          <PiLobes x={726} y={215} signs={[1, -1]} scale={0.32} />
          <PiLobes x={775} y={215} signs={[1, -1]} scale={0.32} />
        </g>
        <g>
          <rect className={`bonding-mo-row-bg ${!bonding ? 'is-selected' : ''}`} x="690" y="264" width="118" height="98" rx="14" />
          <text className="bonding-result-label" x="704" y="286">ψ− π*</text>
          <line className="guided-bond-axis" x1="710" x2="790" y1="322" y2="322" />
          <PiLobes x={726} y={322} signs={[1, -1]} scale={0.32} />
          <PiLobes x={775} y={322} signs={[-1, 1]} scale={0.32} />
          <rect className="guided-node-band" x="746" y="292" width="10" height="62" rx="5" style={{ opacity: nodeOpacity }} />
        </g>
        <line className="guided-energy-axis" x1="835" x2="835" y1="172" y2="358" />
        <text className="guided-svg-label" x="821" y="164">energy</text>
        <line className="bonding-starting-level" x1="846" x2="880" y1="230" y2="230" />
        <text className="guided-svg-label" x="842" y="222">φA, φB</text>
        <line className="guided-mixing-line" x1="878" x2="892" y1="230" y2={upperY} />
        <line className="guided-mixing-line" x1="878" x2="892" y1="230" y2={lowerY} />
        <rect className="bonding-selected-energy" x="884" y={(bonding ? lowerY : upperY) - 18} width="42" height="28" rx="14" />
        <EnergyLevel x1={890} x2={914} y={upperY} label="ψ−" occupied={state.bondingElectrons === 4} />
        <EnergyLevel x1={890} x2={914} y={lowerY} label="ψ+" occupied />
        <text className="guided-svg-label" x="692" y="404">energy split = {energySplit.toFixed(2)}</text>
        <text className="guided-svg-label" x="692" y="426">arbitrary relative energy units</text>
        <text className="guided-svg-label" x="692" y="450">{state.bondingElectrons} e−: {energyLabel}</text>
      </svg>

      <svg className="guided-main-svg bonding-mixing-svg bonding-mixing-svg--mobile" viewBox="0 0 360 980" role="img" aria-label="Stacked orbital mixing workbench showing twisted p atomic orbitals, pointwise signed amplitudes, and the pi/pi star energy pair">
        <defs>
          <marker id="bonding-arrowhead-mobile" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="strokeWidth">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#8c8175" />
          </marker>
        </defs>
        <text className="guided-panel-title guided-panel-title--small" x="18" y="30">Phase picks ψ+/ψ−; twist changes overlap</text>
        <text className="guided-svg-label" x="18" y="52">Selected: {activeMoLabel}. Twist = {twistDegrees.toFixed(0)}°.</text>

        <rect className="bonding-panel-bg" x="18" y="70" width="324" height="220" rx="16" />
        <text className="guided-panel-title guided-panel-title--small" x="36" y="102">1. Starting AOs and twist</text>
        <text className="guided-svg-label" x="36" y="124">φB visibly rotates out of alignment</text>
        <line className="guided-bond-axis" x1="76" x2="284" y1="184" y2="184" />
        <circle className="bonding-center-probe" cx="180" cy="184" r="11" />
        <PiLobes x={114} y={184} signs={[1, -1]} scale={0.72} />
        <RotatingPiLobes x={246} y={184} signs={[1, -1]} scale={0.72} angle={twistDegrees} />
        <text className="guided-svg-label" x="88" y="256">φA</text>
        <text className="guided-svg-label" x="224" y="256">φB</text>
        <text className="guided-svg-label" x="36" y="278">S ≈ cos({twistDegrees.toFixed(0)}°) = {overlap.toFixed(2)}; overlap {overlapLabel}</text>

        <path className="bonding-flow-arrow" markerEnd="url(#bonding-arrowhead-mobile)" d="M 180 308 C 180 324, 180 338, 180 354" />
        <text className="guided-svg-label" x="196" y="335">sample φ</text>

        <rect className="bonding-panel-bg" x="18" y="368" width="324" height="210" rx="16" />
        <text className="guided-panel-title guided-panel-title--small" x="36" y="400">2. Signed amplitude at one point</text>
        <text className="guided-svg-label" x="36" y="424">{sampleEquationLabel}</text>
        <text className="bonding-sample-line" x="36" y="460">φA(sample) = {signedDecimal(centerA)}</text>
        <text className="bonding-sample-line" x="36" y="490">{centerBLabel} = {signedDecimal(centerB)}</text>
        <text className="bonding-sample-line bonding-sample-line--result" x="36" y="528">{signedDecimal(centerA)} + {signedDecimal(centerB)} = {signedDecimal(centerPsi)}</text>
        <text className="bonding-sample-line" x="36" y="558">density = |ψ|² = {centerDensity.toFixed(2)}</text>

        <path className="bonding-flow-arrow" markerEnd="url(#bonding-arrowhead-mobile)" d="M 180 594 C 180 610, 180 624, 180 640" />
        <text className="guided-svg-label" x="196" y="622">split levels</text>

        <rect className="bonding-panel-bg" x="18" y="654" width="324" height="286" rx="16" />
        <text className="guided-panel-title guided-panel-title--small" x="36" y="686">3. Two MOs and energy splitting</text>
        <text className="guided-svg-label" x="36" y="708">energy split = {energySplit.toFixed(2)} arbitrary units</text>
        <g>
          <rect className={`bonding-mo-row-bg ${bonding ? 'is-selected' : ''}`} x="36" y="726" width="144" height="62" rx="13" />
          <text className="bonding-result-label" x="50" y="748">ψ+ π</text>
          <ellipse className="guided-density-bridge" cx="126" cy="765" rx="42" ry="18" style={{ opacity: bridgeOpacity }} />
          <PiLobes x={104} y={765} signs={[1, -1]} scale={0.28} />
          <PiLobes x={150} y={765} signs={[1, -1]} scale={0.28} />
        </g>
        <g>
          <rect className={`bonding-mo-row-bg ${!bonding ? 'is-selected' : ''}`} x="36" y="806" width="144" height="68" rx="13" />
          <text className="bonding-result-label" x="50" y="828">ψ− π*</text>
          <PiLobes x={104} y={848} signs={[1, -1]} scale={0.28} />
          <PiLobes x={150} y={848} signs={[-1, 1]} scale={0.28} />
          <rect className="guided-node-band" x="124" y="824" width="9" height="50" rx="5" style={{ opacity: nodeOpacity }} />
        </g>
        <line className="guided-energy-axis" x1="220" x2="220" y1="724" y2="884" />
        <line className="bonding-starting-level" x1="236" x2="274" y1="758" y2="758" />
        <text className="guided-svg-label" x="236" y="748">φA, φB</text>
        <line className="guided-mixing-line" x1="274" x2="292" y1="758" y2={upperYMobile} />
        <line className="guided-mixing-line" x1="274" x2="292" y1="758" y2={lowerYMobile} />
        <EnergyLevel x1={290} x2={326} y={upperYMobile} label="ψ−" occupied={state.bondingElectrons === 4} />
        <EnergyLevel x1={290} x2={326} y={lowerYMobile} label="ψ+" occupied />
        <text className="guided-svg-label" x="36" y="916">{state.bondingElectrons} electrons: {energyLabel}</text>
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

function VisualPanel({
  visual,
  state,
  setState,
  onReviewPrevious,
}: {
  visual: VisualKind;
  state: ControlState;
  setState: SetControlState;
  onReviewPrevious: () => void;
}) {
  if (visual === 'bonding') return <BondingVisual state={state} setState={setState} onReviewPrevious={onReviewPrevious} />;
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
  if (visual === 'bonding') {
    const overlap = clamp(Math.cos((state.twist * Math.PI) / 180), 0, 1);
    return `phase=${state.phase}; twist=${state.twist.toFixed(0)}deg; overlap=${overlap.toFixed(2)}; electrons=${state.bondingElectrons}`;
  }
  if (visual === 'overlap') return `phase=${state.phase}; distance=${state.distance.toFixed(2)}; compactness=${state.compactness.toFixed(2)}`;
  if (visual === 'energy-gap') return `energyGap=${state.energyGap.toFixed(2)}; interaction=${state.interaction.toFixed(2)}`;
  if (visual === 'polarization') return `heteroatomEnergyLowering=${state.electronegativity.toFixed(2)}`;
  if (visual === 'ethylene-formaldehyde') return `molecule=${state.molecule}`;
  if (visual === 'twist-geometry') return `twist=${state.twist.toFixed(0)}deg`;
  if (visual === 'walsh-geometry') return `distortion=${state.geometry.toFixed(2)}; electrons=${state.electrons}`;
  if (visual === 'pi-chain') return `atomCount=${state.atomCount}; orbitalIndex=${state.orbitalIndex + 1}`;
  return `comparisonFeature=${state.calculationFeature}`;
}

function AssessmentDisclosure({
  kind,
  title,
  itemCount,
  children,
}: {
  kind: string;
  title: string;
  itemCount: number;
  children: ReactNode;
}) {
  return (
    <details className="guided-assessment-disclosure">
      <summary>
        <span className="guided-assessment-disclosure__kind">{kind}</span>
        <span className="guided-assessment-disclosure__title">{title}</span>
        <span className="guided-assessment-disclosure__meta">
          {itemCount} question{itemCount === 1 ? '' : 's'}
        </span>
      </summary>
      <div className="guided-assessment-disclosure__body">{children}</div>
    </details>
  );
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
  const reviewPreviousLesson = () => {
    props.onPrevious();
    scrollToPageTop();
  };

  const interactionSummary = useMemo(() => interactionSummaryFor(lesson.visual, state), [lesson.visual, state]);

  const feedback = `${stage.title}: ${stage.correction} Current interaction state: ${interactionSummary}.`;

  return (
    <LessonShell
      {...props}
      purpose={lesson.purpose}
      question={lesson.question}
      showPhaseLegend
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
          {lessonId === 'bonding' && stage.id === 'in-phase' ? (
            <BondingEquationChooser state={state} setState={setState} />
          ) : (
            <div className="guided-equation-strip">{stage.equation}</div>
          )}
          <p className="guided-correction">Do not read it this way: {stage.correction}</p>
        </section>

        <GoingDeeperPanels panels={stage.goingDeeper} />

        <VisualPanel visual={lesson.visual} state={state} setState={setState} onReviewPrevious={reviewPreviousLesson} />

        <NoticeCard feedback={feedback} />

        <AssessmentDisclosure
          kind="Practice"
          title="Embedded checkpoint"
          itemCount={lesson.checkpoints.length}
        >
          <AssessmentCard
            meta={props.meta}
            mode="practice"
            sectionId="checkpoint"
            sectionTitle="Embedded checkpoint"
            sectionLead={lesson.checkpointLead}
            items={lesson.checkpoints}
            interactionSummary={interactionSummary}
          />
        </AssessmentDisclosure>

        <section className="guided-explain-card">
          <h3>Explain the screen before moving on</h3>
          <p>
            Write one sentence that links what you changed to what happened in the orbital picture. Then write one sentence that states the chemical consequence. This is the bridge from manipulation to understanding.
          </p>
        </section>

        <AssessmentDisclosure
          kind="Graded"
          title="End-of-lesson submitted assessment"
          itemCount={lesson.endItems.length}
        >
          <AssessmentCard
            meta={props.meta}
            mode="graded"
            sectionId="end-of-lesson"
            sectionTitle="End-of-lesson submitted assessment"
            sectionLead={lesson.endLead}
            items={lesson.endItems}
            interactionSummary={interactionSummary}
          />
        </AssessmentDisclosure>

        <div className="guided-bottom-nav">
          <button type="button" onClick={previousFromBottom}>{atFirstStage ? 'Previous lesson' : 'Back one idea'}</button>
          <span>Step {stageIndex + 1} of {lesson.stages.length}</span>
          <button type="button" onClick={nextFromBottom}>{atLastStage ? 'Next lesson' : 'Continue'}</button>
        </div>
      </div>
    </LessonShell>
  );
}
