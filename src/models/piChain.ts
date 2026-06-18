import { round } from './normalization';

export interface PiOrbital {
  index: number;
  label: string;
  energy: number;
  coefficients: number[];
  nodeCount: number;
}

export interface OccupiedLevel extends PiOrbital {
  electrons: number;
  role: 'HOMO' | 'LUMO' | 'occupied' | 'empty';
}

export function piChainOrbitals(atomCount: number, beta = -1): PiOrbital[] {
  const n = Math.max(2, Math.min(6, Math.round(atomCount)));
  const norm = Math.sqrt(2 / (n + 1));
  const orbitals = Array.from({ length: n }, (_, kIndex) => {
    const k = kIndex + 1;
    const coefficients = Array.from({ length: n }, (_, atomIndex) => {
      const j = atomIndex + 1;
      return norm * Math.sin((j * k * Math.PI) / (n + 1));
    });
    return {
      index: kIndex,
      label: `pi ${k}`,
      energy: round(2 * beta * Math.cos((k * Math.PI) / (n + 1)), 3),
      coefficients,
      nodeCount: k - 1,
    };
  });

  return orbitals.sort((a, b) => a.energy - b.energy);
}

export function occupancyForPiChain(atomCount: number, electronCount: number): OccupiedLevel[] {
  const orbitals = piChainOrbitals(atomCount);
  let remaining = Math.max(0, Math.min(2 * atomCount, Math.round(electronCount)));
  const filled = orbitals.map((orbital) => {
    const electrons = Math.min(2, remaining);
    remaining -= electrons;
    return { ...orbital, electrons, role: 'empty' as OccupiedLevel['role'] };
  });

  const occupiedIndexes = filled
    .map((level, index) => ({ level, index }))
    .filter(({ level }) => level.electrons > 0);
  const homoIndex = occupiedIndexes.length ? occupiedIndexes[occupiedIndexes.length - 1].index : -1;
  const lumoIndex = filled.findIndex((level) => level.electrons === 0);

  return filled.map((level, index) => ({
    ...level,
    role:
      index === homoIndex
        ? 'HOMO'
        : index === lumoIndex
          ? 'LUMO'
          : level.electrons > 0
            ? 'occupied'
            : 'empty',
  }));
}

export function coefficientNorm(coefficients: number[]): number {
  return round(
    coefficients.reduce((sum, coefficient) => sum + coefficient * coefficient, 0),
    6,
  );
}
