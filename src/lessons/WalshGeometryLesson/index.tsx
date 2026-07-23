// DEPRECATED — folded into the "overlap" lesson (Overlap and geometry).
// This wrapper is no longer registered in the lesson list. It is kept only as a
// valid alias because it cannot be deleted from a remote session; the whole
// WalshGeometryLesson/ folder is safe to delete.
import { GuidedOrbitalLesson } from '../GuidedOrbitalLesson';
import type { LessonComponentProps } from '../types';

export function WalshGeometryLesson(props: LessonComponentProps) {
  return <GuidedOrbitalLesson {...props} lessonId="overlap" />;
}
