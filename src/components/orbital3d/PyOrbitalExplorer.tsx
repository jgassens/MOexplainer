import { useEffect, useMemo, useState } from "react";
import type {
  AxisAlignedBox3D,
  GlobalPhaseSign,
  POrbitalAxis,
  Point3D,
} from "../../models/pyOrbital3d";
import { Orbital3DFallback } from "./Orbital3DFallback";
import { Orbital3DLiveValues, type IntegralHighlight } from "./Orbital3DLiveValues";
import { PyOrbitalScene } from "./PyOrbitalScene";
import {
  SamplingBoxControls,
  type SamplingBoxMode,
  type SamplingPreset,
} from "./SamplingBoxControls";

interface PyOrbitalExplorerProps {
  alpha: number;
  globalPhase: GlobalPhaseSign;
  onAlphaChange: (value: number) => void;
  onGlobalPhaseChange: (value: GlobalPhaseSign) => void;
}

const initialBox: AxisAlignedBox3D = {
  center: { x: 0, y: 1, z: 0 },
  size: { x: 1, y: 1, z: 1 },
};

const orbitalChoices: Array<{
  axis: POrbitalAxis;
  label: string;
  spokenLabel: string;
}> = [
  { axis: "x", label: "pₓ", spokenLabel: "p x" },
  { axis: "y", label: "pᵧ", spokenLabel: "p y" },
  { axis: "z", label: "p_z", spokenLabel: "p z" },
];

function centerOnAxis(axis: POrbitalAxis, value: number): Point3D {
  return {
    x: axis === "x" ? value : 0,
    y: axis === "y" ? value : 0,
    z: axis === "z" ? value : 0,
  };
}

function selectedOrbitalLabel(axis: POrbitalAxis) {
  return orbitalChoices.find((choice) => choice.axis === axis)?.label ?? "pᵧ";
}

function selectedOrbitalSpokenLabel(axis: POrbitalAxis) {
  return orbitalChoices.find((choice) => choice.axis === axis)?.spokenLabel ?? "p y";
}

function positiveLobeBox(axis: POrbitalAxis): AxisAlignedBox3D {
  return {
    center: centerOnAxis(axis, 1),
    size: { x: 1, y: 1, z: 1 },
  };
}

function presetsForAxis(axis: POrbitalAxis): SamplingPreset[] {
  const label = selectedOrbitalLabel(axis);
  return [
    {
      id: "positive-lobe",
      label: "Positive lobe",
      box: positiveLobeBox(axis),
      explanation: `For the selected ${label} orbital, ψ is positive at the center. Density and box probability are positive, but neither retains a phase sign.`,
    },
    {
      id: "mirror-negative",
      label: "Mirror negative lobe",
      box: { center: centerOnAxis(axis, -1), size: { x: 1, y: 1, z: 1 } },
      explanation:
        "ψ changed sign, but the density and integrated probability are unchanged for these mirrored regions.",
    },
    {
      id: "center-node",
      label: "Center on node",
      box: { center: centerOnAxis(axis, 0), size: { x: 1, y: 0.9, z: 1 } },
      explanation:
        "ψ and |ψ|² are zero at the exact center. The complete box can still have nonzero probability because it extends into both lobes.",
    },
    {
      id: "thin-node",
      label: "Thin around node",
      box: {
        center: centerOnAxis(axis, 0),
        size: {
          x: axis === "x" ? 0.12 : 1,
          y: axis === "y" ? 0.12 : 1,
          z: axis === "z" ? 0.12 : 1,
        },
      },
      explanation:
        "As the selected volume becomes confined close to the nodal plane, the integrated probability approaches zero.",
    },
    {
      id: "far",
      label: "Far from nucleus",
      box: { center: { x: 2.35, y: 2.35, z: 2.35 }, size: { x: 0.8, y: 0.8, z: 0.8 } },
      explanation:
        "The exponential term makes the wavefunction fade with distance, so this box contains very little probability.",
    },
    {
      id: "most-density",
      label: "Capture most density",
      box: { center: { x: 0, y: 0, z: 0 }, size: { x: 4.4, y: 4.4, z: 4.4 } },
      explanation:
        "The larger region includes more density, so its probability moves toward 1. A finite box does not become all space.",
    },
  ];
}

