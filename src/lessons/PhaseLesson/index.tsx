import { useMemo, useState } from "react";
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
    title: "ψ is a value assigned to every point in space",
    lead: "Say “sigh.” A p orbital does not have one ψ value. It has a value at every location. The graph below shows those values along one line through the atom.",
    equation: "position x  →  ψ(x)",
    correction:
      "The graph going above and below zero does not split the atom. Horizontal position is location in space. Vertical position is the number ψ has at that location.",
  },
  {
    id: "magnitude",
    shortTitle: "Magnitude",
    title: "Magnitude means distance from zero",
    lead: "The magnitude |ψ| ignores the sign. It tells how far the function value is from zero at the selected location.",
    equation: "ψ = −0.80  →  |ψ| = 0.80",
    correction:
      "A larger |ψ| does not mean a larger atom, extra charge, or an extra lobe. It means the function has a larger magnitude at that point in space.",
  },
  {
    id: "density",
    shortTitle: "Square it",
    title: "Squaring ψ gives a density-like quantity",
    lead: "The contribution of one orbital to electron density depends on |ψ|². Squaring removes the sign, so both positive and negative ψ values give a nonnegative result.",
    equation: "ρ(x) = |ψ(x)|²",
    correction:
      "ψ and |ψ|² are different pictures. ψ keeps phase information. |ψ|² shows relative density and cannot be negative.",
  },
  {
    id: "sign",
    shortTitle: "Swap signs",
    title: "The two colors are sign labels, not two kinds of charge",
    lead: "We may reverse every sign in an orbital: every positive value becomes negative and every negative value becomes positive. The density remains unchanged.",
    equation: "ψ → −ψ, but |ψ|² is unchanged",
    correction:
      "This all-at-once sign swap is sometimes called a global phase change. The term matters less than the result: the density does not change. Relative signs matter when two orbitals interact.",
  },
] as const;

const X_MIN = -2.8;
const X_MAX = 2.8;
const PLOT_LEFT = 62;
const PLOT_RIGHT = 638;
const PSI_BASELINE = 150;
const PSI_SCALE = 92;
const DENSITY_BASELINE = 346;
const DENSITY_SCALE = 92;

function xToSvg(x: number): number {
  return PLOT_LEFT + ((x - X_MIN) / (X_MAX - X_MIN)) * (PLOT_RIGHT - PLOT_LEFT);
}

function psiToSvg(value: number): number {
  return PSI_BASELINE - value * PSI_SCALE;
}

function densityToSvg(value: number): number {
  return DENSITY_BASELINE - value * DENSITY_SCALE;
}

