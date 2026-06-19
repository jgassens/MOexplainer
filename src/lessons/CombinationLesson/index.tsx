import { useMemo, useState } from "react";
import { LessonShell } from "../../components/LessonShell/LessonShell";
import { CombinationDiagram } from "../../components/OrbitalCanvas/OrbitalCanvas";
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
    lead: "The resulting molecular orbital is not made by joining two pictures. It is made by doing the same addition at every point in space.",
  },
  {
    id: "weights",
    shortTitle: "Weights",
    title: "Weights change how strongly each starting orbital contributes",
    lead: "A weight multiplies every value from a starting orbital before the values are added. Unequal weights make the resulting MO more strongly associated with one atom.",
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

export function CombinationLesson(props: LessonComponentProps) {
  const [stageIndex, setStageIndex] = useState(0);
  const [phaseB, setPhaseB] = useState<Phase>(1);
  const [weightB, setWeightB] = useState(1);

  const stage = stages[stageIndex];
  const weightA = 1;
  const effectiveB = weightB * phaseB;
  const atFirstStage = stageIndex === 0;
  const atLastStage = stageIndex === stages.length - 1;
  const pointResult = 0.6 * weightA + 0.6 * effectiveB;

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

  const feedback =
    Math.abs(pointResult) < 0.01
      ? "At the highlighted point, equal opposite values cancel to zero. Repeated cancellation can create a node."
      : phaseB === 1 && Math.abs(weightB - 1) < 0.05
        ? "At the highlighted point, the same signs reinforce. Repeating this through the bonding region creates buildup between the nuclei."
        : `Orbital B is weighted ${weightB > 1 ? "more" : "less"} strongly than orbital A, so the resulting MO is no longer shared equally.`;

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
          <div className="guided-copy">
            <p className="guided-kicker">
              Step {stageIndex + 1} of {stages.length}
            </p>
            <h2 id="combination-stage-title">{stage.title}</h2>
            <p className="guided-lead">{stage.lead}</p>

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
              <p>
                This is relative phase. The question is not which color is
                “really” positive. The question is whether the two values at the
                same location have matching or opposite signs.
              </p>
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
                <p>
                  A weight multiplies the entire starting function. It does not
                  enlarge the atom. It changes how much that starting orbital
                  contributes to the new MO.
                </p>
              </div>
            ) : null}
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
                  Now imagine repeating the addition at every location. The
                  diagram below summarizes the full result.
                </p>
                <CombinationDiagram
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
          Chemists write the full point-by-point rule as ψ = cAφA + cBφB. The
          symbols cA and cB are weights. At every point in space, multiply each
          starting value by its weight and add the results. The next lessons
          explain what controls those weights and how strongly the orbitals
          interact.
        </p>
      </details>
    </LessonShell>
  );
}
