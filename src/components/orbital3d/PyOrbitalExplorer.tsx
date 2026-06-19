import { useEffect, useMemo, useState } from "react";
import type { AxisAlignedBox3D, GlobalPhaseSign } from "../../models/pyOrbital3d";
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
  const [box, setBox] = useState<AxisAlignedBox3D>(initialBox);
  const [mode, setMode] = useState<SamplingBoxMode>("move");
  const [canUseWebGL, setCanUseWebGL] = useState(false);
  const [highlight, setHighlight] = useState<IntegralHighlight>(null);
  const presets = useMemo<SamplingPreset[]>(
    () => [
      {
        id: "positive-lobe",
        label: "Positive lobe",
        box: { center: { x: 0, y: 1, z: 0 }, size: { x: 1, y: 1, z: 1 } },
        explanation:
          "ψ is positive at the center. Density and box probability are positive, but neither retains a phase sign.",
      },
      {
        id: "mirror-negative",
        label: "Mirror negative lobe",
        box: { center: { x: 0, y: -1, z: 0 }, size: { x: 1, y: 1, z: 1 } },
        explanation:
          "ψ changed sign, but the density and integrated probability are unchanged for these mirrored regions.",
      },
      {
        id: "center-node",
        label: "Center on node",
        box: { center: { x: 0, y: 0, z: 0 }, size: { x: 1, y: 0.9, z: 1 } },
        explanation:
          "ψ and |ψ|² are zero at the exact center. The complete box can still have nonzero probability because it extends into both lobes.",
      },
      {
        id: "thin-node",
        label: "Thin around node",
        box: { center: { x: 0, y: 0, z: 0 }, size: { x: 1, y: 0.12, z: 1 } },
        explanation:
          "As the selected volume becomes confined close to the nodal plane, the integrated probability approaches zero.",
      },
      {
        id: "far",
        label: "Far from nucleus",
        box: { center: { x: 2.35, y: 2.35, z: 0 }, size: { x: 0.8, y: 0.8, z: 0.8 } },
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
    ],
    [],
  );
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
    setHighlight("y");
  };

  return (
    <section className="orbital3d-explorer" aria-label="Probability in a three-dimensional p-y orbital volume">
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
              onBoxChange={(nextBox) => updateBox(nextBox, null)}
            />
          ) : (
            <Orbital3DFallback box={box} globalPhase={globalPhase} />
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
          />
        </div>
      </div>

      <details className="orbital3d-going-deeper">
        <summary>Going deeper: how the box integral is evaluated</summary>
        <p>
          For this normalized pᵧ teaching function, |ψ|² separates into x, y,
          and z factors. The app evaluates the rectangular-box probability with
          one-dimensional Gaussian integrals and the error function, not by
          estimating center density times volume.
        </p>
      </details>
    </section>
  );
}
