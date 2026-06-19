export type PhaseSign = 1 | -1;

/**
 * A scaled, one-dimensional slice along the lobe axis of a p-like teaching
 * orbital. The coordinate is zero in the nodal plane, and the curve is scaled
 * to reach magnitude 1 at coordinate = ±1.
 *
 * These values are relative wave amplitudes. They are not probabilities, not
 * percentages, and not a normalized three-dimensional atomic-orbital result.
 */
export function teachingPOrbital(
  coordinate: number,
  overallSign: PhaseSign = 1,
): number {
  return overallSign * coordinate * Math.exp((1 - coordinate * coordinate) / 2);
}

/** Relative probability-density shape from the scaled real-valued amplitude. */
export function relativeDensity(psi: number): number {
  return psi * psi;
}

export function formatSigned(value: number, digits = 2): string {
  const rounded = Math.abs(value) < 0.5 * 10 ** -digits ? 0 : value;
  return `${rounded >= 0 ? "+" : "−"}${Math.abs(rounded).toFixed(digits)}`;
}
