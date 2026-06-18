import { normalizeVector, round, squaredWeight } from './normalization';

export interface OrbitalContribution {
  a: number;
  b: number;
  aShare: number;
  bShare: number;
}

export interface MixingResult {
  lowerEnergy: number;
  upperEnergy: number;
  lower: OrbitalContribution;
  upper: OrbitalContribution;
  startingGap: number;
  interaction: number;
  separation: number;
  sharedCharacter: number;
}

function contributionFromVector(values: [number, number]): OrbitalContribution {
  const [a, b] = normalizeVector(values);
  const orientedA = Math.abs(a) >= Math.abs(b) && a < 0 ? -a : a;
  const orientedB = Math.abs(a) >= Math.abs(b) && a < 0 ? -b : b;
  return {
    a: orientedA,
    b: orientedB,
    aShare: squaredWeight(orientedA),
    bShare: squaredWeight(orientedB),
  };
}

function vectorForLevel(energyA: number, interaction: number, levelEnergy: number): [number, number] {
  if (Math.abs(interaction) < 1e-10) {
    return levelEnergy <= energyA ? [1, 0] : [0, 1];
  }
  return [interaction, levelEnergy - energyA];
}

export function mixTwoOrbitals(energyA: number, energyB: number, interaction: number): MixingResult {
  const coupling = Math.abs(interaction);
  const average = (energyA + energyB) / 2;
  const halfDifference = (energyA - energyB) / 2;
  const root = Math.sqrt(halfDifference * halfDifference + coupling * coupling);
  const lowerEnergy = average - root;
  const upperEnergy = average + root;
  const lower = contributionFromVector(vectorForLevel(energyA, coupling, lowerEnergy));
  const upper = contributionFromVector(vectorForLevel(energyA, coupling, upperEnergy));
  const sharedCharacter = Math.min(lower.aShare, lower.bShare);

  return {
    lowerEnergy: round(lowerEnergy, 3),
    upperEnergy: round(upperEnergy, 3),
    lower,
    upper,
    startingGap: round(Math.abs(energyA - energyB), 3),
    interaction: round(coupling, 3),
    separation: round(upperEnergy - lowerEnergy, 3),
    sharedCharacter: round(sharedCharacter, 3),
  };
}

export function energySeparation(interaction: number, energyGap = 0): number {
  return round(2 * Math.sqrt((energyGap / 2) ** 2 + interaction ** 2), 3);
}
