import { useMemo, useState } from "react";
import { LessonShell } from "../../components/LessonShell/LessonShell";
import type { LessonComponentProps } from "../types";

type Phase = 1 | -1;
type StageId = "one-point" | "all-space" | "weights";

interface StageCopy {
  id: StageId;
  shortTitle: string;
  title: string;
  lead: string;
}

const stages: readonly StageCopy[] = [
  {
    id: "one-point",
    shortTitle: "One point",
    title: "First, add the two orbital values at one point",
    lead: "At a chosen point in space, orbital A gives one signed number and orbital B gives another. Add those two numbers. Matching signs reinforce; opposite signs cancel.",
  },
  {
    id: "all-space",
    shortTitle: "Every point",
    title: "A molecular orbital repeats that addition everywhere",
    lead: "Repeat the signed addition at every point. Matching signs create continuous same-phase regions across the atoms; opposite signs create a nodal surface where the amplitude is zero.",
  },
  {
    id: "weights",
    shortTitle: "Weights",
    title: "Weights change how strongly each starting orbital contributes",
    lead: "Weights scale wave amplitudes before addition. The molecular orbital changes first; squaring the combined ψ gives |ψ|², so unequal weights shift the density distribution toward the larger contribution.",
  },
] as const;

function formatNumber(value: number): string {
  if (Math.abs(value) < 0.005) return "0.00";
  return `${value > 0 ? "+" : "−"}${Math.abs(value).toFixed(2)}`;
}

function PointAddition({
  weightA,
  weightB,
  phaseB,
}: {
  weightA: number;
  weightB: number;
  phaseB: Phase;
}) {
  const baseValue = 0.6;
  const valueA = baseValue * weightA;
  const valueB = baseValue * weightB * phaseB;
  const result = valueA + valueB;
  const resultClass =
    Math.abs(result) < 0.01
      ? "is-zero"
      : result > 0
        ? "is-positive"
        : "is-negative";

  return (
    <div
      className="point-addition"
      aria-label="Addition of two orbital values at one highlighted point"
    >
      <div className="number-tile number-tile--a">
        <span>orbital A at this point</span>
        <strong>{formatNumber(valueA)}</strong>
      </div>
      <span className="number-operator" aria-hidden="true">
        +
      </span>
      <div className="number-tile number-tile--b">
        <span>orbital B at this point</span>
        <strong>{formatNumber(valueB)}</strong>
      </div>
      <span className="number-operator" aria-hidden="true">
        =
      </span>
      <div className={`number-tile number-tile--result ${resultClass}`}>
        <span>new MO at this point</span>
        <strong>{formatNumber(result)}</strong>
      </div>
    </div>
  );
}

