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
  value,
}: {
  children: ReactNode;
  description: string;
  label: string;
  value?: string;
}) {
  const tooltipId = useId();

  return (
    <span className="combine-equation-term-wrap">
      <button
        type="button"
        className="combine-equation-term"
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

function CombinationEquationWorkbench({
  phaseB,
  weightA,
  weightB,
}: {
  phaseB: Phase;
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
  const modeCopy: Record<
    CombinationEquationMode,
    { title: string; summary: string; answerLabel: string; answer: string; answerText: string }
  > = {
    mo: {
      title: "MO value at the highlighted point",
      summary:
        "This is the point-by-point addition rule. The app repeats this same addition at every point to draw the MO.",
      answerLabel: "Signed result",
      answer: `ψ = ${formatNumber(psi)}`,
      answerText:
        Math.abs(psi) < 0.005
          ? "The two contributions cancel at this point, so this point is on a node."
          : `${formatSignWord(psi)} ψ remains here, so this point keeps that phase in the resulting MO.`,
    },
    density: {
      title: "Density after squaring the MO value",
      summary:
        "Square the combined ψ value after addition. Squaring makes density nonnegative.",
      answerLabel: "Relative density",
      answer: `|ψ|² = ${density.toFixed(2)}`,
      answerText:
        density < 0.005
          ? "A zero wave amplitude gives zero density at the node."
          : "A larger combined amplitude gives a larger relative density after squaring.",
    },
    cross: {
      title: "Expanded density and the cross term",
      summary:
        "The cross term is where phase shows up after squaring. It adds for matched signs and subtracts for opposite signs.",
      answerLabel: "Cross term",
      answer: `2cAcBφAφB = ${formatNumber(crossTerm)}`,
      answerText:
        crossTerm > 0
          ? "The cross term is positive, so overlap builds density between the atoms."
          : crossTerm < 0
            ? "The cross term is negative, so overlap cancels density at the node."
            : "The cross term is zero, so there is no overlap contribution from these values.",
    },
  };
  const current = modeCopy[mode];

  return (
    <section className="combine-equation-workbench" aria-label="Interactive compact equation">
      <div className="combine-equation-header">
        <div>
          <span>Governing equation</span>
          <h3>{current.title}</h3>
        </div>
        <p>{current.summary}</p>
      </div>

      <div className="combine-equation-tabs" role="group" aria-label="Equation view">
        <button
          type="button"
          className={mode === "mo" ? "is-active" : ""}
          onClick={() => setMode("mo")}
        >
          1 Add ψ
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
          3 Cross term
        </button>
      </div>

      <div className="combine-equation-body">
        <div className="combine-equation-line" aria-label={current.title}>
          {mode === "mo" ? (
            <>
              <CombinationEquationTerm
                label="MO wavefunction"
                value={`ψ = ${formatNumber(psi)}`}
                description="The molecular orbital value at this point. It is a signed wave amplitude, not probability."
              >
                ψ
              </CombinationEquationTerm>{" "}
              ={" "}
              <CombinationEquationTerm
                label="weight on orbital A"
                value={`cA = ${formatPlainNumber(cA)}`}
                description="This multiplies the starting orbital on atom A before the values are added."
              >
                c<sub>A</sub>
              </CombinationEquationTerm>
              <CombinationEquationTerm
                label="orbital A value"
                value={`φA = ${formatNumber(phiA)}`}
                description="The value of starting orbital A at the highlighted point."
              >
                φ<sub>A</sub>
              </CombinationEquationTerm>{" "}
              +{" "}
              <CombinationEquationTerm
                label="signed weight on orbital B"
                value={`cB = ${formatNumber(cB)}`}
                description="This is controlled by the flip button and the B-weight slider. A negative value means B has opposite phase at this point."
              >
                c<sub>B</sub>
              </CombinationEquationTerm>
              <CombinationEquationTerm
                label="orbital B value"
                value={`φB = ${formatNumber(phiB)}`}
                description="The value of starting orbital B at the same highlighted point in space."
              >
                φ<sub>B</sub>
              </CombinationEquationTerm>
            </>
          ) : mode === "density" ? (
            <>
              <CombinationEquationTerm
                label="probability density"
                value={`|ψ|² = ${density.toFixed(2)}`}
                description="A relative density value at this point. It is never negative because ψ is squared."
              >
                |ψ|²
              </CombinationEquationTerm>{" "}
              ={" "}
              <CombinationEquationTerm
                label="combined wave amplitude"
                value={`ψ = ${formatNumber(psi)}`}
                description="Add the two signed orbital contributions first, then square the result."
              >
                (c<sub>A</sub>φ<sub>A</sub> + c<sub>B</sub>φ<sub>B</sub>)²
              </CombinationEquationTerm>
            </>
          ) : (
            <>
              <CombinationEquationTerm
                label="expanded density"
                value={`|ψ|² = ${density.toFixed(2)}`}
                description="The same density equation, written out so you can see the individual A, B, and overlap pieces."
              >
                |ψ|²
              </CombinationEquationTerm>{" "}
              ={" "}
              <CombinationEquationTerm
                label="A-only density piece"
                value={`cA²φA² = ${aSquaredTerm.toFixed(2)}`}
                description="The density contribution from orbital A by itself."
              >
                c<sub>A</sub>²φ<sub>A</sub>²
              </CombinationEquationTerm>{" "}
              +{" "}
              <CombinationEquationTerm
                label="B-only density piece"
                value={`cB²φB² = ${bSquaredTerm.toFixed(2)}`}
                description="The density contribution from orbital B by itself. The sign disappears because this part is squared."
              >
                c<sub>B</sub>²φ<sub>B</sub>²
              </CombinationEquationTerm>{" "}
              +{" "}
              <CombinationEquationTerm
                label="cross term"
                value={`2cAcBφAφB = ${formatNumber(crossTerm)}`}
                description="This term contains both orbitals at once. It is positive for matched signs and negative for opposite signs."
              >
                2c<sub>A</sub>c<sub>B</sub>φ<sub>A</sub>φ<sub>B</sub>
              </CombinationEquationTerm>
            </>
          )}
        </div>

        <div className="combine-equation-answer">
          <span>{current.answerLabel}</span>
          <strong>{current.answer}</strong>
          <p>{current.answerText}</p>
        </div>

        <div className="combine-equation-substitution" aria-label="Live substitution values">
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
        These are scaled teaching values at the highlighted point. The full MO
        picture repeats the same equation across space.
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
        Put two pᵧ orbitals together and look at the shared point
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

      <details className="going-deeper">
        <summary>Going deeper: the compact equation</summary>
        <CombinationEquationWorkbench
          phaseB={phaseB}
          weightA={weightA}
          weightB={weightB}
        />
      </details>
    </LessonShell>
  );
}