function detectWebGL() {
  if (typeof window === "undefined" || typeof document === "undefined") return false;
  if (!("WebGLRenderingContext" in window)) return false;

  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

export function PyOrbitalExplorer({
  alpha,
  globalPhase,
  onAlphaChange,
  onGlobalPhaseChange,
}: PyOrbitalExplorerProps) {
  const [orbitalAxis, setOrbitalAxis] = useState<POrbitalAxis>("y");
  const [box, setBox] = useState<AxisAlignedBox3D>(initialBox);
  const [mode, setMode] = useState<SamplingBoxMode>("move");
  const [canUseWebGL, setCanUseWebGL] = useState(false);
  const [highlight, setHighlight] = useState<IntegralHighlight>(null);
  const presets = useMemo(() => presetsForAxis(orbitalAxis), [orbitalAxis]);
  const [presetExplanation, setPresetExplanation] = useState(presets[0].explanation);
  const selectedLabel = selectedOrbitalLabel(orbitalAxis);

  useEffect(() => {
    setCanUseWebGL(detectWebGL());
  }, []);

  useEffect(() => {
    if (highlight === null) return undefined;
    const timeout = window.setTimeout(() => setHighlight(null), 900);
    return () => window.clearTimeout(timeout);
  }, [highlight]);

  const updateBox = (nextBox: AxisAlignedBox3D, nextHighlight: IntegralHighlight = null) => {
    setBox(nextBox);
    setHighlight(nextHighlight);
  };

  const updateAlpha = (nextAlpha: number) => {
    onAlphaChange(nextAlpha);
    setHighlight("alpha");
  };

  const updateGlobalPhase = (nextPhase: GlobalPhaseSign) => {
    onGlobalPhaseChange(nextPhase);
    setHighlight("phase");
  };

  const choosePreset = (preset: SamplingPreset) => {
    setBox(preset.box);
    setPresetExplanation(preset.explanation);
    setHighlight(orbitalAxis);
  };

  const chooseOrbitalAxis = (axis: POrbitalAxis) => {
    const nextPresets = presetsForAxis(axis);
    setOrbitalAxis(axis);
    setBox(nextPresets[0].box);
    setPresetExplanation(nextPresets[0].explanation);
    setHighlight(axis);
  };

  return (
    <section className="orbital3d-explorer" aria-label="Probability in a selected three-dimensional p orbital volume">
      <section className="orbital3d-orbital-picker" aria-label="Choose one p orbital">
        <div>
          <span>Selected orbital</span>
          <h3>Show one p orbital at a time</h3>
          <p>
            The default is pᵧ because the earlier y-axis slider prepares that
            story. pₓ, pᵧ, and p_z are three separate mutually perpendicular p
            orbitals on the same atom, not one combined orbital.
          </p>
        </div>
        <div className="orbital3d-orbital-picker__buttons" role="group" aria-label="p orbital selector">
          {orbitalChoices.map((choice) => (
            <button
              key={choice.axis}
              type="button"
              className={choice.axis === orbitalAxis ? "is-active" : ""}
              aria-pressed={choice.axis === orbitalAxis}
              aria-label={`Show ${choice.spokenLabel} orbital`}
              onClick={() => chooseOrbitalAxis(choice.axis)}
            >
              {choice.label}
            </button>
          ))}
        </div>
        <div className="orbital3d-orbital-equation" aria-label={`Equation for the selected ${selectedOrbitalSpokenLabel(orbitalAxis)} orbital`}>
          <strong>
            ψ<sub>{selectedLabel}</sub>(x,y,z) = N {orbitalAxis} e<sup>−α(x²+y²+z²)</sup>
          </strong>
          <span>Here i = x, y, or z. This view is currently using i = {orbitalAxis}.</span>
        </div>
      </section>

      <div className="orbital3d-concept-grid">
        <article>
          <h3>What does the integral do?</h3>
          <p>
            The integral adds the probability density throughout the selected
            box. Each tiny piece of volume contributes |ψ|²dτ. Adding those
            contributions gives the probability of finding the electron
            somewhere inside the box.
          </p>
        </article>
        <article className="orbital3d-clarification">
          <p>Rotate the view: the mathematics does not change.</p>
          <p>Move the box: the selected region changes.</p>
          <p>Resize the box: the integrated volume changes.</p>
        </article>
        <article className="orbital3d-warning">
          <h3>Do not read it this way</h3>
          <p>
            ψ at the center is not the probability inside the box. |ψ|² at the
            center is a local density value. Probability requires adding density
            throughout the complete selected volume.
          </p>
        </article>
      </div>

      <div className="orbital3d-layout">
        <div className="orbital3d-view-stack">
          {canUseWebGL ? (
            <PyOrbitalScene
              alpha={alpha}
              box={box}
              globalPhase={globalPhase}
              mode={mode}
              orbitalAxis={orbitalAxis}
              onBoxChange={(nextBox) => updateBox(nextBox, null)}
            />
          ) : (
            <Orbital3DFallback box={box} globalPhase={globalPhase} orbitalAxis={orbitalAxis} />
          )}
          <p className="orbital3d-surface-note">
            The surface marks one selected wave-amplitude level. The orbital
            extends beyond the surface.
          </p>
        </div>

        <div className="orbital3d-work-stack">
          <SamplingBoxControls
            alpha={alpha}
            box={box}
            globalPhase={globalPhase}
            mode={mode}
            onAlphaChange={updateAlpha}
            onBoxChange={updateBox}
            onGlobalPhaseChange={updateGlobalPhase}
            onModeChange={setMode}
            onPresetChoose={choosePreset}
            presetExplanation={presetExplanation}
            presets={presets}
          />
          <Orbital3DLiveValues
            alpha={alpha}
            box={box}
            globalPhase={globalPhase}
            highlight={highlight}
            orbitalAxis={orbitalAxis}
          />
        </div>
      </div>

      <details className="orbital3d-going-deeper">
        <summary>Going deeper: how the box integral is evaluated</summary>
        <p>
          For this normalized p-orbital teaching function, |ψ|² separates into
          x, y, and z factors. The selected orbital decides which coordinate is
          squared. The app evaluates the rectangular-box probability with
          one-dimensional Gaussian integrals and the error function, not by
          estimating center density times volume.
        </p>
      </details>
    </section>
  );
}
