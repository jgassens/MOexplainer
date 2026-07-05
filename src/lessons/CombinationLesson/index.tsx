import { useId, useMemo, useState, type ReactNode } from "react";
import { LessonShell } from "../../components/LessonShell/LessonShell";
import { scrollToPageTop } from "../../utils/scroll";
import type { LessonComponentProps } from "../types";

type Phase = 1 | -1;
type StageId = "one-point" | "all-space" | "weights";
type CombinationEquationMode = "mo" | "density" | "cross";

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
    title: "Start with the π part of a C=C bond",
    lead: "In ethylene, the C=C double bond has a σ bond plus a π bond. This lesson is about the π part: two neighboring p orbitals overlapping side-by-side. Match the center-facing signs to build the bonding π MO, the orbital that becomes the π bond when it holds two electrons. Flip one p orbital to make the antibonding π* MO, where the signs cancel between the atoms and create a node.",
  },
  {
    id: "all-space",
    shortTitle: "Every point",
    title: "Add the wavefunctions across the whole bond region",
    lead: "A molecular orbital is not made by adding two orbital colors at one spot. It is a wavefunction spread through space. To build a π or π* molecular orbital, the app combines the two p-orbital wavefunctions across the region around both atoms. At any one point, the MO value equals the value from p orbital A plus the value from p orbital B; then that same addition is repeated at every point, not just at the marked dot.",
  },
  {
    id: "weights",
    shortTitle: "Weights",
    title: "Weights say how much each starting orbital contributes",
    lead: "In ψ = cA φA + cB φB, cA and cB are weights. Equal weights are the symmetric reference: two equivalent carbon p orbitals in ethylene contribute equally to π and π*. Unequal weights make a polarized MO, which is what happens in a heteroatom case such as C=O: the bonding π MO leans toward oxygen, while π* has more carbon character.",
  },
] as const;

function formatNumber(value: number): string {
  if (Math.abs(value) < 0.005) return "0.00";
  return `${value > 0 ? "+" : "−"}${Math.abs(value).toFixed(2)}`;
}

function formatPlainNumber(value: number): string {
  if (Math.abs(value) < 0.005) return "0.00";
  return value.toFixed(2);
}

function formatSignWord(value: number): string {
  if (Math.abs(value) < 0.005) return "zero";
  return value > 0 ? "positive" : "negative";
}

function oppositePhase(sign: Phase): Phase {
  return sign === 1 ? -1 : 1;
}

function phaseClass(sign: Phase): "positive" | "negative" {
  return sign === 1 ? "positive" : "negative";
}

function phaseLabel(sign: Phase): "+" | "−" {
  return sign === 1 ? "+" : "−";
}

