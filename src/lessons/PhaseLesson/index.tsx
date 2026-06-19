import { useMemo, useState, type ChangeEvent } from "react";
import { LessonShell } from "../../components/LessonShell/LessonShell";
import {
  formatSigned,
  relativeDensity,
  teachingPOrbital,
  type PhaseSign,
} from "../../models/teachingWave";
import type { LessonComponentProps } from "../types";

type StageId = "read" | "magnitude" | "density" | "sign";

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
    lead: "Every point in space gets a value ψ(x, y, z). Here we follow one line: the y axis through a pᵧ orbital. The sign tells phase, and the size tells amplitude.",
    equation: "point (x, y, z)  →  ψ(x, y, z)",
    correction:
      "The +1 and −1 values on this page are scaled teaching values. They mean equal amplitude with opposite phase. They do not mean +100% and −100% probability.",
  },
  {
    id: "magnitude",
    shortTitle: "Magnitude",
    title: "|ψ| tells how large the amplitude is at that point",
    lead: "Magnitude means distance from zero. It ignores whether ψ is positive or negative, but it does not yet give a probability.",
    equation: "ψ = −0.80  →  |ψ| = 0.80",
    correction:
      "A larger |ψ| does not mean a larger atom, extra charge, or an extra lobe. It means the wave amplitude is larger at that location.",
  },
  {
    id: "density",
    shortTitle: "Square it",
    title: "|ψ|² is the probability density",
    lead: "For one electron in this orbital, |ψ|² tells how the probability of finding the electron is distributed through space. Squaring removes the sign, so probability density cannot be negative.",
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
] as const;

const Y_MIN = -2.8;
const Y_MAX = 2.8;
const PLOT_LEFT = 70;
const PLOT_RIGHT = 650;
const PSI_BASELINE = 156;
const PSI_SCALE = 88;
const DENSITY_BASELINE = 354;
const DENSITY_SCALE = 86;

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

function PsiPrimer() {
  return (
    <section className="psi-primer" aria-label="Psi and probability density">
      <div className="psi-primer__item">
        <span className="psi-primer__symbol">ψ</span>
        <div>
          <h3>Wave amplitude</h3>
          <p>
            Pronounced “sigh.” It can be positive, negative, or zero in these
            real orbital pictures. Its sign records phase.
          </p>
        </div>
      </div>
      <span className="psi-primer__arrow" aria-hidden="true">
        square it →
      </span>
      <div className="psi-primer__item psi-primer__item--density">
        <span className="psi-primer__symbol">|ψ|²</span>
        <div>
          <h3>Probability density</h3>
          <p>
            This is the quantity connected to where an electron may be found.
            It is never negative.
          </p>
        </div>
      </div>
      <p className="psi-primer__scale-note">
        On this page, ψ is rescaled so the largest lobe has |ψ| = 1. That “1”
        is a relative amplitude, not a 100% probability.
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
            Square it to obtain probability density: |ψ|².
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

  const stage = stages[stageIndex];
  const psi = teachingPOrbital(probeY, overallSign);
  const magnitude = Math.abs(psi);
  const density = relativeDensity(psi);
  const atNode = Math.abs(probeY) < 0.06;
  const atFirstStage = stageIndex === 0;
  const atLastStage = stageIndex === stages.length - 1;

  const chooseStage = (index: number) => {
    setStageIndex(index);
    if (index < stages.length - 1) {
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

  const feedback = atNode
    ? "The probe is in the xz nodal plane. Here ψ = 0, so the probability density |ψ|² is also zero."
    : stage.id === "read"
      ? `At y = ${probeY.toFixed(2)}, ψ = ${formatSigned(psi)} on this scaled amplitude plot. That number is not a probability.`
      : stage.id === "magnitude"
        ? `At this point, |ψ| = ${magnitude.toFixed(2)}. Magnitude ignores the sign but is still an amplitude.`
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
          </div>
          <div className="psi-stage-equation">{stage.equation}</div>
          <p className="psi-stage-correction">
            <strong>Do not read it this way:</strong> {stage.correction}
          </p>
        </section>

        <div className="psi-visual-grid">
          <section className="psi-plot-card">
            <FunctionPlot probeY={probeY} stage={stage.id} overallSign={overallSign} />
          </section>
          <section className="psi-orbital-card">
            <OrbitalCartoon probeY={probeY} overallSign={overallSign} />
            <p>
              This is a conventional contour-style cartoon. The lobe surfaces are
              not hard boundaries; they show where the orbital amplitude is large
              enough to draw.
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

        <section className="psi-readout-grid" aria-label="Values at the selected point">
          <article>
            <span>Location</span>
            <strong>y = {probeY.toFixed(2)}</strong>
            <p>One point on the horizontal y axis.</p>
          </article>
          <article className={stage.id === "read" ? "is-emphasized" : ""}>
            <span>Wave amplitude</span>
            <strong>ψ = {formatSigned(psi)}</strong>
            <p>Signed and scaled. This is not probability.</p>
          </article>
          <article className={stage.id === "magnitude" ? "is-emphasized" : ""}>
            <span>Magnitude</span>
            <strong>|ψ| = {magnitude.toFixed(2)}</strong>
            <p>Distance from zero; sign removed.</p>
          </article>
          <article className={stage.id === "density" || stage.id === "sign" ? "is-emphasized" : ""}>
            <span>Probability density</span>
            <strong>|ψ|² = {density.toFixed(2)}</strong>
            <p>Relative density in this scaled teaching model.</p>
          </article>
        </section>

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
