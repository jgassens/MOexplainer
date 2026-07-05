import { GuidedOrbitalLesson } from '../GuidedOrbitalLesson';
import type { LessonComponentProps } from '../types';

export function EnergyGapLesson(props: LessonComponentProps) {
  return <GuidedOrbitalLesson {...props} lessonId="energy-gap" />;
}
