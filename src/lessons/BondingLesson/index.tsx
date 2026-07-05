import { GuidedOrbitalLesson } from '../GuidedOrbitalLesson';
import type { LessonComponentProps } from '../types';

export function BondingLesson(props: LessonComponentProps) {
  return <GuidedOrbitalLesson {...props} lessonId="bonding" />;
}
