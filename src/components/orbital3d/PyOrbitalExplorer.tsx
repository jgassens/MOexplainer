import { useEffect, useMemo, useState } from "react";
import type {
  AxisAlignedBox3D,
  GlobalPhaseSign,
  POrbitalAxis,
  Point3D,
} from "../../models/pyOrbital3d";
import { Orbital3DFallback } from "./Orbital3DFallback";
import { Orbital3DLiveValues, type IntegralHighlight } from "./Orbital3DLiveValues";
import { OrbitalWavefunctionLabel, POrbitalLabel } from "./OrbitalNotation";
import { PyOrbitalScene } from "./PyOrbitalScene";
import {
  SamplingBoxControls,
  type SamplingBoxMode,
  type SamplingPreset,
} from "./SamplingBoxControls";
import type { Orbital3DViewMode } from "./orbital3dViewMode";

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

function centerOnAxis(axis: POrbitalAxis, value: number): Point3D {
  return {
    x: axis === "x" ? value : 0,
    y: axis === "y" ? value : 0,
    z: axis === "z" ? value : 0,
  };
}

function positiveLobeBox(axis: POrbitalAxis): AxisAlignedBox3D {
  return {
    center: centerOnAxis(axis, 1),
    size: { x: 1, y: 1, z: 1 },
  };
}

