export type LessonId =
  | 'phase'
  | 'combination'
  | 'bonding'
  | 'overlap'
  | 'energy-gap'
  | 'polarization'
  | 'ethylene-formaldehyde'
  | 'geometry'
  | 'pi-chain'
  | 'calculation';

export interface LessonMeta {
  id: LessonId;
  number: number;
  shortTitle: string;
  title: string;
}

export const lessons: LessonMeta[] = [
  { id: 'phase', number: 1, shortTitle: 'Phase', title: 'This is not an orbital' },
  { id: 'combination', number: 2, shortTitle: 'Add', title: 'Adding two orbitals' },
  { id: 'bonding', number: 3, shortTitle: 'Bonding', title: 'Bonding and antibonding' },
  { id: 'overlap', number: 4, shortTitle: 'Overlap', title: 'Overlap controls interaction' },
  { id: 'energy-gap', number: 5, shortTitle: 'Gap', title: 'Starting energy gap' },
  { id: 'polarization', number: 6, shortTitle: 'Polarize', title: 'Electronegativity and polarization' },
  { id: 'ethylene-formaldehyde', number: 7, shortTitle: 'C=C vs C=O', title: 'Ethylene and formaldehyde' },
  { id: 'geometry', number: 8, shortTitle: 'Geometry', title: 'Geometry changes overlap' },
  { id: 'pi-chain', number: 9, shortTitle: 'Pi chains', title: 'More atoms, more pi orbitals' },
  { id: 'calculation', number: 10, shortTitle: 'Compare', title: 'Compare with a calculation' },
];