function FacingLobes({ phaseB }: { phaseB: Phase }) {
  const rightClass = phaseB === 1 ? "positive" : "negative";

  return (
    <svg
      className="facing-lobes"
      viewBox="0 0 620 190"
      role="img"
      aria-label="Facing lobes on atoms A and B with matching or opposite signs at a highlighted point between the atoms"
    >
      <rect
        x="12"
        y="12"
        width="596"
        height="166"
        rx="18"
        className="wave-frame"
      />
      <text x="28" y="38" className="wave-panel-title">
        Look only at the highlighted point between the atoms
      </text>
      <ellipse
        cx="220"
        cy="104"
        rx="96"
        ry="42"
        className="orbital-lobe orbital-lobe--positive"
      />
      <ellipse
        cx="400"
        cy="104"
        rx="96"
        ry="42"
        className={`orbital-lobe orbital-lobe--${rightClass}`}
      />
      <circle cx="154" cy="104" r="7" className="orbital-nucleus" />
      <circle cx="466" cy="104" r="7" className="orbital-nucleus" />
      <text x="154" y="154" textAnchor="middle" className="atom-caption">
        atom A
      </text>
      <text x="466" y="154" textAnchor="middle" className="atom-caption">
        atom B
      </text>
      <text x="220" y="111" textAnchor="middle" className="orbital-sign">
        +
      </text>
      <text x="400" y="111" textAnchor="middle" className="orbital-sign">
        {phaseB === 1 ? "+" : "−"}
      </text>
      <circle cx="310" cy="104" r="12" className="highlight-point" />
      <line x1="310" x2="310" y1="64" y2="84" className="highlight-pointer" />
      <text x="310" y="57" textAnchor="middle" className="highlight-label">
        same location in space
      </text>
    </svg>
  );
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function coefficientShares(weightA: number, weightB: number) {
  const magnitudeA = Math.abs(weightA);
  const magnitudeB = Math.abs(weightB);
  const amplitudeTotal = magnitudeA + magnitudeB || 1;
  const densityTotal = magnitudeA ** 2 + magnitudeB ** 2 || 1;

  return {
    amplitudeA: magnitudeA / amplitudeTotal,
    amplitudeB: magnitudeB / amplitudeTotal,
    densityA: magnitudeA ** 2 / densityTotal,
    densityB: magnitudeB ** 2 / densityTotal,
  };
}

function gaussianSlice(x: number, center: number, width: number): number {
  return Math.exp(-((x - center) ** 2) / (2 * width ** 2));
}

function svgPath(points: readonly { x: number; y: number }[]): string {
  return points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`,
    )
    .join(" ");
}

function StartingOrbital({
  centerX,
  phase,
  weight,
  atom,
}: {
  centerX: number;
  phase: Phase;
  weight: number;
  atom: string;
}) {
  const scale = 0.78 + 0.34 * Math.sqrt(Math.abs(weight));
  const rx = 26 * scale;
  const ry = 42 * scale;
  const topClass = phase === 1 ? "positive" : "negative";
  const bottomClass = phase === 1 ? "negative" : "positive";

  return (
    <g>
      <line
        x1={centerX}
        x2={centerX}
        y1="88"
        y2="238"
        className="combine-axis"
      />
      <ellipse
        cx={centerX}
        cy="132"
        rx={rx}
        ry={ry}
        className={`combine-phase combine-phase--${topClass}`}
      />
      <ellipse
        cx={centerX}
        cy="194"
        rx={rx}
        ry={ry}
        className={`combine-phase combine-phase--${bottomClass}`}
      />
      <circle cx={centerX} cy="163" r="5" className="combine-nucleus" />
      <text x={centerX} y="139" textAnchor="middle" className="combine-sign">
        {phase === 1 ? "+" : "−"}
      </text>
      <text x={centerX} y="201" textAnchor="middle" className="combine-sign">
        {phase === 1 ? "−" : "+"}
      </text>
      <text
        x={centerX}
        y="258"
        textAnchor="middle"
        className="combine-atom-label"
      >
        atom {atom}
      </text>
      <text
        x={centerX}
        y="279"
        textAnchor="middle"
        className="combine-weight-label"
      >
        c{atom} = {Math.abs(weight).toFixed(2)}
      </text>
    </g>
  );
}

function ResultingMoDiagram({
  weightA,
  weightB,
  phaseB,
}: {
  weightA: number;
  weightB: number;
  phaseB: Phase;
}) {
  const samePhase = weightA * weightB * phaseB >= 0;
  const shares = coefficientShares(weightA, weightB);
  const leftX = 596;
  const rightX = 704;
  const middleX = (leftX + rightX) / 2;
  const topY = 134;
  const bottomY = 210;
  const overlapBalance = 2 * Math.sqrt(shares.amplitudeA * shares.amplitudeB);
  const leftRx = 42 + shares.amplitudeA * 34;
  const rightRx = 42 + shares.amplitudeB * 34;
  const lobeRy = 28;
  const blendRx = 34 + 28 * overlapBalance;
  const blendRy = 14 + 9 * overlapBalance;
  const densityLeft = 510;
  const densityRight = 790;
  const densityBaseY = 350;
  const densityTopY = 300;
  const densityHeight = densityBaseY - densityTopY;
  const densityWidth = 54;
  const densitySamples = Array.from({ length: 91 }, (_, index) => {
    const x = densityLeft + (index / 90) * (densityRight - densityLeft);
    const phiA = gaussianSlice(x, leftX, densityWidth);
    const phiB = gaussianSlice(x, rightX, densityWidth);
    const psi = Math.abs(weightA) * phiA + phaseB * Math.abs(weightB) * phiB;

    return { x, density: psi ** 2 };
  });
  const maximumDensity =
    Math.max(...densitySamples.map((sample) => sample.density)) || 1;
  const densityPoints = densitySamples.map((sample) => ({
    x: sample.x,
    y: densityBaseY - (sample.density / maximumDensity) * densityHeight,
  }));
  const densityAreaPath = `${svgPath(densityPoints)} L ${densityRight.toFixed(
    2,
  )} ${densityBaseY.toFixed(2)} L ${densityLeft.toFixed(2)} ${densityBaseY.toFixed(
    2,
  )} Z`;
  const densityCurvePath = svgPath(densityPoints);
  const minimumDensitySample = densitySamples.reduce((best, sample) =>
    sample.density < best.density ? sample : best,
  );
  const nodeX = samePhase
    ? middleX
    : clamp(minimumDensitySample.x, leftX + 22, rightX - 22);
  const strongerAtom = shares.densityA > shares.densityB ? "A" : "B";
  const weakerAtom = strongerAtom === "A" ? "B" : "A";
  const nearlyEqual = Math.abs(shares.densityA - shares.densityB) < 0.04;
  const title = samePhase
    ? "Matched signs: constructive combination"
    : "Opposite signs: destructive combination";
  const caption = samePhase
    ? nearlyEqual
      ? "The wave amplitude joins across both atoms, and |ψ|² builds up between them."
      : `The wave amplitude remains connected, while |ψ|² shifts toward atom ${strongerAtom}.`
    : nearlyEqual
      ? "Cancellation creates a node halfway between the atoms, where |ψ|² is zero."
      : `Cancellation still creates a node, shifted toward the weaker contribution on atom ${weakerAtom}.`;

  return (
    <figure className="combine-values-figure">
      <svg
        className="combine-values-svg"
        viewBox="0 0 840 390"
        role="img"
        aria-labelledby="combine-values-title combine-values-description"
      >
        <title id="combine-values-title">{title}</title>
        <desc id="combine-values-description">{caption}</desc>

        <rect
          x="14"
          y="18"
          width="202"
          height="304"
          rx="12"
          className="combine-panel"
        />
        <rect
          x="230"
          y="18"
          width="202"
          height="304"
          rx="12"
          className="combine-panel"
        />
        <rect
          x="446"
          y="18"
          width="380"
          height="354"
          rx="12"
          className="combine-panel combine-panel--result"
        />

        <text
          x="115"
          y="52"
          textAnchor="middle"
          className="combine-panel-title"
        >
          Starting A
        </text>
        <text
          x="331"
          y="52"
          textAnchor="middle"
          className="combine-panel-title"
        >
          Starting B
        </text>
        <text
          x="636"
          y="52"
          textAnchor="middle"
          className="combine-panel-title"
        >
          Resulting MO
        </text>

        <StartingOrbital
          centerX={115}
          phase={weightA >= 0 ? 1 : -1}
          weight={weightA}
          atom="A"
        />
        <StartingOrbital
          centerX={331}
          phase={phaseB}
          weight={weightB}
          atom="B"
        />

        <text x="466" y="80" className="combine-subtitle">
          wave amplitude ψ
        </text>
        <line
          x1="512"
          x2="788"
          y1="172"
          y2="172"
          className="combine-baseline"
        />

        {samePhase ? (
          <>
            <ellipse
              cx={middleX}
              cy={topY}
              rx={blendRx}
              ry={blendRy}
              className="source-lobe source-lobe--blend combine-source-lobe combine-source-lobe--blend"
            />
            <ellipse
              cx={middleX}
              cy={bottomY}
              rx={blendRx}
              ry={blendRy}
              className="source-lobe source-lobe--blend combine-source-lobe combine-source-lobe--blend"
            />
            <ellipse
              cx={leftX}
              cy={topY}
              rx={leftRx}
              ry={lobeRy}
              className="source-lobe source-lobe--a combine-source-lobe"
            />
            <ellipse
              cx={rightX}
              cy={topY}
              rx={rightRx}
              ry={lobeRy}
              className="source-lobe source-lobe--b combine-source-lobe"
            />
            <ellipse
              cx={leftX}
              cy={bottomY}
              rx={leftRx}
              ry={lobeRy}
              className="source-lobe source-lobe--a combine-source-lobe"
            />
            <ellipse
              cx={rightX}
              cy={bottomY}
              rx={rightRx}
              ry={lobeRy}
              className="source-lobe source-lobe--b combine-source-lobe"
            />
          </>
        ) : (
          <>
            <ellipse
              cx={leftX}
              cy={topY}
              rx={leftRx}
              ry={lobeRy}
              className="source-lobe source-lobe--a combine-source-lobe"
            />
            <ellipse
              cx={rightX}
              cy={topY}
              rx={rightRx}
              ry={lobeRy}
              className="source-lobe source-lobe--b combine-source-lobe"
            />
            <ellipse
              cx={leftX}
              cy={bottomY}
              rx={leftRx}
              ry={lobeRy}
              className="source-lobe source-lobe--a combine-source-lobe"
            />
            <ellipse
              cx={rightX}
              cy={bottomY}
              rx={rightRx}
              ry={lobeRy}
              className="source-lobe source-lobe--b combine-source-lobe"
            />
            <rect
              x={nodeX - 7}
              y="93"
              width="14"
              height="145"
              className="combine-node-gap"
            />
            <line
              x1={nodeX}
              x2={nodeX}
              y1="91"
              y2="242"
              className="combine-node-line"
            />
            <text
              x={nodeX}
              y="259"
              textAnchor="middle"
              className="combine-node-label"
            >
              node
            </text>
          </>
        )}

        <text
          x={leftX}
          y={topY + 7}
          textAnchor="middle"
          className="source-phase-label combine-result-sign"
        >
          +
        </text>
        <text
          x={rightX}
          y={topY + 7}
          textAnchor="middle"
          className="source-phase-label combine-result-sign"
        >
          {phaseB === 1 ? "+" : "−"}
        </text>
        <text
          x={leftX}
          y={bottomY + 7}
          textAnchor="middle"
          className="source-phase-label combine-result-sign"
        >
          −
        </text>
        <text
          x={rightX}
          y={bottomY + 7}
          textAnchor="middle"
          className="source-phase-label combine-result-sign"
        >
          {phaseB === 1 ? "−" : "+"}
        </text>

        <circle cx={leftX} cy="172" r="5" className="combine-nucleus" />
        <circle cx={rightX} cy="172" r="5" className="combine-nucleus" />
        <text
          x={leftX}
          y="181"
          textAnchor="middle"
          className="combine-result-atom"
        >
          A
        </text>
        <text
          x={rightX}
          y="181"
          textAnchor="middle"
          className="combine-result-atom"
        >
          B
        </text>

        <text x="466" y="291" className="combine-subtitle">
          relative |ψ|² from sampled ψ(x)
        </text>
        <line
          x1={densityLeft}
          x2={densityRight}
          y1={densityBaseY}
          y2={densityBaseY}
          className="combine-density-axis"
        />
        <path d={densityAreaPath} className="combine-density-area" />
        <path d={densityCurvePath} className="combine-density-curve" />

        {!samePhase ? (
          <>
            <line
              x1={nodeX}
              x2={nodeX}
              y1={densityTopY - 2}
              y2={densityBaseY + 4}
              className="combine-density-node"
            />
            <text
              x={nodeX}
              y="309"
              textAnchor="middle"
              className="combine-density-label"
            >
              node
            </text>
          </>
        ) : null}
        <text
          x={leftX}
          y="367"
          textAnchor="middle"
          className="combine-density-label"
        >
          A side
        </text>
        <text
          x={rightX}
          y="367"
          textAnchor="middle"
          className="combine-density-label"
        >
          B side
        </text>
      </svg>

      <figcaption className="combine-values-caption">
        <strong>{title}</strong>
        <span>{caption}</span>
        <small>
          Cyan and yellow show how much of the result comes from A and B; their
          overlap marks mixed character. The + and − labels show phase. Green
          is a sampled teaching graph: the app adds two smooth φ values to get
          ψ(x), squares the result, and rescales it for display. It is not an
          experimental density.
        </small>
      </figcaption>
    </figure>
  );
}

export function CombinationLesson(props: LessonComponentProps) {
  const [stageIndex, setStageIndex] = useState(0);
  const [phaseB, setPhaseB] = useState<Phase>(1);
  const [weightB, setWeightB] = useState(1);

  const stage = stages[stageIndex];
  const weightA = 1;
  const effectiveB = weightB * phaseB;
  const atFirstStage = stageIndex === 0;
  const atLastStage = stageIndex === stages.length - 1;

  const equation = useMemo(
    () =>
      `ψ = 1.00 φA ${effectiveB >= 0 ? "+" : "−"} ${Math.abs(effectiveB).toFixed(2)} φB`,
    [effectiveB],
  );

  const chooseStage = (index: number) => {
    setStageIndex(index);
    if (index < 2) {
      setWeightB(1);
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

  const equalWeights = Math.abs(weightB - weightA) < 0.05;
  const strongerAtom = weightB > weightA ? "B" : "A";
  const weakerAtom = strongerAtom === "A" ? "B" : "A";
  const feedback =
    phaseB === -1
      ? equalWeights
        ? "Equal opposite amplitudes cancel at the midpoint. Repeating the cancellation through space creates a nodal surface, where |ψ|² is zero."
        : `Opposite amplitudes still create a nodal surface, but unequal weights move it toward atom ${weakerAtom}, the weaker contribution.`
      : equalWeights
        ? "Matching amplitudes reinforce and join across the atoms. Squaring the combined ψ gives electron-density buildup in the overlap region."
        : `Matching amplitudes still reinforce, while the larger coefficient shifts ψ and the qualitative |ψ|² distribution toward atom ${strongerAtom}.`;

  return (
    <LessonShell
      meta={props.meta}
      purpose="Build a molecular orbital by adding signed orbital values, first at one point and then throughout space."
      question="How can ordinary addition create either electron buildup or a node between two atoms?"
      feedback={feedback}
      showLearningCycle={false}
      onPrevious={previous}
      onNext={next}
      previousDisabled={atFirstStage ? props.previousDisabled : false}
      nextDisabled={atLastStage ? props.nextDisabled : false}
    >
      <section
        className="guided-lesson"
        aria-labelledby="combination-stage-title"
      >
        <nav
          className="guided-stepper guided-stepper--three"
          aria-label="Steps in this lesson"
        >
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

        <div className="guided-stage combination-stage">
          <div className="guided-left-rail">
            <div className="guided-copy">
              <p className="guided-kicker">
                Step {stageIndex + 1} of {stages.length}
              </p>
              <h2 id="combination-stage-title">{stage.title}</h2>
              <p className="guided-lead">{stage.lead}</p>
              <p className="control-context">
                This is relative phase. The question is not which color is
                “really” positive. The question is whether the two values at the
                same location have matching or opposite signs.
              </p>
              {stage.id === "weights" ? (
                <p className="control-context">
                  A weight multiplies wave amplitude, not probability. The
                  amplitudes combine first; then the app squares the resulting ψ
                  to show the qualitative |ψ|² distribution.
                </p>
              ) : null}
            </div>

            <div
              className="guided-control-rail"
              aria-label="Interactive controls for combining orbital values"
            >
              <div className="plain-equation">
                {stage.id === "one-point"
                  ? "value from A + value from B = new value"
                  : equation}
              </div>

              <div className="choice-panel">
                <h3>Choose the signs of the facing lobes</h3>
                <div
                  className="sign-choice"
                  role="group"
                  aria-label="Relative sign of orbital B"
                >
                  <button
                    type="button"
                    className={phaseB === 1 ? "is-active" : ""}
                    onClick={() => setPhaseB(1)}
                  >
                    same signs: + and +
                  </button>
                  <button
                    type="button"
                    className={phaseB === -1 ? "is-active" : ""}
                    onClick={() => setPhaseB(-1)}
                  >
                    opposite signs: + and −
                  </button>
                </div>
              </div>

              {stage.id === "weights" ? (
                <div className="weight-panel">
                  <label htmlFor="weight-b">
                    <span>Contribution from orbital B, relative to A = 1.00</span>
                    <strong>{weightB.toFixed(2)}</strong>
                  </label>
                  <input
                    id="weight-b"
                    type="range"
                    min="0.2"
                    max="1.5"
                    step="0.05"
                    value={weightB}
                    onChange={(event) => setWeightB(Number(event.target.value))}
                  />
                  <div className="weight-presets" aria-label="Weight presets">
                    <button type="button" onClick={() => setWeightB(0.4)}>
                      Mostly A
                    </button>
                    <button type="button" onClick={() => setWeightB(1)}>
                      Equal
                    </button>
                    <button type="button" onClick={() => setWeightB(1.4)}>
                      Mostly B
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="guided-visual">
            <FacingLobes phaseB={phaseB} />
            <PointAddition
              weightA={weightA}
              weightB={weightB}
              phaseB={phaseB}
            />

            {stage.id === "one-point" ? (
              <aside className="concept-correction concept-correction--visual">
                <strong>Do this calculation at one point first</strong>
                <p>
                  A molecular orbital equation is point-by-point arithmetic. The
                  pictures become meaningful only after the signed numbers are
                  clear.
                </p>
              </aside>
            ) : (
              <div className="combination-diagram-wrap">
                <p className="visual-explanation">
                  Repeat the amplitude addition everywhere. Watch the resulting
                  ψ connect or split, then compare it with the qualitative |ψ|²
                  density view below it.
                </p>
                <ResultingMoDiagram
                  weightA={weightA}
                  weightB={weightB}
                  phaseB={phaseB}
                />
              </div>
            )}
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
            {atLastStage ? "Continue to bonding and antibonding" : "Continue"}
          </button>
        </div>
      </section>

      <details className="going-deeper">
        <summary>Going deeper: the compact equation</summary>
        <p>
          Chemists write the point-by-point rule as ψ = cAφA + cBφB. For real
          orbitals, squaring gives |ψ|² = cA²φA² + cB²φB² + 2cAcBφAφB. The cross
          term is positive for matching signs and negative for opposite signs.
          That is why phase controls buildup or cancellation, while the
          weight magnitudes control how strongly the final MO is weighted
          toward each atom.
        </p>
      </details>
    </LessonShell>
  );
}
