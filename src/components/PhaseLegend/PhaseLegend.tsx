export function PhaseLegend() {
  return (
    <aside className="phase-legend" aria-label="Phase legend">
      <span className="phase-chip phase-chip--positive">
        <strong>+</strong> positive phase
      </span>
      <span className="phase-chip phase-chip--negative">
        <strong>-</strong> negative phase
      </span>
      <span className="phase-legend__note">Blue/orange phase colors show the sign of psi, not charge.</span>
    </aside>
  );
}
