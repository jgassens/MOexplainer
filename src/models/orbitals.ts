import { normalizeVector } from './normalization';

export type OrbitalDirection = 'x' | 'y';

export interface OrbitalSample {
  x: number;
  y: number;
  phiA: number;
  phiB: number;
  psi: number;
  density: number;
}

export function pOrbitalValue(
  x: number,
  y: number,
  centerX = 0,
  alpha = 0.8,
  direction: OrbitalDirection = 'y',
): number {
  const dx = x - centerX;
  const radial = Math.exp(-alpha * (dx * dx + y * y));
  return (direction === 'x' ? dx : y) * radial;
}

export function sOrbitalValue(x: number, y: number, centerX = 0, alpha = 0.8): number {
  const dx = x - centerX;
  return Math.exp(-alpha * (dx * dx + y * y));
}

export function combineOrbitals(phiA: number, phiB: number, weightA: number, weightB: number): number {
  return weightA * phiA + weightB * phiB;
}

export function densityValue(psi: number): number {
  return psi * psi;
}

export function lineSamples(start: number, end: number, count: number): number[] {
  if (count <= 1) {
    return [start];
  }
  const step = (end - start) / (count - 1);
  return Array.from({ length: count }, (_, index) => start + index * step);
}

export function sampleTwoPOrbitals({
  weightA,
  weightB,
  distance,
  compactness,
  points = 81,
  y = 0.85,
}: {
  weightA: number;
  weightB: number;
  distance: number;
  compactness: number;
  points?: number;
  y?: number;
}): OrbitalSample[] {
  const left = -distance / 2;
  const right = distance / 2;
  return lineSamples(-4.5, 4.5, points).map((x) => {
    const phiA = pOrbitalValue(x, y, left, compactness);
    const phiB = pOrbitalValue(x, y, right, compactness);
    const psi = combineOrbitals(phiA, phiB, weightA, weightB);
    return { x, y, phiA, phiB, psi, density: densityValue(psi) };
  });
}

export function normalizedCombinationWeights(weightA: number, weightB: number): [number, number] {
  const [a, b] = normalizeVector([weightA, weightB]);
  return [a, b];
}

export function hasMidpointNode(weightA: number, weightB: number, tolerance = 1e-8): boolean {
  return Math.abs(weightA + weightB) < tolerance;
}

export function phaseRelationship(weightA: number, weightB: number): 'same phase' | 'opposite phase' | 'one orbital dominates' {
  if (Math.abs(weightA) < 1e-8 || Math.abs(weightB) < 1e-8) {
    return 'one orbital dominates';
  }
  return weightA * weightB > 0 ? 'same phase' : 'opposite phase';
}
