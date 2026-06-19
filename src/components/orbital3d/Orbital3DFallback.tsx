import type {
  AxisAlignedBox3D,
  GlobalPhaseSign,
  POrbitalAxis,
} from "../../models/pyOrbital3d";
import type { Orbital3DViewMode } from "./orbital3dViewMode";

interface Orbital3DFallbackProps {
  box: AxisAlignedBox3D;
  globalPhase: GlobalPhaseSign;
  orbitalAxis: POrbitalAxis;
  viewMode?: Orbital3DViewMode;
}

function projectX(value: number) {
  return 260 + value * 58;
}

function projectY(value: number) {
  return 150 - value * 58;
}

function projectedVerticalCoordinate(box: AxisAlignedBox3D, orbitalAxis: POrbitalAxis) {
  if (orbitalAxis === "z") return { center: box.center.z, size: box.size.z, label: "z" };
  return { center: box.center.y, size: box.size.y, label: "y" };
}

export function Orbital3DFallback({
  box,
  globalPhase,
  orbitalAxis,
  viewMode = "py",
}: Orbital3DFallbackProps) {
  const positiveLabel = globalPhase === 1 ? "+" : "−";
  const negativeLabel = globalPhase === 1 ? "−" : "+";
  const vertical = projectedVerticalCoordinate(box, orbitalAxis);
  const rectX = projectX(box.center.x - box.size.x / 2);
  const rectY = projectY(vertical.center + vertical.size / 2);
  const rectWidth = box.size.x * 58;
  const rectHeight = vertical.size * 58;
  const horizontalOrbital = orbitalAxis === "x";
  const nodeLabel =
    orbitalAxis === "x"
      ? "nodal line: x = 0"
      : orbitalAxis === "y"
        ? "nodal line: y = 0"
        : "nodal line: z = 0";

  return (
    <div
      className="orbital3d-fallback"
      role="img"
      aria-label={
        viewMode === "shell"
          ? "Fallback two-dimensional projection for the p-shell density overview and sampling box"
          : "Fallback two-dimensional projection of the selected p orbital and sampling box"
      }
    >
      <p>
        The 3D WebGL view is unavailable here, but the calculation, controls,
        and live probability values still work.{" "}
        {viewMode === "shell"
          ? "This fallback shows the p-y cross-section while the equations use the p-shell density."
          : null}
      </p>
      <svg viewBox="0 0 520 300" aria-hidden="true">
        <rect x="12" y="12" width="496" height="276" rx="18" className="orbital3d-fallback__frame" />
        <line
          x1="52"
          x2="468"
          y1="150"
          y2="150"
          className={horizontalOrbital ? "orbital3d-fallback__axis" : "orbital3d-fallback__node"}
        />
        <line
          x1="260"
          x2="260"
          y1="36"
          y2="264"
          className={horizontalOrbital ? "orbital3d-fallback__node" : "orbital3d-fallback__axis"}
        />
        <text x="456" y="137" className="orbital3d-fallback__axis-label">x</text>
        <text x="270" y="48" className="orbital3d-fallback__axis-label">+{vertical.label}</text>
        <text x="270" y="264" className="orbital3d-fallback__axis-label">−{vertical.label}</text>
        <text x="274" y="169" className="orbital3d-fallback__node-label">{nodeLabel}</text>

        {horizontalOrbital ? (
          <>
            <path
              d="M 260 150 C 218 92 150 74 98 91 C 57 104 57 196 98 209 C 150 226 218 208 260 150 Z"
              className={globalPhase === 1 ? "orbital3d-fallback__negative" : "orbital3d-fallback__positive"}
            />
            <path
              d="M 260 150 C 302 92 370 74 422 91 C 463 104 463 196 422 209 C 370 226 302 208 260 150 Z"
              className={globalPhase === 1 ? "orbital3d-fallback__positive" : "orbital3d-fallback__negative"}
            />
          </>
        ) : (
          <>
            <path
              d="M 260 150 C 204 112 190 68 212 41 C 239 9 281 9 308 41 C 330 68 316 112 260 150 Z"
              className={globalPhase === 1 ? "orbital3d-fallback__positive" : "orbital3d-fallback__negative"}
            />
            <path
              d="M 260 150 C 204 188 190 232 212 259 C 239 291 281 291 308 259 C 330 232 316 188 260 150 Z"
              className={globalPhase === 1 ? "orbital3d-fallback__negative" : "orbital3d-fallback__positive"}
            />
          </>
        )}
        <circle cx="260" cy="150" r="9" className="orbital3d-fallback__nucleus" />
        <text x={horizontalOrbital ? "382" : "260"} y={horizontalOrbital ? "161" : "86"} className="orbital3d-fallback__sign">{positiveLabel}</text>
        <text x={horizontalOrbital ? "138" : "260"} y={horizontalOrbital ? "161" : "227"} className="orbital3d-fallback__sign">{negativeLabel}</text>

        <rect
          x={rectX}
          y={rectY}
          width={rectWidth}
          height={rectHeight}
          className="orbital3d-fallback__box"
        />
        <circle
          cx={projectX(box.center.x)}
          cy={projectY(box.center.y)}
          r="5"
          className="orbital3d-fallback__box-center"
        />
      </svg>
    </div>
  );
}
