import type { LessonId } from '../content/lessons';
import { CalculationLesson } from './CalculationLesson';
import { CombinationLesson } from './CombinationLesson';
import { EnergyGapLesson } from './EnergyGapLesson';
import { OverlapLesson } from './OverlapLesson';
import { PhaseLesson } from './PhaseLesson';
import { PiChainLesson } from './PiChainLesson';
import type { LessonComponentProps } from './types';

type LessonComponent = (props: LessonComponentProps) => JSX.Element;

export const lessonComponents: Record<LessonId, LessonComponent> = {
  phase: PhaseLesson,
  combination: CombinationLesson,
  overlap: OverlapLesson,
  'energy-gap': EnergyGapLesson,
  'pi-chain': PiChainLesson,
  calculation: CalculationLesson,
};
