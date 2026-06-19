import {
  boxBounds,
  boxVolume,
  pOrbitalDensity,
  probabilityInPOrbitalBox,
  pyNormalizationConstant,
  pOrbitalWavefunction,
  type AxisAlignedBox3D,
  type GlobalPhaseSign,
  type POrbitalAxis,
} from "../../models/pyOrbital3d";
import type { ReactNode } from "react";

export type IntegralHighlight = "x" | "y" | "z" | "alpha" | "phase" | null;

interface Orbital3DLiveValuesProps {
  alpha: number;
  box: AxisAlignedBox3D;
  globalPhase: GlobalPhaseSign;
  highlight: IntegralHighlight;
  orbitalAxis: POrbitalAxis;
}

function formatValue(value: number, digits = 4) {
  if (Math.abs(value) < 1e-9) return "0";
  if (Math.abs(value) < 0.0001) return value.toExponential(2);
  return value.toFixed(digits);
}

function formatSignedValue(value: number) {
  if (Math.abs(value) < 1e-9) return "0";
  return `${value > 0 ? "+" : "−"}${formatValue(Math.abs(value), 4)}`;
}

function formatBounds(lower: number, upper: number) {
  return `[${lower.toFixed(2)}, ${upper.toFixed(2)}]`;
}

function orbitalLabel(axis: POrbitalAxis) {
  if (axis === "x") return "pₓ";
  if (axis === "y") return "pᵧ";
  return "p_z";
}

function Highlighted({
  active,
  children,
}: {
  active: boolean;
  children: ReactNode;
}) {
  return <span className={active ? "orbital3d-integral__term is-highlighted" : "orbital3d-integral__term"}>{children}</span>;
}

export function Orbital3DLiveValues({
  alpha,
  box,
  globalPhase,
  highlight,
  orbitalAxis,
}: Orbital3DLiveValuesProps) {
  const bounds = boxBounds(box);
  const psiAtCenter = pOrbitalWavefunction(box.center, alpha, orbitalAxis, globalPhase);
  const densityAtCenter = pOrbitalDensity(box.center, alpha, orbitalAxis);
  const probability = probabilityInPOrbitalBox(box, alpha, orbitalAxis);
  const outside = 1 - probability;
  const percent = probability * 100;
  const normalization = pyNormalizationConstant(alpha);

  return (
    <section className="orbital3d-live" aria-label="Live probability calculation values">
      <div className="orbital3d-live__header">
        <span>Live values</span>
        <h3>What the box is calculating</h3>
      </div>

      <div className="orbital3d-integral" aria-label="Definite integral with live bounds">
        <p>
          P(box) ={" "}
          <Highlighted active={highlight === "x"}>
            ∫<sub>{bounds.x1.toFixed(2)}</sub><sup>{bounds.x2.toFixed(2)}</sup>
          </Highlighted>{" "}
          <Highlighted active={highlight === "y"}>
            ∫<sub>{bounds.y1.toFixed(2)}</sub><sup>{bounds.y2.toFixed(2)}</sup>
          </Highlighted>{" "}
          <Highlighted active={highlight === "z"}>
            ∫<sub>{bounds.z1.toFixed(2)}</sub><sup>{bounds.z2.toFixed(2)}</sup>
          </Highlighted>{" "}
          |ψ<sub>{orbitalLabel(orbitalAxis)}</sub>(x,y,z)|² dz dy dx
        </p>
        <p>
          = <strong>{formatValue(probability, 5)}</strong> ={" "}
          <strong>{percent.toFixed(2)}% inside the selected volume</strong>
        </p>
      </div>

      <div className="orbital3d-live__grid">
        <article>
          <span>box center</span>
          <strong>
            ({box.center.x.toFixed(2)}, {box.center.y.toFixed(2)}, {box.center.z.toFixed(2)})
          </strong>
        </article>
        <article className={highlight === "phase" ? "is-highlighted" : undefined}>
          <span>signed wave amplitude at the center</span>
          <strong>ψ<sub>{orbitalLabel(orbitalAxis)}</sub> = {formatSignedValue(psiAtCenter)}</strong>
        </article>
        <article>
          <span>local probability density at the center</span>
          <strong>|ψ|² = {formatValue(densityAtCenter, 5)}</strong>
        </article>
        <article>
          <span>box bounds</span>
          <strong>
            {formatBounds(bounds.x1, bounds.x2)} × {formatBounds(bounds.y1, bounds.y2)} ×{" "}
            {formatBounds(bounds.z1, bounds.z2)}
          </strong>
        </article>
        <article>
          <span>box volume</span>
          <strong>ΔV = {formatValue(boxVolume(box), 4)}</strong>
        </article>
        <article className="orbital3d-live__probability">
          <span>probability of finding the electron somewhere inside this volume</span>
          <strong>P(box) = {formatValue(probability, 5)}</strong>
          <em>{percent.toFixed(2)}%</em>
        </article>
        <article>
          <span>probability outside box</span>
          <strong>1 − P(box) = {formatValue(outside, 5)}</strong>
        </article>
        <article className={highlight === "alpha" ? "is-highlighted" : undefined}>
          <span>all-space normalization</span>
          <strong>P(all space) = 1</strong>
          <em>N(α) = {formatValue(normalization, 4)}</em>
        </article>
      </div>
    </section>
  );
}
