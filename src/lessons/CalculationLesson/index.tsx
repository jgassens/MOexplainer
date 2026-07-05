import { GuidedOrbitalLesson } from '../GuidedOrbitalLesson';
import type { LessonComponentProps } from '../types';

export function CalculationLesson(props: LessonComponentProps) {
  return <GuidedOrbitalLesson {...props} lessonId="calculation" />;
}
