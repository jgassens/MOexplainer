import {
  Suspense,
  lazy,
  useEffect,
  useId,
  useMemo,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import { LessonShell } from "../../components/LessonShell/LessonShell";
import {
  formatSigned,
  relativeDensity,
  teachingPOrbital,
  type PhaseSign,
} from "../../models/teachingWave";
import type { LessonComponentProps } from "../types";

const LazyPyOrbitalExplorer = lazy(() =>
  import("../../components/orbital3d/PyOrbitalExplorer").then((module) => ({
    default: module.PyOrbitalExplorer,
  })),
);

type StageId = "read" | "magnitude" | "density" | "sign" | "probability3d";
type ReadoutId = "location" | "amplitude" | "magnitude" | "density";

interface StageCopy {
  id: StageId;
  shortTitle: string;
  title: string;
  lead: string;
  equation: string;
  correction: string;
}

const stages: readonly StageCopy[] = [
  {
    id: "read",
    shortTitle: "Read ψ",
    title: "ψ is a signed wave amplitude—not a probability",
    lead: "Every point in 3D space has coordinates (x, y, z). The orbital function ψ(x, y, z) assigns one signed amplitude to that point. In this view, we are only walking along the y-axis of a pᵧ orbital, so x = 0 and z = 0. The sign of ψ tells phase. The size of ψ tells amplitude. Electron density comes from |ψ|², not from ψ itself.",
    equation: "point (x, y, z)  →  ψ(x, y, z)",
    correction:
      "The +1 and −1 values on this page are scaled teaching values. They mean equal amplitude with opposite phase. They do not mean +100% and −100% probability.",
  },
  {
    id: "magnitude",
    shortTitle: "Size of ψ",
    title: "Size before squaring: how large is ψ?",
    lead: "The magnitude |ψ| tells how large the wave amplitude is at this point, ignoring whether the sign is + or −. Large |ψ| means this point can contribute strongly to electron density after squaring. Small |ψ| means weak density after squaring. At a node, |ψ| = 0, so |ψ|² = 0 too.",
    equation: "ψ = +0.80 or −0.80  →  |ψ| = 0.80",
    correction:
      "A larger |ψ| does not mean a larger atom, extra charge, or raw probability at a point. It means more wave amplitude is present before squaring.",
  },
  {
    id: "density",
    shortTitle: "Density after squaring",
    title: "Density after squaring: |ψ|²",
    lead: "For one electron in this orbital, |ψ|² tells how the probability of finding the electron is distributed through space. Squaring removes the sign, so a large negative ψ and a large positive ψ both produce large density. A node, where ψ = 0, produces zero density.",
    equation: "probability density = |ψ(x, y, z)|²",
    correction:
      "This teaching model is scaled, so the graph shows relative probability-density shape. A probability for a region comes from integrating |ψ|² over that region.",
  },
  {
    id: "sign",
    shortTitle: "Phase sign",
    title: "The + and − signs are phase labels, not charge labels",
    lead: "Flip every sign in the orbital and the probability density stays the same. The signs become important when two orbital amplitudes are added or subtracted.",
    equation: "ψ → −ψ, while |ψ|² stays unchanged",
    correction:
      "Positive ψ is not positive charge, and negative ψ is not negative charge. The colors only keep track of relative phase.",
  },
  {
    id: "probability3d",
    shortTitle: "Probability in 3D",
    title: "From one point to a region of space",
    lead: "The wavefunction assigns one signed amplitude to every point in three-dimensional space. Squaring that value gives probability density at the point. An actual probability belongs to a region, not to one exact mathematical point. The sampling box selects a finite volume, and the integral adds |ψ|² throughout that volume.",
    equation:
      "point (x, y, z) → ψ(x, y, z) → |ψ(x, y, z)|²     volume R → P(R) = ∭R |ψ|² dτ",
    correction:
      "ψ at the center is not the probability inside the box. |ψ|² at the center is a local density value. Probability requires adding density throughout the complete selected volume.",
  },
] as const;

const Y_MIN = -2.8;
const Y_MAX = 2.8;
const PLOT_LEFT = 70;
const PLOT_RIGHT = 650;
const PSI_BASELINE = 156;
const PSI_SCALE = 88;
const DENSITY_BASELINE = 354;
const DENSITY_SCALE = 86;
const READOUT_LABELS: Record<ReadoutId, string> = {
  location: "Location",
  amplitude: "Wave amplitude",
  magnitude: "Size of ψ",
  density: "Probability density",
};

function defaultReadoutForStage(stageId: StageId): ReadoutId {
  if (stageId === "magnitude") return "magnitude";
  if (stageId === "density" || stageId === "sign" || stageId === "probability3d") {
    return "density";
  }
  return "amplitude";
}

function yToSvg(y: number): number {
  return PLOT_LEFT + ((y - Y_MIN) / (Y_MAX - Y_MIN)) * (PLOT_RIGHT - PLOT_LEFT);
}

function psiToSvg(value: number): number {
  return PSI_BASELINE - value * PSI_SCALE;
}

function densityToSvg(value: number): number {
  return DENSITY_BASELINE - value * DENSITY_SCALE;
}

function makePath(values: readonly { y: number; svgY: number }[]): string {
  return values
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${yToSvg(point.y).toFixed(2)} ${point.svgY.toFixed(2)}`,
    )
    .join(" ");
}

function EquationTerm({
  children,
  description,
  label,
  value,
}: {
  children: ReactNode;
  description: string;
  label: string;
  value?: string;
}) {
  const tooltipId = useId();

  return (
    <span className="psi-equation-term-wrap">
      <button
        type="button"
        className="psi-equation-term"
        aria-describedby={tooltipId}
        aria-label={label}
      >
        {children}
      </button>
      <span id={tooltipId} role="tooltip" className="psi-equation-tooltip">
        <strong>{label}</strong>
        {value ? <span className="psi-equation-tooltip__value">{value}</span> : null}
        <span>{description}</span>
      </span>
    </span>
  );
}

function EquationWorkbench({
  activeReadout,
  density,
  magnitude,
  overallSign,
  psi,
  probeY,
}: {
  activeReadout: ReadoutId;
  density: number;
  magnitude: number;
  overallSign: PhaseSign;
  psi: number;
  probeY: number;
}) {
  const signValue = overallSign === 1 ? "+1" : "−1";
  const exponentialValue = Math.exp((1 - probeY * probeY) / 2);
  const ySquared = probeY * probeY;
  const point = `(0, ${probeY.toFixed(2)}, 0)`;
  const title = `${READOUT_LABELS[activeReadout]} equation`;
  const summary =
    activeReadout === "location"
      ? "This fixes the point where the orbital function is being evaluated."
      : activeReadout === "amplitude"
        ? "This is the scaled pᵧ teaching function used by the graph and slider."
        : activeReadout === "magnitude"
          ? "This shows how much wave amplitude is present before squaring."
          : "This squares the amplitude to make a relative probability-density value.";

  return (
    <section className="psi-equation-workbench" aria-label={title}>
      <div className="psi-equation-workbench__header">
        <div>
          <span>Governing equation</span>
          <h3>{title}</h3>
        </div>
        <p>{summary}</p>
      </div>

      <div className="psi-equation-workbench__body">
        <div className="psi-equation-line" aria-label={`Equation for ${READOUT_LABELS[activeReadout]}`}>
          {activeReadout === "location" ? (
            <>
              <EquationTerm
                label="r squared"
                value={`r² = ${ySquared.toFixed(4)}`}
                description="Distance from the nucleus enters the fade-out part of the orbital. Along this slice, x and z are fixed at zero."
              >
                r²
              </EquationTerm>{" "}
              ={" "}
              <EquationTerm
                label="x coordinate"
                value="x = 0"
                description="We are not moving left or right; this view walks only along the y axis."
              >
                x²
              </EquationTerm>{" "}
              +{" "}
              <EquationTerm
                label="y coordinate"
                value={`y = ${probeY.toFixed(2)}`}
                description="This is the slider value. It chooses the point in the negative lobe, node, or positive lobe."
              >
                y²
              </EquationTerm>{" "}
              +{" "}
              <EquationTerm
                label="z coordinate"
                value="z = 0"
                description="We are staying in the orbital axis line, not moving above or below it."
              >
                z²
              </EquationTerm>
            </>
          ) : activeReadout === "amplitude" ? (
            <>
              <EquationTerm
                label="wave amplitude psi"
                value={`ψ = ${formatSigned(psi)}`}
                description="The signed wave-amplitude value at the selected point. Its sign is phase, not charge."
              >
                ψ(y)
              </EquationTerm>{" "}
              ={" "}
              <EquationTerm
                label="global phase sign"
                value={`s = ${signValue}`}
                description="This flips every sign in the orbital. It changes phase labels, not probability density."
              >
                s
              </EquationTerm>{" "}
              <EquationTerm
                label="position on y axis"
                value={`y = ${probeY.toFixed(2)}`}
                description="The pᵧ part gives opposite signs on opposite sides of the nodal plane and zero at y = 0."
              >
                y
              </EquationTerm>{" "}
              <EquationTerm
                label="Gaussian fade-out"
                value={`e^((1 − y²)/2) = ${exponentialValue.toFixed(2)}`}
                description="This makes the orbital fade as you move away from the nucleus. The scale is chosen so |ψ| reaches 1 near y = ±1."
              >
                e<sup>(1 − y²)/2</sup>
              </EquationTerm>
            </>
          ) : activeReadout === "magnitude" ? (
            <>
              <EquationTerm
                label="size of psi"
                value={`|ψ| = ${magnitude.toFixed(2)}`}
                description="This is how large the wave amplitude is at the selected point after ignoring whether the phase sign is positive or negative."
              >
                |ψ(y)|
              </EquationTerm>{" "}
              ={" "}
              <EquationTerm
                label="absolute value"
                value={`abs(${formatSigned(psi)}) = ${magnitude.toFixed(2)}`}
                description="Absolute value removes the sign. A large positive ψ and a large negative ψ both have large magnitude."
              >
                √(ψ(y)²)
              </EquationTerm>
            </>
          ) : (
            <>
              <EquationTerm
                label="relative probability density"
                value={`ρ = ${density.toFixed(2)}`}
                description="This scaled value is the relative density at one point, not the probability of finding the electron in a whole region."
              >
                ρ(y)
              </EquationTerm>{" "}
              ={" "}
              <EquationTerm
                label="squared magnitude"
                value={`|ψ|² = ${magnitude.toFixed(2)}² = ${density.toFixed(2)}`}
                description="Squaring removes the sign, so opposite phases can have the same density."
              >
                |ψ(y)|²
              </EquationTerm>
            </>
          )}
        </div>

        <div className="psi-equation-substitution" aria-label="Live substitution values">
          {activeReadout === "location" ? (
            <>
              <span>x = 0</span>
              <span>y = {probeY.toFixed(2)}</span>
              <span>z = 0</span>
              <span>r² = {ySquared.toFixed(4)}</span>
            </>
          ) : activeReadout === "amplitude" ? (
            <>
              <span>s = {signValue}</span>
              <span>y = {probeY.toFixed(2)}</span>
              <span>fade = {exponentialValue.toFixed(2)}</span>
              <span>ψ = {formatSigned(psi)}</span>
            </>
          ) : activeReadout === "magnitude" ? (
            <>
              <span>ψ = {formatSigned(psi)}</span>
              <span>ψ² = {(psi * psi).toFixed(2)}</span>
              <span>|ψ| = {magnitude.toFixed(2)}</span>
            </>
          ) : (
            <>
              <span>ψ = {formatSigned(psi)}</span>
              <span>|ψ| = {magnitude.toFixed(2)}</span>
              <span>|ψ|² = {density.toFixed(2)}</span>
            </>
          )}
        </div>

        <div className="psi-equation-answer">
          <span>Answer for this box</span>
          <strong>
            {activeReadout === "location"
              ? point
              : activeReadout === "amplitude"
                ? `ψ = ${formatSigned(psi)}`
                : activeReadout === "magnitude"
                  ? `|ψ| = ${magnitude.toFixed(2)}`
                  : `|ψ|² = ${density.toFixed(2)}`}
          </strong>
        </div>
      </div>
    </section>
  );
}

function PrimerCard({
  children,
  density = false,
  expanded,
  onToggle,
  symbol,
  title,
}: {
  children: ReactNode;
  density?: boolean;
  expanded: boolean;
  onToggle: () => void;
  symbol: ReactNode;
  title: string;
}) {
  const bodyId = useId();

  return (
    <div className={`psi-primer__item${density ? " psi-primer__item--density" : ""}`}>
      <span className="psi-primer__symbol">{symbol}</span>
      <div className="psi-primer__content">
        <h3>{title}</h3>
        <div
          id={bodyId}
          className={`psi-primer__body${expanded ? " is-expanded" : ""}`}
        >
          <p>{children}</p>
        </div>
        <button
          type="button"
          className="psi-primer__toggle"
          aria-controls={bodyId}
          aria-expanded={expanded}
          onClick={onToggle}
        >
          {expanded ? "less ↑" : "more ↓"}
        </button>
      </div>
    </div>
  );
}

function PsiPrimer() {
  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = () => setExpanded((current) => !current);

  return (
    <section
      className={`psi-primer${expanded ? " psi-primer--expanded" : ""}`}
      aria-label="Psi and probability density"
    >
      <PrimerCard
        expanded={expanded}
        onToggle={toggleExpanded}
        symbol="ψ"
        title="Wavefunction"
      >
        ψ, pronounced “sigh,” is the wavefunction. For an orbital, ψ is the
        mathematical function behind the picture. Start here because everything
        else depends on it: the sign of ψ gives phase, the size of ψ gives
        amplitude, and |ψ|² gives electron density. When orbitals combine, their
        ψ values are added point by point. That is why ψ has to come first
        before nodes, bonding, antibonding, or MO energy diagrams make sense.
      </PrimerCard>
      <span className="psi-primer__arrow" aria-hidden="true">
        square it →
      </span>
      <PrimerCard
        density
        expanded={expanded}
        onToggle={toggleExpanded}
        symbol="|ψ|²"
        title="Probability density"
      >
        |ψ|² is probability density. It comes from squaring the wavefunction, so
        the sign of ψ disappears and the result is never negative. Start with ψ
        to understand phase; square ψ to understand density. A high |ψ|² value
        marks a region where the electron is more likely to be found, but
        probability itself comes from adding density over a volume of space.
      </PrimerCard>
      <p className="psi-primer__scale-note">
        On this page, we are looking at one p orbital on one atom. We are not
        yet at a real molecular orbital, but molecular orbitals start here, so
        we will begin here. ψ is rescaled so the largest lobe has |ψ| = 1.
        That “1” is a relative amplitude, not a 100% probability.
      </p>
    </section>
  );
}

function FunctionPlot({
  probeY,
  stage,
  overallSign,
}: {
  probeY: number;
  stage: StageId;
  overallSign: PhaseSign;
}) {
  const showMagnitude = stage !== "read";
  const showDensity = stage === "density" || stage === "sign";
  const showReference = stage === "sign" && overallSign === -1;

  const samples = useMemo(
    () =>
      Array.from({ length: 141 }, (_, index) => {
        const y = Y_MIN + (index / 140) * (Y_MAX - Y_MIN);
        return { y, psi: teachingPOrbital(y, overallSign) };
      }),
    [overallSign],
  );

  const referenceSamples = useMemo(
    () =>
      Array.from({ length: 141 }, (_, index) => {
        const y = Y_MIN + (index / 140) * (Y_MAX - Y_MIN);
        return { y, psi: teachingPOrbital(y, 1) };
      }),
    [],
  );

  const left = samples.filter((point) => point.y <= 0);
  const right = samples.filter((point) => point.y >= 0);
  const leftSign =
    teachingPOrbital(-1, overallSign) >= 0 ? "positive" : "negative";
  const rightSign =
    teachingPOrbital(1, overallSign) >= 0 ? "positive" : "negative";
  const leftPath = makePath(
    left.map((point) => ({ y: point.y, svgY: psiToSvg(point.psi) })),
  );
  const rightPath = makePath(
    right.map((point) => ({ y: point.y, svgY: psiToSvg(point.psi) })),
  );
  const densityPath = makePath(
    samples.map((point) => ({
      y: point.y,
      svgY: densityToSvg(relativeDensity(point.psi)),
    })),
  );
  const referencePath = makePath(
    referenceSamples.map((point) => ({
      y: point.y,
      svgY: psiToSvg(point.psi),
    })),
  );

  const probePsi = teachingPOrbital(probeY, overallSign);
  const probeDensity = relativeDensity(probePsi);
  const probeSvgX = yToSvg(probeY);
  const probePsiY = psiToSvg(probePsi);
  const probeDensityY = densityToSvg(probeDensity);
  const probeClass = probePsi >= 0 ? "positive" : "negative";

  return (
    <svg
      className="psi-function-plot"
      viewBox="0 0 720 420"
      role="img"
      aria-label="A scaled graph of psi along the y axis through a p y orbital, with a movable probe and an optional graph of psi squared"
    >
      <rect x="12" y="12" width="696" height="396" rx="18" className="psi-svg-frame" />

      <text x="34" y="42" className="psi-svg-title">
        ψ(y): signed wave amplitude
      </text>
      <text x="686" y="42" textAnchor="end" className="psi-svg-note">
        scaled values—not probability
      </text>

      {[80, 120, 196, 236].map((y) => (
        <line
          key={y}
          x1={PLOT_LEFT}
          x2={PLOT_RIGHT}
          y1={y}
          y2={y}
          className="psi-plot-grid"
        />
      ))}
      {[-2, -1, 0, 1, 2].map((tick) => (
        <g key={tick}>
          <line
            x1={yToSvg(tick)}
            x2={yToSvg(tick)}
            y1="64"
            y2="246"
            className="psi-plot-grid"
          />
          <text
            x={yToSvg(tick)}
            y="264"
            textAnchor="middle"
            className="psi-axis-label"
          >
            {tick}
          </text>
        </g>
      ))}
      <line
        x1={PLOT_LEFT}
        x2={PLOT_RIGHT}
        y1={PSI_BASELINE}
        y2={PSI_BASELINE}
        className="psi-axis"
      />
      <line
        x1={yToSvg(0)}
        x2={yToSvg(0)}
        y1="58"
        y2="246"
        className="psi-node"
      />
      <text x={yToSvg(0) + 10} y="76" className="psi-node-label">
        node: ψ = 0
      </text>
      <text x="28" y="82" className="psi-axis-label">
        + amplitude
      </text>
      <text x="28" y="232" className="psi-axis-label">
        − amplitude
      </text>
      <text x={PLOT_RIGHT} y="282" textAnchor="end" className="psi-axis-label">
        position on the y axis
      </text>

      {showReference ? <path d={referencePath} className="psi-reference-curve" /> : null}
      <path d={leftPath} className={`psi-wave-curve psi-wave-curve--${leftSign}`} />
      <path d={rightPath} className={`psi-wave-curve psi-wave-curve--${rightSign}`} />

      <line
        x1={probeSvgX}
        x2={probeSvgX}
        y1="54"
        y2={showDensity ? DENSITY_BASELINE : 246}
        className="psi-probe-line"
      />
      {showMagnitude ? (
        <line
          x1={probeSvgX}
          x2={probeSvgX}
          y1={PSI_BASELINE}
          y2={probePsiY}
          className="psi-magnitude-line"
        />
      ) : null}
      <circle
        cx={probeSvgX}
        cy={probePsiY}
        r="7"
        className={`psi-probe psi-probe--${probeClass}`}
      />
      <text x={probeSvgX + 10} y={probePsiY - 12} className="psi-probe-label">
        ψ = {formatSigned(probePsi)} (scaled)
      </text>
      {showMagnitude ? (
        <text
          x={probeSvgX + 10}
          y={(PSI_BASELINE + probePsiY) / 2}
          className="psi-magnitude-label"
        >
          |ψ|
        </text>
      ) : null}

      {showDensity ? (
        <>
          <text x="34" y="306" className="psi-svg-title">
            |ψ(y)|²: relative probability density along this line
          </text>
          <line
            x1={PLOT_LEFT}
            x2={PLOT_RIGHT}
            y1={DENSITY_BASELINE}
            y2={DENSITY_BASELINE}
            className="psi-axis"
          />
          <line
            x1={yToSvg(0)}
            x2={yToSvg(0)}
            y1="314"
            y2={DENSITY_BASELINE}
            className="psi-node"
          />
          <path
            d={`${densityPath} L ${PLOT_RIGHT} ${DENSITY_BASELINE} L ${PLOT_LEFT} ${DENSITY_BASELINE} Z`}
            className="psi-density-area"
          />
          <path d={densityPath} className="psi-density-curve" />
          <circle cx={probeSvgX} cy={probeDensityY} r="7" className="psi-density-probe" />
          <text
            x={probeSvgX + 10}
            y={probeDensityY - 10}
            className="psi-probe-label"
          >
            |ψ|² = {probeDensity.toFixed(2)}
          </text>
        </>
      ) : (
        <g className="psi-density-preview">
          <rect x="70" y="310" width="580" height="72" rx="12" />
          <text x="360" y="340" textAnchor="middle">
            ψ is not probability.
          </text>
          <text x="360" y="364" textAnchor="middle">
            Square it to obtain relative probability density: |ψ|².
          </text>
        </g>
      )}
    </svg>
  );
}

function OrbitalCartoon({
  probeY,
  overallSign,
}: {
  probeY: number;
  overallSign: PhaseSign;
}) {
  const leftSign =
    teachingPOrbital(-1, overallSign) >= 0 ? "positive" : "negative";
  const rightSign =
    teachingPOrbital(1, overallSign) >= 0 ? "positive" : "negative";
  const probePosition = 48 + ((probeY - Y_MIN) / (Y_MAX - Y_MIN)) * 344;

  return (
    <svg
      className="psi-orbital-cartoon"
      viewBox="0 0 440 250"
      role="img"
      aria-label="Textbook-style horizontal p y orbital with x, y, and z axes, opposite phase lobes, and the x z nodal plane through the nucleus"
    >
      <defs>
        <marker
          id="psi-axis-arrow"
          markerWidth="8"
          markerHeight="8"
          refX="7"
          refY="4"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M 0 0 L 8 4 L 0 8 Z" className="psi-axis-arrowhead" />
        </marker>
      </defs>

      <rect x="10" y="10" width="420" height="230" rx="18" className="psi-svg-frame" />
      <text x="24" y="38" className="psi-svg-title">
        Textbook orientation: pᵧ orbital
      </text>
      <text x="416" y="38" textAnchor="end" className="psi-svg-note">
        lobes lie on ±y
      </text>

      <path
        d="M 193 56 L 247 96 L 247 194 L 193 154 Z"
        className="psi-nodal-plane"
      />

      <path
        d="M 218 125 C 184 78 126 65 63 80 C 25 89 25 161 63 170 C 126 185 184 172 218 125 Z"
        className={`psi-orbital-lobe psi-orbital-lobe--${leftSign}`}
      />
      <path
        d="M 222 125 C 256 78 314 65 377 80 C 415 89 415 161 377 170 C 314 185 256 172 222 125 Z"
        className={`psi-orbital-lobe psi-orbital-lobe--${rightSign}`}
      />

      <line
        x1="36"
        x2="407"
        y1="125"
        y2="125"
        className="psi-coordinate-axis"
        markerEnd="url(#psi-axis-arrow)"
      />
      <line
        x1="220"
        x2="220"
        y1="205"
        y2="55"
        className="psi-coordinate-axis"
        markerEnd="url(#psi-axis-arrow)"
      />
      <line
        x1="163"
        x2="292"
        y1="181"
        y2="66"
        className="psi-coordinate-axis"
        markerEnd="url(#psi-axis-arrow)"
      />

      <text x="28" y="118" className="psi-coordinate-label">
        −y
      </text>
      <text x="407" y="118" textAnchor="end" className="psi-coordinate-label">
        +y
      </text>
      <text x="228" y="60" className="psi-coordinate-label">
        z
      </text>
      <text x="296" y="68" className="psi-coordinate-label">
        x
      </text>

      <circle cx="220" cy="125" r="9" className="psi-orbital-nucleus-ring" />
      <circle cx="220" cy="125" r="6" className="psi-orbital-nucleus" />
      <text x="220" y="218" textAnchor="middle" className="psi-node-label">
        xz nodal plane: ψ = 0
      </text>

      <text x="112" y="138" textAnchor="middle" className="psi-orbital-sign">
        {leftSign === "positive" ? "+" : "−"}
      </text>
      <text x="328" y="138" textAnchor="middle" className="psi-orbital-sign">
        {rightSign === "positive" ? "+" : "−"}
      </text>

      <line
        x1={probePosition}
        x2={probePosition}
        y1="70"
        y2="181"
        className="psi-cartoon-probe-line"
      />
      <circle cx={probePosition} cy="125" r="5" className="psi-cartoon-probe" />
    </svg>
  );
}

export function PhaseLesson(props: LessonComponentProps) {
  const [stageIndex, setStageIndex] = useState(0);
  const [probeY, setProbeY] = useState(-1);
  const [overallSign, setOverallSign] = useState<PhaseSign>(1);
  const [alpha, setAlpha] = useState(0.8);

  const stage = stages[stageIndex];
  const [activeReadout, setActiveReadout] = useState<ReadoutId>(() =>
    defaultReadoutForStage(stage.id),
  );
  const psi = teachingPOrbital(probeY, overallSign);
  const magnitude = Math.abs(psi);
  const density = relativeDensity(psi);
  const atNode = Math.abs(probeY) < 0.06;
  const atFirstStage = stageIndex === 0;
  const atLastStage = stageIndex === stages.length - 1;

  useEffect(() => {
    setActiveReadout(defaultReadoutForStage(stage.id));
  }, [stage.id]);

  const chooseStage = (index: number) => {
    const targetStage = stages[index];
    setStageIndex(index);
    if (targetStage.id !== "sign" && targetStage.id !== "probability3d") {
      setOverallSign(1);
    }
  };

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

  const feedback = stage.id === "probability3d"
    ? "The 3D step uses a normalized pᵧ function. Rotate the camera to inspect it, then move or resize the box to change the integrated probability."
    : atNode
      ? "The probe is in the xz nodal plane. Here ψ = 0, so the probability density |ψ|² is also zero."
      : stage.id === "read"
      ? `At y = ${probeY.toFixed(2)}, ψ = ${formatSigned(psi)} on this scaled amplitude plot. That number is not a probability.`
      : stage.id === "magnitude"
        ? `At this point, |ψ| = ${magnitude.toFixed(2)}. This is the size of ψ before squaring; larger |ψ| can contribute more strongly to density after squaring.`
        : stage.id === "density"
          ? `Squaring gives |ψ|² = ${density.toFixed(2)}. This is the relative probability-density value at the selected point.`
          : `The sign is ${psi >= 0 ? "positive" : "negative"}, but the density is ${density.toFixed(2)}. Flip every sign and that density does not change.`;

  return (
    <LessonShell
      {...props}
      purpose="Learn the distinction that makes orbital pictures readable: ψ is a signed wave amplitude, while |ψ|² is probability density."
      question="At one point in a pᵧ orbital, what do the number and sign of ψ actually mean?"
      feedback={feedback}
      showLearningCycle={false}
      onPrevious={previous}
      onNext={next}
      previousDisabled={props.previousDisabled && atFirstStage}
      nextDisabled={props.nextDisabled && atLastStage}
    >
      <div className="psi-lesson">
        <PsiPrimer />

        <nav className="psi-stage-tabs" aria-label="Read psi lesson stages">
          {stages.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={index === stageIndex ? "is-active" : ""}
              onClick={() => chooseStage(index)}
              aria-current={index === stageIndex ? "step" : undefined}
            >
              <span>{index + 1}</span>
              {item.shortTitle}
            </button>
          ))}
        </nav>

        <section className="psi-stage-copy">
          <div>
            <p className="psi-stage-copy__eyebrow">Step {stageIndex + 1} of {stages.length}</p>
            <h2>{stage.title}</h2>
            <p>{stage.lead}</p>
            {stage.id === "read" ? (
              <aside className="psi-explainer" aria-label="What psi does">
                <strong>What does ψ do?</strong>
                <p>
                  ψ is the input for prediction. Its size tells where electron
                  density can appear after squaring it. Its sign tells phase, so
                  matching signs add and opposite signs cancel. You will learn
                  more about this in the next lesson, but that is why ψ, not
                  just |ψ|², controls nodes, bonding, and antibonding.
                </p>
              </aside>
            ) : null}
          </div>
          <div className="psi-stage-equation">{stage.equation}</div>
          <p className="psi-stage-correction">
            <strong>Do not read it this way:</strong> {stage.correction}
          </p>
        </section>

        {stage.id === "probability3d" ? (
          <Suspense
            fallback={
              <div className="orbital3d-loading" role="status">
                Loading the 3D probability explorer…
              </div>
            }
          >
            <LazyPyOrbitalExplorer
              alpha={alpha}
              globalPhase={overallSign}
              onAlphaChange={setAlpha}
              onGlobalPhaseChange={setOverallSign}
            />
          </Suspense>
        ) : (
          <>
            <div className="psi-visual-grid">
              <section className="psi-plot-card">
                <FunctionPlot probeY={probeY} stage={stage.id} overallSign={overallSign} />
              </section>
              <section className="psi-orbital-card">
                <OrbitalCartoon probeY={probeY} overallSign={overallSign} />
                <p>
                  This is a conventional contour-style cartoon. The lobe
                  surfaces are not hard boundaries; they show where the orbital
                  amplitude is large enough to draw.
                </p>
              </section>
            </div>

            <section className="psi-probe-controls" aria-label="Orbital probe controls">
              <div className="psi-slider-row">
                <label htmlFor="psi-probe-y">
                  Move the probe along the pᵧ lobe axis
                  <span>y = {probeY.toFixed(2)}</span>
                </label>
                <input
                  id="psi-probe-y"
                  type="range"
                  min={Y_MIN}
                  max={Y_MAX}
                  step="0.05"
                  value={probeY}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setProbeY(Number(event.target.value))
                  }
                />
              </div>
              <div className="psi-preset-buttons" aria-label="Probe position presets">
                <button type="button" onClick={() => setProbeY(-1)}>
                  −y lobe
                </button>
                <button type="button" onClick={() => setProbeY(0)}>
                  node
                </button>
                <button type="button" onClick={() => setProbeY(1)}>
                  +y lobe
                </button>
              </div>
              {stage.id === "sign" ? (
                <div className="psi-sign-toggle" aria-label="Global phase sign">
                  <span>Flip every sign:</span>
                  <button
                    type="button"
                    className={overallSign === 1 ? "is-active" : ""}
                    onClick={() => setOverallSign(1)}
                    aria-pressed={overallSign === 1}
                  >
                    original signs
                  </button>
                  <button
                    type="button"
                    className={overallSign === -1 ? "is-active" : ""}
                    onClick={() => setOverallSign(-1)}
                    aria-pressed={overallSign === -1}
                  >
                    flip all signs
                  </button>
                </div>
              ) : null}
            </section>

            <EquationWorkbench
              activeReadout={activeReadout}
              density={density}
              magnitude={magnitude}
              overallSign={overallSign}
              psi={psi}
              probeY={probeY}
            />

            <section className="psi-readout-grid" aria-label="Values at the selected point">
              <button
                type="button"
                className={`psi-readout-card${activeReadout === "location" ? " is-emphasized" : ""}`}
                onClick={() => setActiveReadout("location")}
                aria-pressed={activeReadout === "location"}
              >
                <span>Location</span>
                <strong>y = {probeY.toFixed(2)}</strong>
                <p>One point on the horizontal y axis.</p>
              </button>
              <button
                type="button"
                className={`psi-readout-card${activeReadout === "amplitude" ? " is-emphasized" : ""}`}
                onClick={() => setActiveReadout("amplitude")}
                aria-pressed={activeReadout === "amplitude"}
              >
                <span>Wave amplitude</span>
                <strong>ψ = {formatSigned(psi)}</strong>
                <p>Signed and scaled. This is not probability.</p>
              </button>
              <button
                type="button"
                className={`psi-readout-card${activeReadout === "magnitude" ? " is-emphasized" : ""}`}
                onClick={() => setActiveReadout("magnitude")}
                aria-pressed={activeReadout === "magnitude"}
              >
                <span>Size of ψ</span>
                <strong>|ψ| = {magnitude.toFixed(2)}</strong>
                <p>How much amplitude is present before squaring.</p>
              </button>
              <button
                type="button"
                className={`psi-readout-card${activeReadout === "density" ? " is-emphasized" : ""}`}
                onClick={() => setActiveReadout("density")}
                aria-pressed={activeReadout === "density"}
              >
                <span>Probability density</span>
                <strong>|ψ|² = {density.toFixed(2)}</strong>
                <p>Relative density in this scaled teaching model.</p>
              </button>
            </section>
          </>
        )}

        <details className="psi-going-deeper">
          <summary>Why a textbook p-orbital picture looks like two lobes</summary>
          <p>
            A pᵧ orbital changes sign across the plane y = 0. That plane is the
            xz nodal plane, and it passes through the nucleus. The familiar two
            lobes are a chosen contour of the three-dimensional function—not a
            container with an electron trapped inside it.
          </p>
        </details>

        <nav className="psi-stage-actions" aria-label="Stage navigation">
          <button type="button" onClick={previous} disabled={props.previousDisabled && atFirstStage}>
            {atFirstStage ? "Previous lesson" : "Previous step"}
          </button>
          <span>
            Step {stageIndex + 1} of {stages.length}
          </span>
          <button type="button" onClick={next} disabled={props.nextDisabled && atLastStage}>
            {atLastStage ? "Next lesson" : "Next step"}
          </button>
        </nav>
      </div>
    </LessonShell>
  );
}
