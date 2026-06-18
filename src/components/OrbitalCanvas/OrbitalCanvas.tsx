import type { PiOrbital } from '../../models/piChain';
import { signColor, signLabel } from '../../models/normalization';

type Phase = 1 | -1;

const sourceColorA = '#1ca7b8';
const sourceColorB = '#f2c84b';
const sourceBlendColor = '#4da55f';

interface OrbitalGlyphProps {
  x: number;
  y: number;
  scale?: number;
  phase?: Phase;
  angle?: number;
  label?: string;
  density?: boolean;
  muted?: boolean;
}

function OrbitalGlyph({
  x,
  y,
  scale = 1,
  phase = 1,
  angle = 0,
  label,
  density = false,
  muted = false,
}: OrbitalGlyphProps) {
  const topSign = phase;
  const bottomSign = (phase * -1) as Phase;
  const rx = 18 * scale;
  const ry = 34 * scale;
  const opacity = muted ? 0.45 : 0.88;

  if (density) {
    return (
      <g transform={`translate(${x} ${y}) rotate(${angle})`} className="orbital-glyph">
        <ellipse cx="0" cy="-22" rx={rx} ry={ry} className="density-lobe" opacity={opacity} />
        <ellipse cx="0" cy="22" rx={rx} ry={ry} className="density-lobe" opacity={opacity} />
        {label ? <text y="68" textAnchor="middle" className="atom-label">{label}</text> : null}
      </g>
    );
  }

  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`} className="orbital-glyph">
      <ellipse
        cx="0"
        cy="-22"
        rx={rx}
        ry={ry}
        className={`phase-lobe phase-lobe--${signColor(topSign)}`}
        opacity={opacity}
      />
      <ellipse
        cx="0"
        cy="22"
        rx={rx}
        ry={ry}
        className={`phase-lobe phase-lobe--${signColor(bottomSign)}`}
        opacity={opacity}
      />
      <text y="-20" textAnchor="middle" className="phase-label">
        {signLabel(topSign)}
      </text>
      <text y="29" textAnchor="middle" className="phase-label">
        {signLabel(bottomSign)}
      </text>
      {label ? <text y="68" textAnchor="middle" className="atom-label">{label}</text> : null}
    </g>
  );
}

function SourcePhaseLabel({ x, y, sign }: { x: number; y: number; sign: Phase }) {
  return (
    <text x={x} y={y} textAnchor="middle" className="source-phase-label">
      {signLabel(sign)}
    </text>
  );
}

function MixedMoPanel({
  x,
  y = 28,
  title,
  leftAtom,
  rightAtom,
  leftShare,
  rightShare,
  rightPhase,
  caption,
  accent = false,
}: {
  x: number;
  y?: number;
  title: string;
  leftAtom: string;
  rightAtom: string;
  leftShare: number;
  rightShare: number;
  rightPhase: Phase;
  caption: string;
  accent?: boolean;
}) {
  const leftX = x + 118;
  const rightX = x + 200;
  const midX = (leftX + rightX) / 2;
  const topY = y + 102;
  const midY = y + 132;
  const bottomY = y + 162;
  const leftScale = 0.64 + Math.sqrt(leftShare) * 0.72;
  const rightScale = 0.64 + Math.sqrt(rightShare) * 0.72;
  const leftRx = 34 * leftScale;
  const rightRx = 34 * rightScale;
  const leftRy = 20 * leftScale;
  const rightRy = 20 * rightScale;
  const isBonding = rightPhase === 1;

  return (
    <g>
      <rect x={x} y={y} width="318" height="276" rx="8" className={`diagram-frame${accent ? ' diagram-frame--accent' : ''}`} />
      <text x={x + 159} y={y + 36} textAnchor="middle" className="diagram-title">{title}</text>
      <line x1={leftX - 38} x2={rightX + 38} y1={midY} y2={midY} className="baseline" />
      <circle cx={leftX} cy={midY} r="4" className="nucleus-dot" />
      <circle cx={rightX} cy={midY} r="4" className="nucleus-dot" />

      {isBonding ? (
        <>
          <ellipse cx={midX} cy={topY} rx="42" ry="18" className="source-lobe source-lobe--blend" />
          <ellipse cx={midX} cy={bottomY} rx="42" ry="18" className="source-lobe source-lobe--blend" />
        </>
      ) : null}

      <ellipse cx={leftX} cy={topY} rx={leftRx} ry={leftRy} className="source-lobe source-lobe--a" />
      <ellipse cx={rightX} cy={topY} rx={rightRx} ry={rightRy} className="source-lobe source-lobe--b" />
      <ellipse cx={leftX} cy={bottomY} rx={leftRx} ry={leftRy} className="source-lobe source-lobe--a" />
      <ellipse cx={rightX} cy={bottomY} rx={rightRx} ry={rightRy} className="source-lobe source-lobe--b" />

      {!isBonding ? (
        <>
          <rect x={midX - 5} y={y + 64} width="10" height="136" className="node-gap" />
          <line x1={midX} x2={midX} y1={y + 60} y2={y + 210} className="node-line" />
        </>
      ) : null}

      <SourcePhaseLabel x={leftX} y={topY + 6} sign={1} />
      <SourcePhaseLabel x={rightX} y={topY + 6} sign={rightPhase} />
      <SourcePhaseLabel x={leftX} y={bottomY + 6} sign={-1} />
      <SourcePhaseLabel x={rightX} y={bottomY + 6} sign={(rightPhase * -1) as Phase} />

      <text x={leftX} y={y + 206} textAnchor="middle" className="atom-label">{leftAtom}</text>
      <text x={rightX} y={y + 206} textAnchor="middle" className="atom-label">{rightAtom}</text>
      <text x={x + 159} y={y + 250} textAnchor="middle" className="diagram-caption">
        {caption}
      </text>
    </g>
  );
}

function SourceLegend({
  y,
  leftSourceLabel,
  rightSourceLabel,
  centerX = 360,
  compact = false,
}: {
  y: number;
  leftSourceLabel: string;
  rightSourceLabel: string;
  centerX?: number;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <g className="source-legend source-legend--compact" aria-hidden="true">
        <rect x="26" y={y} width="20" height="12" rx="3" fill={sourceColorA} />
        <text x="54" y={y + 11}>{leftSourceLabel} source</text>
        <rect x="204" y={y} width="20" height="12" rx="3" fill={sourceColorB} />
        <text x="232" y={y + 11}>{rightSourceLabel} source</text>
        <rect x="86" y={y + 22} width="20" height="12" rx="3" fill={sourceBlendColor} />
        <text x="114" y={y + 33}>mixed character</text>
        <text x="180" y={y + 52} textAnchor="middle">+ and - labels show phase.</text>
      </g>
    );
  }

  return (
    <g className="source-legend" aria-hidden="true">
      <rect x={centerX - 296} y={y} width="20" height="12" rx="3" fill={sourceColorA} />
      <text x={centerX - 268} y={y + 11}>{leftSourceLabel} source</text>
      <rect x={centerX - 116} y={y} width="20" height="12" rx="3" fill={sourceBlendColor} />
      <text x={centerX - 88} y={y + 11}>mixed character</text>
      <rect x={centerX + 94} y={y} width="20" height="12" rx="3" fill={sourceColorB} />
      <text x={centerX + 122} y={y + 11}>{rightSourceLabel} source</text>
      <text x={centerX} y={y + 32} textAnchor="middle">Source colors show atom character; + and - labels show phase.</text>
    </g>
  );
}

export function SingleOrbitalDiagram({
  mode,
  globalPhase,
  displayThreshold,
}: {
  mode: 'psi' | 'density';
  globalPhase: Phase;
  displayThreshold: number;
}) {
  const thresholdScale = Math.max(0.58, 1.48 - displayThreshold * 1.45);

  return (
    <svg
      className="orbital-svg"
      viewBox="0 0 360 240"
      role="img"
      aria-label="One p orbital with adjustable display threshold, shown with two phases or as density"
    >
      <rect x="18" y="18" width="324" height="204" rx="8" className="diagram-frame" />
      <line x1="180" x2="180" y1="48" y2="192" className="nucleus-axis" />
      <circle cx="180" cy="120" r="5" className="nucleus-dot" />
      <OrbitalGlyph x={180} y={108} scale={thresholdScale} phase={globalPhase} density={mode === 'density'} />
      <text x="180" y="213" textAnchor="middle" className="diagram-caption">
        {mode === 'density'
          ? 'Density loses the sign; the threshold only changes the displayed size.'
          : 'The threshold changes the picture, not psi itself.'}
      </text>
    </svg>
  );
}

export function CombinationDiagram({
  weightA,
  weightB,
  phaseB,
}: {
  weightA: number;
  weightB: number;
  phaseB: Phase;
}) {
  const effectiveB = weightB * phaseB;
  const scaleA = Math.max(0.35, Math.sqrt(Math.abs(weightA)) * 0.88);
  const scaleB = Math.max(0.35, Math.sqrt(Math.abs(weightB)) * 0.88);
  const samePhase = weightA * effectiveB >= 0;
  const node = !samePhase && Math.abs(weightA) > 0.1 && Math.abs(weightB) > 0.1;

  return (
    <svg className="orbital-svg" viewBox="0 0 720 340" role="img" aria-label="Two starting p orbitals and their combination">
      <rect x="18" y="24" width="205" height="284" rx="8" className="diagram-frame" />
      <rect x="258" y="24" width="205" height="284" rx="8" className="diagram-frame" />
      <rect x="498" y="24" width="205" height="284" rx="8" className="diagram-frame diagram-frame--accent" />
      <text x="120" y="58" textAnchor="middle" className="diagram-title">Starting A</text>
      <text x="360" y="58" textAnchor="middle" className="diagram-title">Starting B</text>
      <text x="600" y="58" textAnchor="middle" className="diagram-title">Resulting MO</text>
      <OrbitalGlyph x={120} y={157} scale={scaleA} phase={weightA >= 0 ? 1 : -1} label="A" />
      <OrbitalGlyph x={360} y={157} scale={scaleB} phase={effectiveB >= 0 ? 1 : -1} label="B" />
      <OrbitalGlyph x={560} y={157} scale={scaleA} phase={weightA >= 0 ? 1 : -1} label="A" />
      <OrbitalGlyph x={640} y={157} scale={scaleB} phase={effectiveB >= 0 ? 1 : -1} label="B" />
      {node ? (
        <g>
          <line x1="600" x2="600" y1="82" y2="232" className="node-line" />
          <text x="600" y="252" textAnchor="middle" className="node-label">node between atoms</text>
        </g>
      ) : (
        <text x="600" y="252" textAnchor="middle" className="diagram-caption">buildup between the atoms</text>
      )}
    </svg>
  );
}

export function BondingPairDiagram({ compare }: { compare: boolean }) {
  return (
    <svg className="orbital-svg" viewBox="0 0 720 320" role="img" aria-label="Bonding and antibonding p orbital combinations">
      <rect x="22" y="24" width={compare ? 326 : 676} height="260" rx="8" className="diagram-frame diagram-frame--accent" />
      <text x={compare ? 185 : 360} y="58" textAnchor="middle" className="diagram-title">Bonding: in phase</text>
      <OrbitalGlyph x={compare ? 145 : 320} y={155} scale={0.95} phase={1} label="A" />
      <OrbitalGlyph x={compare ? 225 : 400} y={155} scale={0.95} phase={1} label="B" />
      <text x={compare ? 185 : 360} y="256" textAnchor="middle" className="diagram-caption">more density between nuclei</text>
      {compare ? (
        <>
          <rect x="372" y="24" width="326" height="260" rx="8" className="diagram-frame" />
          <text x="535" y="58" textAnchor="middle" className="diagram-title">Antibonding: out of phase</text>
          <OrbitalGlyph x={495} y={155} scale={0.95} phase={1} label="A" />
          <OrbitalGlyph x={575} y={155} scale={0.95} phase={-1} label="B" />
          <line x1="535" x2="535" y1="84" y2="226" className="node-line" />
          <text x="535" y="256" textAnchor="middle" className="node-label">node between nuclei</text>
        </>
      ) : null}
    </svg>
  );
}

export function OverlapDiagram({
  distance,
  compactness,
  relativePhase,
}: {
  distance: number;
  compactness: number;
  relativePhase: Phase;
}) {
  const centerGap = 62 + distance * 24;
  const left = 360 - centerGap / 2;
  const right = 360 + centerGap / 2;
  const scale = Math.max(0.58, 1.25 - compactness * 0.22);

  return (
    <svg className="orbital-svg" viewBox="0 0 720 300" role="img" aria-label="Two p orbitals with adjustable distance and phase">
      <rect x="22" y="24" width="676" height="236" rx="8" className="diagram-frame" />
      <line x1="120" x2="600" y1="166" y2="166" className="baseline" />
      <OrbitalGlyph x={left} y={142} scale={scale} phase={1} label="A" />
      <OrbitalGlyph x={right} y={142} scale={scale} phase={relativePhase} label="B" />
      <line x1={left} x2={right} y1="250" y2="250" className="distance-line" />
      <text x="360" y="281" textAnchor="middle" className="diagram-caption">fixed scale: distance changes the overlap region</text>
    </svg>
  );
}

export function GeometryDiagram({ twist }: { twist: number }) {
  return (
    <svg className="orbital-svg" viewBox="0 0 720 300" role="img" aria-label="Two adjacent p orbitals with twist angle">
      <rect x="22" y="24" width="676" height="236" rx="8" className="diagram-frame" />
      <line x1="230" x2="490" y1="158" y2="158" className="baseline" />
      <OrbitalGlyph x={300} y={140} scale={1.08} phase={1} label="A" />
      <OrbitalGlyph x={420} y={140} scale={1.08} phase={1} label="B" angle={twist} />
      <path d="M420 210 A70 70 0 0 0 490 140" className="angle-arc" />
      <text x="505" y="148" className="diagram-caption">{twist.toFixed(0)} deg twist</text>
    </svg>
  );
}

export function MoleculeComparisonDiagram({
  molecule,
  atomA,
  atomB,
  lowerShare,
  upperShare,
  bondingCaption,
  antibondingCaption,
}: {
  molecule?: 'ethylene' | 'formaldehyde';
  atomA?: string;
  atomB?: string;
  lowerShare: { a: number; b: number };
  upperShare: { a: number; b: number };
  bondingCaption?: string;
  antibondingCaption?: string;
}) {
  const isFormaldehyde = molecule === 'formaldehyde';
  const leftAtom = atomA ?? 'C';
  const rightAtom = atomB ?? (isFormaldehyde ? 'O' : 'C');
  const lowerCaption = bondingCaption ?? (isFormaldehyde ? 'more oxygen-like' : 'balanced carbon weights');
  const upperCaption = antibondingCaption ?? (isFormaldehyde ? 'larger carbon weight' : 'balanced carbon weights');

  const leftSourceLabel = leftAtom === rightAtom ? `left ${leftAtom}` : leftAtom;
  const rightSourceLabel = leftAtom === rightAtom ? `right ${rightAtom}` : rightAtom;

  return (
    <>
      <svg
        className="orbital-svg molecule-comparison molecule-comparison--desktop"
        viewBox="0 0 720 370"
        role="img"
        aria-label={`${leftAtom}-${rightAtom} pi and pi star orbital comparison with atom-source color mixing and phase labels`}
      >
        <MixedMoPanel
          x={26}
          title="pi bonding"
          leftAtom={leftAtom}
          rightAtom={rightAtom}
          leftShare={lowerShare.a}
          rightShare={lowerShare.b}
          rightPhase={1}
          caption={lowerCaption}
          accent
        />
        <MixedMoPanel
          x={376}
          title="pi* antibonding"
          leftAtom={leftAtom}
          rightAtom={rightAtom}
          leftShare={upperShare.a}
          rightShare={upperShare.b}
          rightPhase={-1}
          caption={upperCaption}
        />
        <SourceLegend y={326} leftSourceLabel={leftSourceLabel} rightSourceLabel={rightSourceLabel} />
      </svg>
      <svg
        className="orbital-svg molecule-comparison molecule-comparison--mobile"
        viewBox="0 0 360 660"
        role="img"
        aria-label={`${leftAtom}-${rightAtom} pi and pi star orbital comparison with stacked atom-source color mixing panels and phase labels`}
      >
        <MixedMoPanel
          x={21}
          y={24}
          title="pi bonding"
          leftAtom={leftAtom}
          rightAtom={rightAtom}
          leftShare={lowerShare.a}
          rightShare={lowerShare.b}
          rightPhase={1}
          caption={lowerCaption}
          accent
        />
        <MixedMoPanel
          x={21}
          y={316}
          title="pi* antibonding"
          leftAtom={leftAtom}
          rightAtom={rightAtom}
          leftShare={upperShare.a}
          rightShare={upperShare.b}
          rightPhase={-1}
          caption={upperCaption}
        />
        <SourceLegend y={604} centerX={180} leftSourceLabel={leftSourceLabel} rightSourceLabel={rightSourceLabel} compact />
      </svg>
    </>
  );
}

export function CoefficientChainDiagram({ orbital }: { orbital: PiOrbital }) {
  const n = orbital.coefficients.length;
  const spacing = 520 / Math.max(1, n - 1);
  const start = 100;

  return (
    <svg className="orbital-svg" viewBox="0 0 720 300" role="img" aria-label={`${orbital.label} coefficients and nodes`}>
      <rect x="24" y="24" width="672" height="236" rx="8" className="diagram-frame" />
      <line x1={start} x2={start + spacing * (n - 1)} y1="160" y2="160" className="baseline" />
      {orbital.coefficients.map((coefficient, index) => {
        const x = start + spacing * index;
        const scale = 0.45 + Math.abs(coefficient) * 1.25;
        const next = orbital.coefficients[index + 1];
        const hasNode = next !== undefined && coefficient * next < 0;
        return (
          <g key={`${orbital.label}-${index}`}>
            <OrbitalGlyph x={x} y={138} scale={scale} phase={coefficient >= 0 ? 1 : -1} label={`${index + 1}`} />
            {hasNode ? (
              <g>
                <line x1={x + spacing / 2} x2={x + spacing / 2} y1="70" y2="230" className="node-line" />
                <text x={x + spacing / 2} y="247" textAnchor="middle" className="node-label">node</text>
              </g>
            ) : null}
          </g>
        );
      })}
      <text x="360" y="286" textAnchor="middle" className="diagram-caption">
        {n} starting p orbitals make {n} pi molecular orbitals.
      </text>
    </svg>
  );
}
