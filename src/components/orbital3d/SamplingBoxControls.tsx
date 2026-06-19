import type {
  AxisAlignedBox3D,
  GlobalPhaseSign,
  Point3D,
} from "../../models/pyOrbital3d";
import type { IntegralHighlight } from "./Orbital3DLiveValues";

export type SamplingBoxMode = "move" | "resize";

export interface SamplingPreset {
  id: string;
  label: string;
  box: AxisAlignedBox3D;
  explanation: string;
}

interface SamplingBoxControlsProps {
  alpha: number;
  box: AxisAlignedBox3D;
  globalPhase: GlobalPhaseSign;
  mode: SamplingBoxMode;
  onAlphaChange: (value: number) => void;
  onBoxChange: (box: AxisAlignedBox3D, highlight: IntegralHighlight) => void;
  onGlobalPhaseChange: (value: GlobalPhaseSign) => void;
  onModeChange: (mode: SamplingBoxMode) => void;
  onPresetChoose: (preset: SamplingPreset) => void;
  presets: readonly SamplingPreset[];
  presetExplanation: string;
}

const CENTER_MIN = -2.6;
const CENTER_MAX = 2.6;
const SIZE_MIN = 0.08;
const SIZE_MAX = 4.4;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function axisHighlight(axis: keyof Point3D): IntegralHighlight {
  return axis;
}

function numberFromInput(value: string, fallback: number, min: number, max: number) {
  const next = Number(value);
  if (!Number.isFinite(next)) return fallback;
  return clamp(next, min, max);
}

function BoxRange({
  description,
  id,
  label,
  max,
  min,
  onChange,
  step,
  value,
}: {
  description: string;
  id: string;
  label: string;
  max: number;
  min: number;
  onChange: (value: number) => void;
  step: number;
  value: number;
}) {
  const numericId = `${id}-number`;

  return (
    <div className="orbital3d-control-range">
      <label htmlFor={id}>
        <span>{label}</span>
        <strong>{value.toFixed(2)}</strong>
      </label>
      <p>{description}</p>
      <div className="orbital3d-control-range__inputs">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.currentTarget.value))}
        />
        <label className="orbital3d-number-input" htmlFor={numericId}>
          <span>{label} numeric value</span>
          <input
            id={numericId}
            aria-label={`${label} numeric input`}
            type="number"
            min={min}
            max={max}
            step={step}
            value={value.toFixed(2)}
            onChange={(event) => onChange(numberFromInput(event.currentTarget.value, value, min, max))}
          />
        </label>
      </div>
    </div>
  );
}

export function SamplingBoxControls({
  alpha,
  box,
  globalPhase,
  mode,
  onAlphaChange,
  onBoxChange,
  onGlobalPhaseChange,
  onModeChange,
  onPresetChoose,
  presets,
  presetExplanation,
}: SamplingBoxControlsProps) {
  const updateCenter = (axis: keyof Point3D, value: number) => {
    onBoxChange(
      {
        ...box,
        center: {
          ...box.center,
          [axis]: clamp(value, CENTER_MIN, CENTER_MAX),
        },
      },
      axisHighlight(axis),
    );
  };

  const updateSize = (axis: keyof Point3D, value: number) => {
    onBoxChange(
      {
        ...box,
        size: {
          ...box.size,
          [axis]: clamp(value, SIZE_MIN, SIZE_MAX),
        },
      },
      axisHighlight(axis),
    );
  };

  return (
    <section className="orbital3d-controls" aria-label="Sampling box and orbital controls">
      <div className="orbital3d-controls__header">
        <span>Change</span>
        <h3>Sampling box</h3>
      </div>

      <div className="orbital3d-mode-toggle" aria-label="Sampling box mode">
        <button
          type="button"
          className={mode === "move" ? "is-active" : ""}
          aria-pressed={mode === "move"}
          onClick={() => onModeChange("move")}
        >
          Move box
        </button>
        <button
          type="button"
          className={mode === "resize" ? "is-active" : ""}
          aria-pressed={mode === "resize"}
          onClick={() => onModeChange("resize")}
        >
          Resize box
        </button>
      </div>

      <div className="orbital3d-control-grid">
        {mode === "move" ? (
          <>
            <BoxRange
              id="orbital3d-x-center"
              label="x center"
              description="Move left or right in model distance units."
              min={CENTER_MIN}
              max={CENTER_MAX}
              step={0.05}
              value={box.center.x}
              onChange={(value) => updateCenter("x", value)}
            />
            <BoxRange
              id="orbital3d-y-center"
              label="y center"
              description="Move through the negative lobe, node, or positive lobe."
              min={CENTER_MIN}
              max={CENTER_MAX}
              step={0.05}
              value={box.center.y}
              onChange={(value) => updateCenter("y", value)}
            />
            <BoxRange
              id="orbital3d-z-center"
              label="z center"
              description="Move above or below the orbital axis."
              min={CENTER_MIN}
              max={CENTER_MAX}
              step={0.05}
              value={box.center.z}
              onChange={(value) => updateCenter("z", value)}
            />
          </>
        ) : (
          <>
            <BoxRange
              id="orbital3d-width"
              label="width"
              description="Set the x extent of the selected volume."
              min={SIZE_MIN}
              max={SIZE_MAX}
              step={0.05}
              value={box.size.x}
              onChange={(value) => updateSize("x", value)}
            />
            <BoxRange
              id="orbital3d-height"
              label="height"
              description="Set the y extent; thin boxes near the node contain little density."
              min={SIZE_MIN}
              max={SIZE_MAX}
              step={0.05}
              value={box.size.y}
              onChange={(value) => updateSize("y", value)}
            />
            <BoxRange
              id="orbital3d-depth"
              label="depth"
              description="Set the z extent of the selected volume."
              min={SIZE_MIN}
              max={SIZE_MAX}
              step={0.05}
              value={box.size.z}
              onChange={(value) => updateSize("z", value)}
            />
          </>
        )}
      </div>

      <div className="orbital3d-alpha-phase">
        <BoxRange
          id="orbital3d-alpha"
          label="compactness α"
          description="Larger α makes the normalized orbital more compact."
          min={0.35}
          max={1.8}
          step={0.05}
          value={alpha}
          onChange={onAlphaChange}
        />
        <fieldset className="orbital3d-phase-toggle">
          <legend>global phase</legend>
          <p>Flip every sign of ψ. Density and probability do not change.</p>
          <div>
            <button
              type="button"
              className={globalPhase === 1 ? "is-active" : ""}
              aria-pressed={globalPhase === 1}
              onClick={() => onGlobalPhaseChange(1)}
            >
              ψ
            </button>
            <button
              type="button"
              className={globalPhase === -1 ? "is-active" : ""}
              aria-pressed={globalPhase === -1}
              onClick={() => onGlobalPhaseChange(-1)}
            >
              −ψ
            </button>
          </div>
        </fieldset>
      </div>

      <div className="orbital3d-presets" aria-label="Try these positions">
        <span>Try these positions</span>
        <div>
          {presets.map((preset) => (
            <button key={preset.id} type="button" onClick={() => onPresetChoose(preset)}>
              {preset.label}
            </button>
          ))}
        </div>
        <p aria-live="polite">{presetExplanation}</p>
      </div>
    </section>
  );
}
