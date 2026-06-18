import { pOrbitalValue } from './orbitals';
import { clamp, round } from './normalization';

export interface OverlapResult {
  signedOverlap: number;
  usefulOverlap: number;
  interaction: number;
  energySeparation: number;
}

export function overlapScore(
  distance: number,
  compactness: number,
  relativePhase: 1 | -1 = 1,
  gridSize = 71,
  limit = 5,
): number {
  const left = -distance / 2;
  const right = distance / 2;
  const step = (2 * limit) / (gridSize - 1);
  let sum = 0;

  for (let ix = 0; ix < gridSize; ix += 1) {
    const x = -limit + ix * step;
    for (let iy = 0; iy < gridSize; iy += 1) {
      const y = -limit + iy * step;
      const phiA = pOrbitalValue(x, y, left, compactness);
      const phiB = relativePhase * pOrbitalValue(x, y, right, compactness);
      sum += phiA * phiB;
    }
  }

  return sum * step * step;
}

export function overlapModel(distance: number, compactness: number, relativePhase: 1 | -1 = 1): OverlapResult {
  const signedOverlap = overlapScore(distance, compactness, relativePhase);
  const usefulOverlap = Math.abs(signedOverlap);
  const interaction = clamp(usefulOverlap * 1.6, 0, 1.2);
  return {
    signedOverlap: round(signedOverlap, 3),
    usefulOverlap: round(usefulOverlap, 3),
    interaction: round(interaction, 3),
    energySeparation: round(2 * interaction, 3),
  };
}

export function geometryOverlap(twistDegrees: number): number {
  const radians = (twistDegrees * Math.PI) / 180;
  return round(Math.max(0, Math.cos(radians)), 3);
}
