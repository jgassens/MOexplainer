export type PhaseSign = 1 | -1;

/**
 * A normalized, one-dimensional slice through a p-like teaching orbital.
 * The function has a node at x = 0 and reaches magnitude 1 at x = ±1.
 * It is a teaching model, not an atomic-orbital calculation.
 */
export function teachingPOrbital(
  x: number,
  overallSign: PhaseSign = 1,
): number {
  return overallSign * x * Math.exp((1 - x * x) / 2);
}

/** Relative density contribution from one real-valued orbital. */
export function relativeDensity(psi: number): number {
  return psi * psi;
}

export function formatSigned(value: number, digits = 2): string {
  const rounded = Math.abs(value) < 0.5 * 10 ** -digits ? 0 : value;
  return `${rounded >= 0 ? "+" : "−"}${Math.abs(rounded).toFixed(digits)}`;
}
