import { GuidedOrbitalLesson } from '../GuidedOrbitalLesson';
import type { LessonComponentProps } from '../types';

export function OverlapLesson(props: LessonComponentProps) {
  return <GuidedOrbitalLesson {...props} lessonId="overlap" />;
}
