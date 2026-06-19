import {
  boxBounds,
  boxVolume,
  P_ORBITAL_AXES,
  pOrbitalDensity,
  probabilityInPOrbitalBox,
  probabilityInAveragePShellBox,
  pShellAverageDensity,
  pOrbitalWavefunction,
  type AxisAlignedBox3D,
  type GlobalPhaseSign,
  type POrbitalAxis,
} from "../../models/pyOrbital3d";
import type { ReactNode } from "react";
import { OrbitalWavefunctionLabel } from "./OrbitalNotation";
import type { Orbital3DViewMode } from "./orbital3dViewMode";

export type IntegralHighlight = "x" | "y" | "z" | "alpha" | "phase" | null;

interface Orbital3DLiveValuesProps {
  alpha: number;
  box: AxisAlignedBox3D;
  globalPhase: GlobalPhaseSign;
  highlight: IntegralHighlight;
  orbitalAxis: POrbitalAxis;
  viewMode: Orbital3DViewMode;
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
  viewMode,
}: Orbital3DLiveValuesProps) {
  const bounds = boxBounds(box);
  const isShellView = viewMode === "shell";
  const psiAtCenter = pOrbitalWavefunction(box.center, alpha, orbitalAxis, globalPhase);
  const componentPsiAtCenter = P_ORBITAL_AXES.map((axis) => ({
    axis,
    value: pOrbitalWavefunction(box.center, alpha, axis, globalPhase),
  }));
  const densityAtCenter = isShellView
    ? pShellAverageDensity(box.center, alpha)
    : pOrbitalDensity(box.center, alpha, orbitalAxis);
  const probability = isShellView
    ? probabilityInAveragePShellBox(box, alpha)
    : probabilityInPOrbitalBox(box, alpha, orbitalAxis);
  const percent = probability * 100;

  return (
    <section className="orbital3d-live" aria-label="Live probability calculation values">
      <div className="orbital3d-live__header">
        <span>Live values</span>
        <h3>What the box is calculating</h3>
      </div>

      <div className="orbital3d-integral" aria-label="Definite integral with live bounds">
        {isShellView ? (
          <p>
            P<sub>p shell</sub>(box) ={" "}
            <Highlighted active={highlight === "x"}>
              ∫<sub>{bounds.x1.toFixed(2)}</sub><sup>{bounds.x2.toFixed(2)}</sup>
            </Highlighted>{" "}
            <Highlighted active={highlight === "y"}>
              ∫<sub>{bounds.y1.toFixed(2)}</sub><sup>{bounds.y2.toFixed(2)}</sup>
            </Highlighted>{" "}
            <Highlighted active={highlight === "z"}>
              ∫<sub>{bounds.z1.toFixed(2)}</sub><sup>{bounds.z2.toFixed(2)}</sup>
            </Highlighted>{" "}
            ρ<sub>p,avg</sub>(x, y, z) dz dy dx
          </p>
        ) : (
          <p>
            P<sub>y</sub>(box) ={" "}
            <Highlighted active={highlight === "x"}>
              ∫<sub>{bounds.x1.toFixed(2)}</sub><sup>{bounds.x2.toFixed(2)}</sup>
            </Highlighted>{" "}
            <Highlighted active={highlight === "y"}>
              ∫<sub>{bounds.y1.toFixed(2)}</sub><sup>{bounds.y2.toFixed(2)}</sup>
            </Highlighted>{" "}
            <Highlighted active={highlight === "z"}>
              ∫<sub>{bounds.z1.toFixed(2)}</sub><sup>{bounds.z2.toFixed(2)}</sup>
            </Highlighted>{" "}
            |<OrbitalWavefunctionLabel axis={orbitalAxis} />(x, y, z)|² dz dy dx
          </p>
        )}
        <p>
          = <strong>{formatValue(probability, 5)}</strong> ={" "}
          <strong>{percent.toFixed(2)}% inside the selected volume</strong>
        </p>
      </div>

      <div className="orbital3d-live__grid">
        {isShellView ? (
          <article className={highlight === "phase" ? "is-highlighted" : undefined}>
            <span>component amplitudes at the center</span>
            {componentPsiAtCenter.map((component) => (
              <strong key={component.axis}>
                <OrbitalWavefunctionLabel axis={component.axis} /> ={" "}
                {formatSignedValue(component.value)}
              </strong>
            ))}
          </article>
        ) : (
          <article className={highlight === "phase" ? "is-highlighted" : undefined}>
            <span>signed wave amplitude at the center</span>
            <strong>
              <OrbitalWavefunctionLabel axis={orbitalAxis} /> = {formatSignedValue(psiAtCenter)}
            </strong>
          </article>
        )}
        <article>
          <span>
            {isShellView
              ? "average p-shell density at the center"
              : "local probability density at the center"}
          </span>
          <strong>
            {isShellView ? (
              <>
                ρ<sub>p,avg</sub> = {formatValue(densityAtCenter, 5)}
              </>
            ) : (
              <>|ψ|² = {formatValue(densityAtCenter, 5)}</>
            )}
          </strong>
        </article>
        <article>
          <span>box volume</span>
          <strong>ΔV = {formatValue(boxVolume(box), 4)}</strong>
        </article>
        <article className="orbital3d-live__probability">
          <span>
            {isShellView
              ? "probability inside the selected average p-shell density"
              : "probability of finding the electron somewhere inside this volume"}
          </span>
          <strong>
            {isShellView ? (
              <>
                P<sub>p shell</sub>
              </>
            ) : (
              "P"
            )}
            (box) = {formatValue(probability, 5)}
          </strong>
          <em>{percent.toFixed(2)}%</em>
        </article>
      </div>
    </section>
  );
}