function PyOrbitalGlyph({
  centerX,
  centerY,
  facingSign,
  orientation,
  scale = 1,
}: {
  centerX: number;
  centerY: number;
  facingSign: Phase;
  orientation: "right" | "left";
  scale?: number;
}) {
  const leftSign = orientation === "right" ? oppositePhase(facingSign) : facingSign;
  const rightSign = orientation === "right" ? facingSign : oppositePhase(facingSign);

  return (
    <g
      className="combine-py-orbital"
      transform={`translate(${centerX} ${centerY}) scale(${scale})`}
    >
      <line x1="-162" x2="162" y1="0" y2="0" className="combine-py-axis" />
      <line x1="0" x2="0" y1="-68" y2="68" className="combine-py-nodal-plane" />
      <path
        d="M -2 0 C -34 -45 -90 -58 -150 -43 C -187 -34 -187 34 -150 43 C -90 58 -34 45 -2 0 Z"
        className={`combine-py-lobe combine-py-lobe--${phaseClass(leftSign)}`}
      />
      <path
        d="M 2 0 C 34 -45 90 -58 150 -43 C 187 -34 187 34 150 43 C 90 58 34 45 2 0 Z"
        className={`combine-py-lobe combine-py-lobe--${phaseClass(rightSign)}`}
      />
      <circle cx="0" cy="0" r="12" className="combine-py-nucleus-ring" />
      <circle cx="0" cy="0" r="8" className="combine-py-nucleus" />
      <text x="-82" y="13" textAnchor="middle" className="combine-py-sign">
        {phaseLabel(leftSign)}
      </text>
      <text x="82" y="13" textAnchor="middle" className="combine-py-sign">
        {phaseLabel(rightSign)}
      </text>
    </g>
  );
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

function CombinationEquationTerm({
  children,
  description,
  label,
  tone = "base",
  value,
}: {
  children: ReactNode;
  description: string;
  label: string;
  tone?: "base" | "value" | "result" | "overlap";
  value?: string;
}) {
  const tooltipId = useId();

  return (
    <span className="combine-equation-term-wrap">
      <button
        type="button"
        className={`combine-equation-term combine-equation-term--${tone}`}
        aria-describedby={tooltipId}
        aria-label={label}
      >
        {children}
      </button>
      <span id={tooltipId} role="tooltip" className="combine-equation-tooltip">
        <strong>{label}</strong>
        {value ? <span className="combine-equation-tooltip__value">{value}</span> : null}
        <span>{description}</span>
      </span>
    </span>
  );
}

function CombinationEquationRow({
  children,
  label,
  live = false,
}: {
  children: ReactNode;
  label: string;
  live?: boolean;
}) {
  return (
    <div className={`combine-equation-row ${live ? "combine-equation-row--live" : ""}`}>
      <span className="combine-equation-row__label">{label}</span>
      <div className="combine-equation-row__math">{children}</div>
    </div>
  );
}

function CombinationEquationWorkbench({
  phaseB,
  stageId,
  weightA,
  weightB,
}: {
  phaseB: Phase;
  stageId: StageId;
  weightA: number;
  weightB: number;
}) {
  const [mode, setMode] = useState<CombinationEquationMode>("mo");
  const phiA = 0.6;
  const phiB = 0.6;
  const cA = weightA;
  const cB = phaseB * weightB;
  const contributionA = cA * phiA;
  const contributionB = cB * phiB;
  const psi = contributionA + contributionB;
  const density = psi ** 2;
  const aSquaredTerm = contributionA ** 2;
  const bSquaredTerm = contributionB ** 2;
  const crossTerm = 2 * cA * cB * phiA * phiB;
  const samePhase = phaseB === 1;
  const equalWeights = Math.abs(weightB - weightA) < 0.05;
  const crossOperator = crossTerm < 0 ? "−" : "+";
  const crossMagnitude = Math.abs(crossTerm).toFixed(2);
  const modeCopy: Record<
    CombinationEquationMode,
    {
      title: string;
      summary: string;
      answerLabel: string;
      answer: string;
      answerText: string;
      teaching: string;
    }
  > = {
    mo: {
      title: "Build the MO value at one point",
      summary:
        "The marked point above is one location between two p orbitals. Multiply each starting orbital value by its weight, then add the signed contributions.",
      answerLabel: "Signed result",
      answer: `ψ = ${formatNumber(psi)}`,
      answerText:
        Math.abs(psi) < 0.005
          ? "The two contributions cancel at this point, so this point is on a node."
          : `${formatSignWord(psi)} ψ remains here, so this point keeps that phase in the resulting MO.`,
      teaching:
        samePhase
          ? "Same-phase center lobes give two contributions with the same sign. This local addition is the arithmetic behind electron buildup in a bonding π MO."
          : equalWeights
            ? "Flipping B makes the two center contributions equal and opposite. At this point they cancel to zero, which is the local arithmetic behind a π* node."
            : "Flipping B makes the center contributions oppose each other. Unequal weights keep the cancellation from landing exactly at this sampled point, but the MO still develops a node nearby.",
    },
    density: {
      title: "Square only after the orbitals combine",
      summary:
        "Electron density comes from the finished MO value. The app does not square A and B separately first; it adds amplitudes first, then squares the sum.",
      answerLabel: "Relative density",
      answer: `|ψ|² = ${density.toFixed(2)}`,
      answerText:
        density < 0.005
          ? "A zero wave amplitude gives zero density at the node."
          : "A larger combined amplitude gives a larger relative density after squaring.",
      teaching:
        "Phase signs disappear when a single number is squared, but they have already changed the sum. That is why opposite phase can produce zero density between atoms.",
    },
    cross: {
      title: "See the overlap term that builds or cancels",
      summary:
        "The expanded form shows the part of the density equation that contains both orbitals at once. That shared term is where relative phase matters.",
      answerLabel: "Cross term",
      answer: `2cAcBφAφB = ${formatNumber(crossTerm)}`,
      answerText:
        crossTerm > 0
          ? "The cross term is positive, so overlap builds density between the atoms."
          : crossTerm < 0
            ? "The cross term is negative, so overlap cancels density at the node."
            : "The cross term is zero, so there is no overlap contribution from these values.",
      teaching:
        crossTerm > 0
          ? "The overlap term is positive because the two sampled contributions have matching signs. In a C=C-like π bond, that positive shared term is the buildup between atoms."
          : "The overlap term is negative because the two sampled contributions have opposite signs. That negative shared term is the cancellation that opens a node in π*.",
    },
  };
  const current = modeCopy[mode];
  const stageNote =
    stageId === "one-point"
      ? "Lesson focus: one marked point. The equation buttons open the arithmetic happening at that dot before the app draws the larger orbital picture."
      : stageId === "all-space"
        ? "Lesson focus: every point. The equation still shows one sampled point, and the MO picture below repeats that same signed addition across the whole bond region."
        : "Lesson focus: weights. The same point equation stays visible while cA and cB show how strongly each starting orbital contributes.";
  const stageAwareTitle =
    stageId === "all-space" && mode === "mo"
      ? "Use one sampled point to build the whole MO"
      : stageId === "weights" && mode === "mo"
        ? "Weights scale each contribution before addition"
        : current.title;
  const stageAwareSummary =
    stageId === "all-space" && mode === "mo"
      ? "The marked dot is one sample from a wavefunction spread through space. A π or π* MO comes from adding φA and φB at many points across the whole bond region."
      : stageId === "weights" && mode === "mo"
        ? "The equation is still point-by-point addition. The weights decide how much of each starting orbital enters before the two signed values are added."
        : current.summary;

  return (
    <section className="combine-equation-workbench" aria-label="Interactive molecular orbital equation">
      <div className="combine-equation-header">
        <div>
          <span>Equation walkthrough</span>
          <h3>{stageAwareTitle}</h3>
        </div>
        <p>{stageAwareSummary}</p>
      </div>

      <p className="combine-equation-stage-note">{stageNote}</p>

      <div className="combine-equation-tabs" role="group" aria-label="Equation view">
        <button
          type="button"
          className={mode === "mo" ? "is-active" : ""}
          onClick={() => setMode("mo")}
        >
          1 Add amplitudes
        </button>
        <button
          type="button"
          className={mode === "density" ? "is-active" : ""}
          onClick={() => setMode("density")}
        >
          2 Square ψ
        </button>
        <button
          type="button"
          className={mode === "cross" ? "is-active" : ""}
          onClick={() => setMode("cross")}
        >
          3 See overlap
        </button>
      </div>

      <div className="combine-equation-body">
        <div className="combine-equation-line" aria-label={current.title}>
          {mode === "mo" ? (
            <>
              <CombinationEquationRow label="Reference equation">
                <CombinationEquationTerm
                  label="MO wave amplitude"
                  value={`ψ = ${formatNumber(psi)}`}
                  description="This is the molecular-orbital wave amplitude at the selected point. You get it only after adding the two starting-orbital contributions. Its sign is phase, not charge."
                  tone="result"
                >
                  ψ
                </CombinationEquationTerm>{" "}
                ={" "}
                <CombinationEquationTerm
                  label="weight on orbital A"
                  value={`cA = ${formatPlainNumber(cA)}`}
                  description="A weight says how much starting orbital A participates in this trial MO. Here cA is fixed at 1.00 because this step models an ethylene-like C=C bond with two equivalent carbon p orbitals. When the atoms are not the same, as in C=O, the weights become chemically important."
                >
                  c<sub>A</sub>
                </CombinationEquationTerm>
                <CombinationEquationTerm
                  label="orbital A value"
                  value={`φA = ${formatNumber(phiA)}`}
                  description="φA is the signed value of the starting p orbital on atom A at this one point in space. The +0.60 is a fixed, scaled sample value chosen to make the arithmetic visible; it is not an experimental number from the chapter."
                >
                  φ<sub>A</sub>
                </CombinationEquationTerm>{" "}
                +{" "}
                <CombinationEquationTerm
                  label="signed weight on orbital B"
                  value={`cB = ${formatNumber(cB)}`}
                  description="This signed weight includes the selected relative phase for B. For the C=C reference, B has the same size weight as A; flipping B changes the sign only. In a heteroatom case, the size of cB can also change."
                >
                  c<sub>B</sub>
                </CombinationEquationTerm>
                <CombinationEquationTerm
                  label="orbital B value"
                  value={`φB = ${formatNumber(phiB)}`}
                  description="φB is the value of starting orbital B at the same point in space. It starts with the same fixed +0.60 sample as φA because this step is the equal-carbon C=C reference; the sign change comes from the B weight when you flip phase."
                >
                  φ<sub>B</sub>
                </CombinationEquationTerm>
              </CombinationEquationRow>
              <CombinationEquationRow label="Live substitution" live>
                <CombinationEquationTerm
                  label="current MO amplitude"
                  value={`ψ = ${formatNumber(psi)}`}
                  description="This is the new signed MO value at the point marked in the picture above."
                  tone="result"
                >
                  ψ
                </CombinationEquationTerm>{" "}
                ={" "}
                <CombinationEquationTerm
                  label="A contribution"
                  value={`cAφA = ${formatNumber(contributionA)}`}
                  description="Orbital A contributes its fixed sampled value multiplied by its weight: 1.00 × 0.60. This is a teaching-scale amplitude at the circled point."
                  tone="value"
                >
                  ({formatPlainNumber(cA)})({formatNumber(phiA)})
                </CombinationEquationTerm>{" "}
                +{" "}
                <CombinationEquationTerm
                  label="B contribution"
                  value={`cBφB = ${formatNumber(contributionB)}`}
                  description="Orbital B contributes the same fixed sampled value, multiplied by its signed weight. If B is flipped, the contribution becomes negative even though the sample magnitude is still 0.60."
                  tone="value"
                >
                  ({formatNumber(cB)})({formatNumber(phiB)})
                </CombinationEquationTerm>{" "}
                ={" "}
                <CombinationEquationTerm
                  label="new MO value"
                  value={`ψ = ${formatNumber(psi)}`}
                  description="The result is still a wave amplitude. It becomes density only after the next step squares it."
                  tone="result"
                >
                  {formatNumber(psi)}
                </CombinationEquationTerm>
              </CombinationEquationRow>
            </>
          ) : mode === "density" ? (
            <>
              <CombinationEquationRow label="Reference equation">
                <CombinationEquationTerm
                  label="relative density"
                  value={`|ψ|² = ${density.toFixed(2)}`}
                  description="This is the relative electron-density value from the finished MO at this point. It is a teaching-model density, not an experimental measurement."
                  tone="result"
                >
                  |ψ|²
                </CombinationEquationTerm>{" "}
                ={" "}
                <CombinationEquationTerm
                  label="square of the combined amplitude"
                  value={`ψ = ${formatNumber(psi)}`}
                  description="The parentheses matter: add the two signed orbital contributions first, then square the combined ψ value."
                >
                  (c<sub>A</sub>φ<sub>A</sub> + c<sub>B</sub>φ<sub>B</sub>)²
                </CombinationEquationTerm>
              </CombinationEquationRow>
              <CombinationEquationRow label="Live substitution" live>
                <CombinationEquationTerm
                  label="current relative density"
                  value={`|ψ|² = ${density.toFixed(2)}`}
                  description="This number tells where density is large or small in the simplified picture. It is always zero or positive."
                  tone="result"
                >
                  |ψ|²
                </CombinationEquationTerm>{" "}
                ={" "}
                <CombinationEquationTerm
                  label="current combined amplitude"
                  value={`ψ = ${formatNumber(psi)}`}
                  description="This is the signed result from the previous tab. The sign is kept until this square is taken."
                  tone="value"
                >
                  ({formatNumber(psi)})²
                </CombinationEquationTerm>{" "}
                ={" "}
                <CombinationEquationTerm
                  label="density answer"
                  value={`|ψ|² = ${density.toFixed(2)}`}
                  description="Squaring the final ψ value turns wave amplitude into relative density for this teaching model."
                  tone="result"
                >
                  {density.toFixed(2)}
                </CombinationEquationTerm>
              </CombinationEquationRow>
            </>
          ) : (
            <>
              <CombinationEquationRow label="Reference equation">
                <CombinationEquationTerm
                  label="expanded density"
                  value={`|ψ|² = ${density.toFixed(2)}`}
                  description="This is the same density equation written open, so you can see the A-only piece, the B-only piece, and the shared overlap piece."
                  tone="result"
                >
                  |ψ|²
                </CombinationEquationTerm>{" "}
                ={" "}
                <CombinationEquationTerm
                  label="A-only density piece"
                  value={`cA²φA² = ${aSquaredTerm.toFixed(2)}`}
                  description="This part comes from the A contribution alone. With the default C=C teaching sample, it is 0.60 squared, so it gives 0.36."
                >
                  c<sub>A</sub>²φ<sub>A</sub>²
                </CombinationEquationTerm>{" "}
                +{" "}
                <CombinationEquationTerm
                  label="B-only density piece"
                  value={`cB²φB² = ${bSquaredTerm.toFixed(2)}`}
                  description="This part comes from the B contribution alone. The sign disappears because this piece is squared, so +0.60 and −0.60 both give 0.36 before the overlap term is added."
                >
                  c<sub>B</sub>²φ<sub>B</sub>²
                </CombinationEquationTerm>{" "}
                +{" "}
                <CombinationEquationTerm
                  label="overlap cross term"
                  value={`2cAcBφAφB = ${formatNumber(crossTerm)}`}
                  description="This is the overlap term. It uses both fixed sample amplitudes at once, so it is the piece that knows whether A and B have the same or opposite phase. Positive builds density between atoms; negative cancels it."
                  tone="overlap"
                >
                  2c<sub>A</sub>c<sub>B</sub>φ<sub>A</sub>φ<sub>B</sub>
                </CombinationEquationTerm>
              </CombinationEquationRow>
              <CombinationEquationRow label="Live substitution" live>
                <CombinationEquationTerm
                  label="current relative density"
                  value={`|ψ|² = ${density.toFixed(2)}`}
                  description="This answer matches the square of the combined ψ value from the previous tab."
                  tone="result"
                >
                  |ψ|²
                </CombinationEquationTerm>{" "}
                ={" "}
                <CombinationEquationTerm
                  label="current A-only piece"
                  value={`cA²φA² = ${aSquaredTerm.toFixed(2)}`}
                  description="The A-only piece is the squared A contribution from the fixed 0.60 sample at this point."
                  tone="value"
                >
                  {aSquaredTerm.toFixed(2)}
                </CombinationEquationTerm>{" "}
                +{" "}
                <CombinationEquationTerm
                  label="current B-only piece"
                  value={`cB²φB² = ${bSquaredTerm.toFixed(2)}`}
                  description="The B-only piece is also positive because it is squared, even when B has opposite phase. That is why the overlap term is needed to show bonding versus antibonding."
                  tone="value"
                >
                  {bSquaredTerm.toFixed(2)}
                </CombinationEquationTerm>{" "}
                {crossOperator}{" "}
                <CombinationEquationTerm
                  label="current overlap piece"
                  value={`cross term = ${formatNumber(crossTerm)}`}
                  description="The sign on this overlap piece changes when B flips. In this equal C=C sample the size is fixed; later, when atoms differ, the weights change the size too."
                  tone="overlap"
                >
                  {crossMagnitude}
                </CombinationEquationTerm>{" "}
                ={" "}
                <CombinationEquationTerm
                  label="expanded density answer"
                  value={`|ψ|² = ${density.toFixed(2)}`}
                  description="The expanded pieces add to the same density you get by squaring the final ψ value."
                  tone="result"
                >
                  {density.toFixed(2)}
                </CombinationEquationTerm>
              </CombinationEquationRow>
            </>
          )}
        </div>

        <div className="combine-equation-answer">
          <span>{current.answerLabel}</span>
          <strong>{current.answer}</strong>
          <p>{current.answerText}</p>
        </div>

        <p className="combine-equation-teaching">{current.teaching}</p>

        <div className="combine-equation-substitution" aria-label="Values at the selected point">
          <span>cA = {formatPlainNumber(cA)}</span>
          <span>φA = {formatNumber(phiA)}</span>
          <span>cB = {formatNumber(cB)}</span>
          <span>φB = {formatNumber(phiB)}</span>
          <span>cAφA = {formatNumber(contributionA)}</span>
          <span>cBφB = {formatNumber(contributionB)}</span>
          <span>ψ = {formatNumber(psi)}</span>
          <span>|ψ|² = {density.toFixed(2)}</span>
          {mode === "cross" ? (
            <>
              <span>cA²φA² = {aSquaredTerm.toFixed(2)}</span>
              <span>cB²φB² = {bSquaredTerm.toFixed(2)}</span>
              <span>cross = {formatNumber(crossTerm)}</span>
            </>
          ) : null}
        </div>
      </div>

      <p className="combine-equation-note">
        The default +0.60 values are fixed, scaled teaching samples for the
        selected point in an equal-carbon C=C reference. They are not
        experimental values. The full MO picture repeats this same weighted
        addition across space.
      </p>
    </section>
  );
}

function FacingLobes({ phaseB }: { phaseB: Phase }) {
  const samePhase = phaseB === 1;
  const clipPrefix = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const leftClipId = `${clipPrefix}-facing-left-of-node`;
  const rightClipId = `${clipPrefix}-facing-right-of-node`;

  return (
    <svg
      className="facing-lobes facing-lobes--py"
      viewBox="0 0 760 250"
      role="img"
      aria-label="Two p y orbitals on atoms A and B. Atom B flips phase so the center-facing lobes either match or cancel at the point between atoms."
    >
      <rect
        x="12"
        y="12"
        width="736"
        height="226"
        rx="18"
        className="wave-frame"
      />
      <text x="34" y="42" className="wave-panel-title">
        π bond
      </text>
      <text x="726" y="42" textAnchor="end" className="combine-py-note">
        {samePhase ? "center lobes: + and +" : "center lobes: + and −"}
      </text>

      {!samePhase ? (
        <defs>
          <clipPath id={leftClipId} clipPathUnits="userSpaceOnUse">
            <rect x="36" y="50" width="334" height="156" />
          </clipPath>
          <clipPath id={rightClipId} clipPathUnits="userSpaceOnUse">
            <rect x="390" y="50" width="334" height="156" />
          </clipPath>
        </defs>
      ) : null}

      <g clipPath={!samePhase ? `url(#${leftClipId})` : undefined}>
        <PyOrbitalGlyph
          centerX={280}
          centerY={128}
          facingSign={1}
          orientation="right"
          scale={0.62}
        />
      </g>
      <g clipPath={!samePhase ? `url(#${rightClipId})` : undefined}>
        <PyOrbitalGlyph
          centerX={480}
          centerY={128}
          facingSign={phaseB}
          orientation="left"
          scale={0.62}
        />
      </g>

      {samePhase ? (
        <ellipse
          cx="380"
          cy="128"
          rx="42"
          ry="24"
          className="combine-py-overlap combine-py-overlap--positive"
        />
      ) : (
        <>
          <rect x="370" y="72" width="20" height="112" className="combine-node-gap" />
          <line x1="380" x2="380" y1="68" y2="188" className="combine-node-line" />
        </>
      )}

      <circle
        cx="380"
        cy="128"
        r="17"
        className={`highlight-point combine-py-highlight${
          samePhase ? " combine-py-highlight--positive" : " combine-py-highlight--node"
        }`}
      />
      <line x1="380" x2="380" y1="58" y2="83" className="highlight-pointer" />
      <text x="380" y="51" textAnchor="middle" className="highlight-label">
        same location in space
      </text>
      <text x="280" y="210" textAnchor="middle" className="atom-caption">
        atom A
      </text>
      <text x="480" y="210" textAnchor="middle" className="atom-caption">
        atom B
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
  orientation,
  phase,
  weight,
  atom,
}: {
  centerX: number;
  orientation: "right" | "left";
  phase: Phase;
  weight: number;
  atom: string;
}) {
  const scale = 0.36 + 0.14 * Math.sqrt(Math.abs(weight));

  return (
    <g>
      <PyOrbitalGlyph
        centerX={centerX}
        centerY={154}
        facingSign={phase}
        orientation={orientation}
        scale={scale}
      />
      <text
        x={centerX}
        y="238"
        textAnchor="middle"
        className="combine-atom-label"
      >
        atom {atom}
      </text>
      <text
        x={centerX}
        y="259"
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
  const clipPrefix = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const leftClipId = `${clipPrefix}-result-left-of-node`;
  const rightClipId = `${clipPrefix}-result-right-of-node`;
  const shares = coefficientShares(weightA, weightB);
  const leftX = 596;
  const rightX = 704;
  const middleX = (leftX + rightX) / 2;
  const resultY = 162;
  const overlapBalance = 2 * Math.sqrt(shares.amplitudeA * shares.amplitudeB);
  const resultScaleA = 0.34 + Math.sqrt(shares.amplitudeA) * 0.18;
  const resultScaleB = 0.34 + Math.sqrt(shares.amplitudeB) * 0.18;
  const bridgeRx = 18 + 42 * overlapBalance;
  const bridgeRy = 13 + 15 * overlapBalance;
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
        {!samePhase ? (
          <defs>
            <clipPath id={leftClipId} clipPathUnits="userSpaceOnUse">
              <rect x="500" y="86" width={nodeX - 508} height="152" />
            </clipPath>
            <clipPath id={rightClipId} clipPathUnits="userSpaceOnUse">
              <rect x={nodeX + 8} y="86" width={790 - nodeX} height="152" />
            </clipPath>
          </defs>
        ) : null}

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
          orientation="right"
          phase={weightA >= 0 ? 1 : -1}
          weight={weightA}
          atom="A"
        />
        <StartingOrbital
          centerX={331}
          orientation="left"
          phase={phaseB}
          weight={weightB}
          atom="B"
        />

        <text x="466" y="80" className="combine-subtitle">
          wave amplitude ψ with the same phase colors as Lesson 1
        </text>
        <line x1="512" x2="788" y1={resultY} y2={resultY} className="combine-baseline" />

        {samePhase ? (
          <ellipse
            cx={middleX}
            cy={resultY}
            rx={bridgeRx}
            ry={bridgeRy}
            className="combine-py-overlap combine-py-overlap--positive combine-result-overlap"
          />
        ) : null}

        <g clipPath={!samePhase ? `url(#${leftClipId})` : undefined}>
          <PyOrbitalGlyph
            centerX={leftX}
            centerY={resultY}
            facingSign={1}
            orientation="right"
            scale={resultScaleA}
          />
        </g>
        <g clipPath={!samePhase ? `url(#${rightClipId})` : undefined}>
          <PyOrbitalGlyph
            centerX={rightX}
            centerY={resultY}
            facingSign={phaseB}
            orientation="left"
            scale={resultScaleB}
          />
        </g>

        {!samePhase ? (
          <>
            <rect
              x={nodeX - 8}
              y="98"
              width="16"
              height="130"
              className="combine-node-gap"
            />
            <line
              x1={nodeX}
              x2={nodeX}
              y1="94"
              y2="232"
              className="combine-node-line"
            />
            <text
              x={nodeX}
              y="249"
              textAnchor="middle"
              className="combine-node-label"
            >
              node
            </text>
          </>
        ) : null}

        <text
          x={leftX}
          y="249"
          textAnchor="middle"
          className="combine-result-atom"
        >
          atom A
        </text>
        <text
          x={rightX}
          y="249"
          textAnchor="middle"
          className="combine-result-atom"
        >
          atom B
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
          Blue and orange are the same phase colors used for the pᵧ orbital in
          Lesson 1. The app adds two smooth φ values to get ψ(x), squares the
          result, and rescales it for display. It is not an experimental
          density.
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

  const previousFromBottom = () => {
    previous();
    scrollToPageTop();
  };

  const nextFromBottom = () => {
    next();
    scrollToPageTop();
  };

  const equalWeights = Math.abs(weightB - weightA) < 0.05;
  const strongerAtom = weightB > weightA ? "B" : "A";
  const weakerAtom = strongerAtom === "A" ? "B" : "A";
  const weightContext = equalWeights
    ? "Equal weights are the equal-energy reference: two equivalent p orbitals, as in the C=C pi system of ethylene."
    : `Unequal weights mean this trial MO has more atom ${strongerAtom} character. In a real heteroatom case, unequal starting orbital energies decide the weights: a carbonyl bonding pi MO is more oxygen-like, while pi* is more carbon-like.`;
  const feedback =
    phaseB === -1
      ? equalWeights
        ? "Equal opposite amplitudes cancel at the midpoint. Repeating the cancellation through space creates a nodal surface, where |ψ|² is zero."
        : `Opposite amplitudes still create a nodal surface, but unequal weights move it toward atom ${weakerAtom}, the weaker contribution. The larger weight tells which starting orbital contributes more to this MO.`
      : equalWeights
        ? "Matching amplitudes reinforce and join across the atoms. This equal-weight case is the symmetric reference for equivalent starting orbitals."
        : `Matching amplitudes still reinforce, while the larger weight shifts ψ and the qualitative |ψ|² distribution toward atom ${strongerAtom}.`;
  const phaseChoiceConsequence =
    phaseB === 1
      ? "Matched center-facing lobes are in phase, so the two p orbitals reinforce between the atoms. This is the bonding π MO; with two π electrons in it, ethylene has a π bond."
      : "Flipped B makes the center-facing lobes out of phase, so the values cancel between the atoms. This is the antibonding π* MO; its node removes electron density from the bond region.";
  const pointArithmeticExplanation =
    phaseB === 1
      ? "At the circled point, orbital A contributes +0.60 and orbital B contributes +0.60, so the new MO value is +1.20. The 0.60 is a fixed, scaled teaching value chosen for this sampled point, not experimental data. The app then repeats that same addition at many points to draw the whole π bonding orbital. Where the sum is large, squaring ψ gives electron density in the bond region."
      : "At the circled point, orbital A contributes +0.60 and orbital B contributes −0.60, so the new MO value is 0.00. The 0.60 is a fixed, scaled teaching value chosen for this sampled point, not experimental data. A zero in the middle is a node: this point has no electron density from that MO after squaring. Repeating the same cancellation across space draws the π* antibonding node.";

  return (
    <LessonShell
      meta={props.meta}
      purpose="Use the π part of a C=C bond as the concrete example: two neighboring p orbitals combine to make a bonding π MO or an antibonding π* MO."
      question="For the π part of a C=C or C=O bond, why does same-phase overlap build electron density while opposite-phase overlap creates a node?"
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
              {stage.id === "one-point" ? (
                <p className="control-context">
                  Chemistry translation: this is not the whole double bond. It
                  is the side-by-side p-orbital piece. Same-phase addition gives
                  the bonding π MO; when electrons occupy that MO, it is the
                  π-bond part of the double bond. Opposite-phase addition gives
                  π* with a node between the atoms, so electrons in that orbital
                  would oppose π bonding instead of strengthening it.
                </p>
              ) : null}
              {stage.id === "all-space" ? (
                <p className="control-context">
                  For a π bonding orbital, matching phase between the nuclei
                  makes the wavefunction values reinforce, so electron density
                  builds between the atoms. For a π* antibonding orbital, one p
                  orbital is flipped, the values cancel between the nuclei, and
                  that cancellation creates the node that marks antibonding.
                </p>
              ) : null}
              <p className="control-context">
                The colors only mark relative phase. They are arbitrary labels,
                not charge. The important point is whether the two orbital
                values at the same place have matching or opposite signs.
              </p>
              {stage.id === "weights" ? (
                <p className="control-context">
                  This slider is a coefficient-size model, not an atom picker.
                  It asks what happens after one starting orbital has been given
                  a larger or smaller weight. Later lessons explain why real
                  molecules get unequal weights.
                </p>
              ) : null}
              {stage.id === "weights" ? (
                <p className="control-context">
                  {weightContext}
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
                <h3>Flip atom B to change the center-facing signs</h3>
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
                    match: blue + meets blue +
                  </button>
                  <button
                    type="button"
                    className={phaseB === -1 ? "is-active" : ""}
                    onClick={() => setPhaseB(-1)}
                  >
                    flip B: blue + meets orange −
                  </button>
                </div>
                <p className="choice-panel__consequence">
                  {phaseChoiceConsequence}
                </p>
              </div>

              {stage.id === "weights" ? (
                <div className="weight-panel">
                  <label htmlFor="weight-b">
                    <span>B weight cB, with A fixed at cA = 1.00</span>
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
                  <p className="weight-panel__note">
                    Equal means the two starting orbitals contribute equally.
                    Mostly A or mostly B means this MO is polarized toward that
                    side. For a carbonyl-like π system, oxygen contributes more
                    to the bonding π MO, while carbon contributes more to π*.
                  </p>
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

            <div className="combination-equation-focus">
              <CombinationEquationWorkbench
                phaseB={phaseB}
                stageId={stage.id}
                weightA={weightA}
                weightB={weightB}
              />
            </div>

            {stage.id === "one-point" ? (
              <aside className="concept-correction concept-correction--visual">
                <strong>Do this calculation at one point first</strong>
                <p>{pointArithmeticExplanation}</p>
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
            onClick={previousFromBottom}
            disabled={atFirstStage && props.previousDisabled}
          >
            {atFirstStage ? "Previous lesson" : "Back one idea"}
          </button>
          <button
            type="button"
            className="guided-actions__primary"
            onClick={nextFromBottom}
            disabled={atLastStage && props.nextDisabled}
          >
            {atLastStage ? "Continue to bonding and antibonding" : "Continue"}
          </button>
        </div>
      </section>
    </LessonShell>
  );
}
