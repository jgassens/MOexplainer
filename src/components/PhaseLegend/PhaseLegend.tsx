export function PhaseLegend() {
  return (
    <aside className="phase-legend" aria-label="Orbital sign legend">
      <span className="phase-chip phase-chip--positive">
        <strong>+</strong> ψ is greater than zero
      </span>
      <span className="phase-chip phase-chip--negative">
        <strong>−</strong> ψ is less than zero
      </span>
      <span className="phase-legend__note">
        The colors label the sign of ψ. They do not show positive and negative
        charge.
      </span>
    </aside>
  );
}