function makePath(values: readonly { x: number; y: number }[]): string {
  return values
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${xToSvg(point.x).toFixed(2)} ${point.y.toFixed(2)}`,
    )
    .join(" ");
}

function FunctionPlot({
  probeX,
  stage,
  overallSign,
}: {
  probeX: number;
  stage: StageId;
  overallSign: PhaseSign;
}) {
  const showMagnitude = stage !== "read";
  const showDensity = stage === "density" || stage === "sign";
  const showReference = stage === "sign" && overallSign === -1;

  const samples = useMemo(
    () =>
      Array.from({ length: 141 }, (_, index) => {
        const x = X_MIN + (index / 140) * (X_MAX - X_MIN);
        return { x, psi: teachingPOrbital(x, overallSign) };
      }),
    [overallSign],
  );

  const referenceSamples = useMemo(
    () =>
      Array.from({ length: 141 }, (_, index) => {
        const x = X_MIN + (index / 140) * (X_MAX - X_MIN);
        return { x, psi: teachingPOrbital(x, 1) };
      }),
    [],
  );

  const left = samples.filter((point) => point.x <= 0);
  const right = samples.filter((point) => point.x >= 0);
  const leftSign =
    teachingPOrbital(-1, overallSign) >= 0 ? "positive" : "negative";
  const rightSign =
    teachingPOrbital(1, overallSign) >= 0 ? "positive" : "negative";
  const leftPath = makePath(
    left.map((point) => ({ x: point.x, y: psiToSvg(point.psi) })),
  );
  const rightPath = makePath(
    right.map((point) => ({ x: point.x, y: psiToSvg(point.psi) })),
  );
  const densityPath = makePath(
    samples.map((point) => ({
      x: point.x,
      y: densityToSvg(relativeDensity(point.psi)),
    })),
  );
  const referencePath = makePath(
    referenceSamples.map((point) => ({ x: point.x, y: psiToSvg(point.psi) })),
  );

  const probePsi = teachingPOrbital(probeX, overallSign);
  const probeDensity = relativeDensity(probePsi);
  const probeSvgX = xToSvg(probeX);
  const probePsiY = psiToSvg(probePsi);
  const probeDensityY = densityToSvg(probeDensity);
  const probeClass = probePsi >= 0 ? "positive" : "negative";

  return (
    <svg
      className="wave-plot"
      viewBox="0 0 700 410"
      role="img"
      aria-label="Graph of psi along a line through a p orbital, with a movable probe and an optional graph of psi squared"
    >
      <rect
        x="18"
        y="18"
        width="664"
        height="374"
        rx="18"
        className="wave-frame"
      />

      <text x="38" y="43" className="wave-panel-title">
        ψ(x): signed orbital value
      </text>
      <rect
        x={PLOT_LEFT}
        y="54"
        width={PLOT_RIGHT - PLOT_LEFT}
        height={PSI_BASELINE - 54}
        className="wave-positive-zone"
      />
      <rect
        x={PLOT_LEFT}
        y={PSI_BASELINE}
        width={PLOT_RIGHT - PLOT_LEFT}
        height="94"
        className="wave-negative-zone"
      />
      <line
        x1={PLOT_LEFT}
        x2={PLOT_RIGHT}
        y1={PSI_BASELINE}
        y2={PSI_BASELINE}
        className="wave-axis"
      />
      <line
        x1={xToSvg(0)}
        x2={xToSvg(0)}
        y1="54"
        y2="244"
        className="wave-node"
      />
      <text x={xToSvg(0) + 8} y="68" className="wave-node-label">
        node: ψ = 0
      </text>
      <text
        x={PLOT_LEFT - 12}
        y="72"
        textAnchor="end"
        className="wave-axis-label"
      >
        positive
      </text>
      <text
        x={PLOT_LEFT - 12}
        y="231"
        textAnchor="end"
        className="wave-axis-label"
      >
        negative
      </text>
      <text x={PLOT_RIGHT} y="266" textAnchor="end" className="wave-axis-label">
        position x
      </text>

      {showReference ? (
        <path d={referencePath} className="wave-reference" />
      ) : null}
      <path d={leftPath} className={`wave-curve wave-curve--${leftSign}`} />
      <path d={rightPath} className={`wave-curve wave-curve--${rightSign}`} />

      <line
        x1={probeSvgX}
        x2={probeSvgX}
        y1="50"
        y2={showDensity ? DENSITY_BASELINE : 244}
        className="wave-probe-line"
      />
      {showMagnitude ? (
        <line
          x1={probeSvgX}
          x2={probeSvgX}
          y1={PSI_BASELINE}
          y2={probePsiY}
          className="wave-magnitude-line"
        />
      ) : null}
      <circle
        cx={probeSvgX}
        cy={probePsiY}
        r="7"
        className={`wave-probe wave-probe--${probeClass}`}
      />
      <text x={probeSvgX + 10} y={probePsiY - 12} className="wave-probe-label">
        ψ = {formatSigned(probePsi)}
      </text>
      {showMagnitude ? (
        <text
          x={probeSvgX + 10}
          y={(PSI_BASELINE + probePsiY) / 2}
          className="wave-magnitude-label"
        >
          |ψ|
        </text>
      ) : null}

      {showDensity ? (
        <>
          <text x="38" y="286" className="wave-panel-title">
            |ψ(x)|²: relative density contribution
          </text>
          <line
            x1={PLOT_LEFT}
            x2={PLOT_RIGHT}
            y1={DENSITY_BASELINE}
            y2={DENSITY_BASELINE}
            className="wave-axis"
          />
          <line
            x1={xToSvg(0)}
            x2={xToSvg(0)}
            y1="292"
            y2={DENSITY_BASELINE}
            className="wave-node"
          />
          <path
            d={`${densityPath} L ${PLOT_RIGHT} ${DENSITY_BASELINE} L ${PLOT_LEFT} ${DENSITY_BASELINE} Z`}
            className="density-area"
          />
          <path d={densityPath} className="density-curve" />
          <circle
            cx={probeSvgX}
            cy={probeDensityY}
            r="7"
            className="density-probe"
          />
          <text
            x={probeSvgX + 10}
            y={probeDensityY - 10}
            className="wave-probe-label"
          >
            |ψ|² = {probeDensity.toFixed(2)}
          </text>
        </>
      ) : (
        <g className="density-preview">
          <rect x="62" y="286" width="576" height="78" rx="12" />
          <text x="350" y="320" textAnchor="middle">
            Next, you will square ψ.
          </text>
          <text x="350" y="344" textAnchor="middle">
            That creates a different graph.
          </text>
        </g>
      )}
    </svg>
  );
}

function OrbitalCartoon({
  probeX,
  overallSign,
}: {
  probeX: number;
  overallSign: PhaseSign;
}) {
  const leftSign =
    teachingPOrbital(-1, overallSign) >= 0 ? "positive" : "negative";
  const rightSign =
    teachingPOrbital(1, overallSign) >= 0 ? "positive" : "negative";
  const probePosition = 36 + ((probeX - X_MIN) / (X_MAX - X_MIN)) * 288;

  return (
    <svg
      className="orbital-cartoon"
      viewBox="0 0 360 190"
      role="img"
      aria-label="Cartoon of a horizontal p orbital showing a node at the nucleus and a probe moving through the two lobes"
    >
      <rect
        x="10"
        y="10"
        width="340"
        height="170"
        rx="16"
        className="wave-frame"
      />
      <text x="24" y="34" className="wave-panel-title">
        The same line through a p-orbital cartoon
      </text>
      <ellipse
        cx="112"
        cy="98"
        rx="78"
        ry="43"
        className={`orbital-lobe orbital-lobe--${leftSign}`}
      />
      <ellipse
        cx="248"
        cy="98"
        rx="78"
        ry="43"
        className={`orbital-lobe orbital-lobe--${rightSign}`}
      />
      <line x1="180" x2="180" y1="48" y2="148" className="orbital-node" />
      <circle cx="180" cy="98" r="7" className="orbital-nucleus" />
      <text x="180" y="165" textAnchor="middle" className="wave-node-label">
        nucleus lies in the nodal plane
      </text>
      <text x="112" y="105" textAnchor="middle" className="orbital-sign">
        {leftSign === "positive" ? "+" : "−"}
      </text>
      <text x="248" y="105" textAnchor="middle" className="orbital-sign">
        {rightSign === "positive" ? "+" : "−"}
      </text>
      <line
        x1={probePosition}
        x2={probePosition}
        y1="52"
        y2="144"
        className="cartoon-probe-line"
      />
      <circle cx={probePosition} cy="98" r="5" className="cartoon-probe" />
    </svg>
  );
}

export function PhaseLesson(props: LessonComponentProps) {
  const [stageIndex, setStageIndex] = useState(0);
  const [probeX, setProbeX] = useState(-1);
  const [overallSign, setOverallSign] = useState<PhaseSign>(1);

  const stage = stages[stageIndex];
  const psi = teachingPOrbital(probeX, overallSign);
  const magnitude = Math.abs(psi);
  const density = relativeDensity(psi);
  const atNode = Math.abs(probeX) < 0.06;
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
    ? "You placed the probe at the node. Here ψ = 0, so |ψ| and |ψ|² are also zero."
    : stage.id === "read"
      ? `At x = ${probeX.toFixed(2)}, the orbital function has the signed value ψ = ${formatSigned(psi)}.`
      : stage.id === "magnitude"
        ? `At this point ψ = ${formatSigned(psi)}, while |ψ| = ${magnitude.toFixed(2)}. Magnitude is distance from zero.`
        : stage.id === "density"
          ? `Squaring ψ gives ${density.toFixed(2)}. The density contribution is nonnegative on both sides of the node.`
          : `The sign is now ${overallSign === 1 ? "in the original convention" : "reversed everywhere"}, but |ψ|² at the probe is still ${density.toFixed(2)}.`;

  return (
    <LessonShell
      meta={props.meta}
      purpose="Build the meaning of ψ before using it to construct molecular orbitals."
      question="What do the sign, magnitude, square, and colors in an orbital picture actually mean?"
      feedback={feedback}
      showPhaseLegend={stageIndex > 0}
      showLearningCycle={false}
      onPrevious={previous}
      onNext={next}
      previousDisabled={atFirstStage ? props.previousDisabled : false}
      nextDisabled={atLastStage ? props.nextDisabled : false}
    >
      <section className="guided-lesson" aria-labelledby="phase-stage-title">
        <nav className="guided-stepper" aria-label="Steps in this lesson">
          {stages.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={`${index === stageIndex ? "is-current" : ""} ${index < stageIndex ? "is-complete" : ""}`.trim()}
              onClick={() => chooseStage(index)}
              aria-current={index === stageIndex ? "step" : undefined}
            >
              <span>{index + 1}</span>
              {item.shortTitle}
            </button>
          ))}
        </nav>

        <div className="guided-stage">
          <div className="guided-copy">
            <p className="guided-kicker">
              Step {stageIndex + 1} of {stages.length}
            </p>
            <h2 id="phase-stage-title">{stage.title}</h2>
            <p className="guided-lead">{stage.lead}</p>
            <div
              className="plain-equation"
              aria-label={`Equation: ${stage.equation}`}
            >
              {stage.equation}
            </div>
            <aside className="concept-correction">
              <strong>Do not read the picture this way</strong>
              <p>{stage.correction}</p>
            </aside>

            {stage.id === "sign" ? (
              <button
                type="button"
                className="sign-swap-button"
                onClick={() =>
                  setOverallSign((value) => (value === 1 ? -1 : 1))
                }
              >
                Swap every + and − sign
              </button>
            ) : null}
          </div>

          <div className="guided-visual">
            <FunctionPlot
              probeX={probeX}
              stage={stage.id}
              overallSign={overallSign}
            />
            <OrbitalCartoon probeX={probeX} overallSign={overallSign} />

            <div className="probe-panel">
              <label htmlFor="orbital-probe">
                <span>Move one point through the orbital</span>
                <strong>x = {probeX.toFixed(2)}</strong>
              </label>
              <input
                id="orbital-probe"
                type="range"
                min={X_MIN}
                max={X_MAX}
                step="0.05"
                value={probeX}
                onChange={(event) => setProbeX(Number(event.target.value))}
              />
              <div
                className="probe-presets"
                aria-label="Probe position presets"
              >
                <button type="button" onClick={() => setProbeX(-1)}>
                  Left lobe
                </button>
                <button type="button" onClick={() => setProbeX(0)}>
                  Node
                </button>
                <button type="button" onClick={() => setProbeX(1)}>
                  Right lobe
                </button>
              </div>
            </div>

            <div className="value-grid" aria-live="polite">
              <div className="value-card">
                <span>signed value</span>
                <strong>ψ = {formatSigned(psi)}</strong>
              </div>
              <div
                className={`value-card ${stageIndex < 1 ? "is-locked" : ""}`}
              >
                <span>magnitude</span>
                <strong>
                  {stageIndex < 1
                    ? "next step"
                    : `|ψ| = ${magnitude.toFixed(2)}`}
                </strong>
              </div>
              <div
                className={`value-card ${stageIndex < 2 ? "is-locked" : ""}`}
              >
                <span>relative density</span>
                <strong>
                  {stageIndex < 2 ? "later" : `|ψ|² = ${density.toFixed(2)}`}
                </strong>
              </div>
            </div>
          </div>
        </div>

        <div className="guided-actions">
          <button
            type="button"
            onClick={previous}
            disabled={atFirstStage && props.previousDisabled}
          >
            {atFirstStage ? "Previous lesson" : "Back one idea"}
          </button>
          <button
            type="button"
            className="guided-actions__primary"
            onClick={next}
            disabled={atLastStage && props.nextDisabled}
          >
            {atLastStage ? "Continue to combining orbitals" : "Continue"}
          </button>
        </div>
      </section>

      <details className="going-deeper">
        <summary>Going deeper: why chemists say “global phase”</summary>
        <p>
          Reversing every sign multiplies the whole orbital by −1. That
          operation is called a global phase change. It does not alter |ψ|². In
          the next lesson, the important idea is relative phase: whether two
          overlapping orbital values have matching or opposite signs.
        </p>
      </details>
    </LessonShell>
  );
}
