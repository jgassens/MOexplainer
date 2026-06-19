import type { AxisAlignedBox3D, GlobalPhaseSign } from "../../models/pyOrbital3d";

interface Orbital3DFallbackProps {
  box: AxisAlignedBox3D;
  globalPhase: GlobalPhaseSign;
}

function projectX(value: number) {
  return 260 + value * 58;
}

function projectY(value: number) {
  return 150 - value * 58;
}

export function Orbital3DFallback({ box, globalPhase }: Orbital3DFallbackProps) {
  const positiveLabel = globalPhase === 1 ? "+" : "−";
  const negativeLabel = globalPhase === 1 ? "−" : "+";
  const rectX = projectX(box.center.x - box.size.x / 2);
  const rectY = projectY(box.center.y + box.size.y / 2);
  const rectWidth = box.size.x * 58;
  const rectHeight = box.size.y * 58;

  return (
    <div className="orbital3d-fallback" role="img" aria-label="Fallback x-y projection of a p-y orbital and sampling box">
      <p>
        The 3D WebGL view is unavailable here, but the calculation, controls,
        and live probability values still work.
      </p>
      <svg viewBox="0 0 520 300" aria-hidden="true">
        <rect x="12" y="12" width="496" height="276" rx="18" className="orbital3d-fallback__frame" />
        <line x1="52" x2="468" y1="150" y2="150" className="orbital3d-fallback__node" />
        <line x1="260" x2="260" y1="36" y2="264" className="orbital3d-fallback__axis" />
        <text x="456" y="137" className="orbital3d-fallback__axis-label">x</text>
        <text x="270" y="48" className="orbital3d-fallback__axis-label">+y</text>
        <text x="270" y="264" className="orbital3d-fallback__axis-label">−y</text>
        <text x="274" y="169" className="orbital3d-fallback__node-label">nodal line: y = 0</text>

        <path
          d="M 260 150 C 204 112 190 68 212 41 C 239 9 281 9 308 41 C 330 68 316 112 260 150 Z"
          className={globalPhase === 1 ? "orbital3d-fallback__positive" : "orbital3d-fallback__negative"}
        />
        <path
          d="M 260 150 C 204 188 190 232 212 259 C 239 291 281 291 308 259 C 330 232 316 188 260 150 Z"
          className={globalPhase === 1 ? "orbital3d-fallback__negative" : "orbital3d-fallback__positive"}
        />
        <circle cx="260" cy="150" r="9" className="orbital3d-fallback__nucleus" />
        <text x="260" y="86" className="orbital3d-fallback__sign">{positiveLabel}</text>
        <text x="260" y="227" className="orbital3d-fallback__sign">{negativeLabel}</text>

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
