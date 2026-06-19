import { pOrbitalSpokenLabel, type POrbitalIndex } from "./orbitalLabelText";

export function POrbitalLabel({ axis }: { axis: POrbitalIndex }) {
  return (
    <span className="orbital3d-p-label" aria-label={pOrbitalSpokenLabel(axis)}>
      p<sub>{axis}</sub>
    </span>
  );
}

export function OrbitalWavefunctionLabel({ axis }: { axis: POrbitalIndex }) {
  return (
    <span className="orbital3d-wave-label" aria-label={`psi ${pOrbitalSpokenLabel(axis)}`}>
      ψ<span className="orbital3d-wave-label__sub">p<sub>{axis}</sub></span>
    </span>
  );
}
