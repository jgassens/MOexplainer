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
import { WalshGeometryLesson } from './WalshGeometryLesson';
import type { LessonComponentProps } from './types';

type LessonComponent = (props: LessonComponentProps) => JSX.Element;

export const lessonComponents: Record<LessonId, LessonComponent> = {
  phase: PhaseLesson,
  combination: CombinationLesson,
  bonding: BondingLesson,
  overlap: OverlapLesson,
  'energy-gap': EnergyGapLesson,
  polarization: PolarizationLesson,
  'ethylene-formaldehyde': EthyleneFormaldehydeLesson,
  geometry: GeometryLesson,
  'walsh-geometry': WalshGeometryLesson,
  'pi-chain': PiChainLesson,
  calculation: CalculationLesson,
};
