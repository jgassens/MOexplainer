import { GuidedOrbitalLesson } from '../GuidedOrbitalLesson';
import type { LessonComponentProps } from '../types';

export function PolarizationLesson(props: LessonComponentProps) {
  return <GuidedOrbitalLesson {...props} lessonId="polarization" />;
}
