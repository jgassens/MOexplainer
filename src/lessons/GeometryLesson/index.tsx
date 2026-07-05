import { GuidedOrbitalLesson } from '../GuidedOrbitalLesson';
import type { LessonComponentProps } from '../types';

export function GeometryLesson(props: LessonComponentProps) {
  return <GuidedOrbitalLesson {...props} lessonId="geometry" />;
}
