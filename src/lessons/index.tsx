import type { LessonId } from '../content/lessons';
import { BondingLesson } from './BondingLesson';
import { CalculationLesson } from './CalculationLesson';
import { CombinationLesson } from './CombinationLesson';
import { EnergyGapLesson } from './EnergyGapLesson';
import { EthyleneFormaldehydeLesson } from './EthyleneFormaldehydeLesson';
import { GeometryLesson } from './GeometryLesson';
import { OverlapLesson } from './OverlapLesson';
import { PhaseLesson } from './PhaseLesson';
import { PiChainLesson } from './PiChainLesson';
import { PolarizationLesson } from './PolarizationLesson';
import type { LessonComponentProps } from './types';

export const lessonComponents: Record<LessonId, (props: LessonComponentProps) => JSX.Element> = {
  phase: PhaseLesson,
  combination: CombinationLesson,
  bonding: BondingLesson,
  overlap: OverlapLesson,
  'energy-gap': EnergyGapLesson,
  polarization: PolarizationLesson,
  'ethylene-formaldehyde': EthyleneFormaldehydeLesson,
  geometry: GeometryLesson,
  'pi-chain': PiChainLesson,
  calculation: CalculationLesson,
};