function presetsForAxis(axis: POrbitalAxis): SamplingPreset[] {
  return [
    {
      id: "positive-lobe",
      label: "Positive lobe",
      box: positiveLobeBox(axis),
      explanation:
        "For the selected orbital, ψ is positive at the center. Density and box probability are positive, but neither retains a phase sign.",
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

function presetsForViewMode(viewMode: Orbital3DViewMode): SamplingPreset[] {
  if (viewMode === "py") return presetsForAxis("y");

  return [
    {
      id: "shell-y-lobe",
      label: "+y lobe",
      box: positiveLobeBox("y"),
      explanation:
        "This samples the same positive p-y lobe as the focused view while the shell overview keeps p-x and p-z visible.",
    },
    {
      id: "shell-x-lobe",
      label: "+x lobe",
      box: positiveLobeBox("x"),
      explanation:
        "The equations treat p-x the same way as p-y, with x doing the sign-and-size work instead of y.",
    },
    {
      id: "shell-z-lobe",
      label: "+z lobe",
      box: positiveLobeBox("z"),
      explanation:
        "The p-z orbital follows the same rule, but its two lobes point along the z axis.",
    },
    {
      id: "shell-center",
      label: "Nucleus",
      box: { center: { x: 0, y: 0, z: 0 }, size: { x: 0.9, y: 0.9, z: 0.9 } },
      explanation:
        "Every individual p orbital has zero amplitude at the nucleus. A finite box around the nucleus still catches nearby density.",
    },
    {
      id: "shell-most-density",
      label: "Fuller region",
      box: { center: { x: 0, y: 0, z: 0 }, size: { x: 4.4, y: 4.4, z: 4.4 } },
      explanation:
        "A larger region encloses more of the average p-shell density, so the integrated probability moves toward 1.",
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
  const orbitalAxis: POrbitalAxis = "y";
  const [viewMode, setViewMode] = useState<Orbital3DViewMode>("py");
  const [box, setBox] = useState<AxisAlignedBox3D>(initialBox);
  const [mode, setMode] = useState<SamplingBoxMode>("move");
  const [canUseWebGL, setCanUseWebGL] = useState(false);
  const [highlight, setHighlight] = useState<IntegralHighlight>(null);
  const presets = useMemo(() => presetsForViewMode(viewMode), [viewMode]);
  const [presetExplanation, setPresetExplanation] = useState(presets[0].explanation);

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
    setHighlight(viewMode === "py" ? orbitalAxis : null);
  };

  const chooseViewMode = (nextViewMode: Orbital3DViewMode) => {
    const nextPresets = presetsForViewMode(nextViewMode);
    setViewMode(nextViewMode);
    setBox(nextPresets[0].box);
    setPresetExplanation(nextPresets[0].explanation);
    setHighlight(nextViewMode === "py" ? orbitalAxis : null);
  };

  return (
    <section className="orbital3d-explorer" aria-label="Probability in a selected three-dimensional p orbital volume">
      <section className="orbital3d-orbital-picker" aria-label="Choose focused p-y view or p-shell overview">
        <div>
          <span>Orbital view</span>
          <h3>Start with <POrbitalLabel axis="y" />, then compare the p shell</h3>
          <p>
            The focused view keeps the earlier y-axis story: one signed{" "}
            <POrbitalLabel axis="y" /> orbital. <POrbitalLabel axis="x" /> and{" "}
            <POrbitalLabel axis="z" /> use the same equation with x or z
            replacing y. The shell view shows all three separate p orbitals on
            the same atom.
          </p>
        </div>
        <div className="orbital3d-orbital-picker__buttons" role="group" aria-label="Orbital view selector">
          <button
            type="button"
            className={viewMode === "py" ? "is-active" : ""}
            aria-pressed={viewMode === "py"}
            aria-label="Show p y orbital only"
            onClick={() => chooseViewMode("py")}
          >
            <POrbitalLabel axis="y" /> only
          </button>
          <button
            type="button"
            className={viewMode === "shell" ? "is-active" : ""}
            aria-pressed={viewMode === "shell"}
            aria-label="Show p x p y and p z shell overview"
            onClick={() => chooseViewMode("shell")}
          >
            p shell
          </button>
        </div>
        <div
          className="orbital3d-orbital-equation"
          aria-label={viewMode === "shell" ? "Equations for the p-shell density overview" : "Equation for the p-y orbital"}
        >
          {viewMode === "shell" ? (
            <>
              <strong className="orbital3d-orbital-equation__stack">
                <span>
                  <OrbitalWavefunctionLabel axis="i" />(x, y, z) = N i{" "}
                  e<sup>−α(x<sup>2</sup> + y<sup>2</sup> + z<sup>2</sup>)</sup>
                </span>
                <span>
                  ρ<sub>p,avg</sub> = (|<OrbitalWavefunctionLabel axis="x" />|² + |<OrbitalWavefunctionLabel axis="y" />|² + |<OrbitalWavefunctionLabel axis="z" />|²) / 3
                </span>
              </strong>
              <span>
                Here i is x, y, or z. The shell readout averages the three
                separate p-orbital densities so P(box) stays on a 0 to 1 scale.
              </span>
            </>
          ) : (
            <>
              <strong>
                <OrbitalWavefunctionLabel axis="y" />(x, y, z) = N y{" "}
                e<sup>−α(x<sup>2</sup> + y<sup>2</sup> + z<sup>2</sup>)</sup>
              </strong>
              <span>
                This is the same p-orbital rule used for <POrbitalLabel axis="x" />{" "}
                and <POrbitalLabel axis="z" />, with the axis coordinate
                changed.
              </span>
            </>
          )}
        </div>
      </section>

      <div className="orbital3d-layout">
        <div className="orbital3d-view-stack">
          {canUseWebGL ? (
            <PyOrbitalScene
              alpha={alpha}
              box={box}
              globalPhase={globalPhase}
              mode={mode}
              orbitalAxis={orbitalAxis}
              viewMode={viewMode}
              onBoxChange={(nextBox) => updateBox(nextBox, null)}
            />
          ) : (
            <Orbital3DFallback
              box={box}
              globalPhase={globalPhase}
              orbitalAxis={orbitalAxis}
              viewMode={viewMode}
            />
          )}
          <p className="orbital3d-surface-note">
            {viewMode === "shell" ? (
              <>
                The shell overview overlays <POrbitalLabel axis="x" />,{" "}
                <POrbitalLabel axis="y" />, and <POrbitalLabel axis="z" />.
                They are three separate orbitals, not one combined orbital.
              </>
            ) : (
              "The surface marks one selected wave-amplitude level. The orbital extends beyond the surface."
            )}
          </p>
          <Orbital3DLiveValues
            alpha={alpha}
            box={box}
            globalPhase={globalPhase}
            highlight={highlight}
            orbitalAxis={orbitalAxis}
            viewMode={viewMode}
          />
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
        </div>
      </div>

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
