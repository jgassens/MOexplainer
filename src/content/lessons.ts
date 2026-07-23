export type LessonId =
  | 'phase'
  | 'combination'
  | 'overlap'
  | 'energy-gap'
  | 'pi-chain'
  | 'calculation';

export interface LessonMeta {
  id: LessonId;
  number: number;
  shortTitle: string;
  title: string;
}

export const lessons: LessonMeta[] = [
  {
    id: 'phase',
    number: 1,
    shortTitle: 'Read ψ',
    title: 'What does one atomic orbital mean?',
  },
  {
    id: 'combination',
    number: 2,
    shortTitle: 'Bond or node',
    title: 'Two orbitals: bonding and antibonding',
  },
  {
    id: 'overlap',
    number: 3,
    shortTitle: 'Overlap & shape',
    title: 'Overlap and geometry',
  },
  {
    id: 'energy-gap',
    number: 4,
    shortTitle: 'Gap & polarization',
    title: 'Energy gap and polarization',
  },
  {
    id: 'pi-chain',
    number: 5,
    shortTitle: 'Pi systems',
    title: 'More atoms, more pi orbitals',
  },
  {
    id: 'calculation',
    number: 6,
    shortTitle: 'Real calculation',
    title: 'Compare with a calculation',
  },
];
