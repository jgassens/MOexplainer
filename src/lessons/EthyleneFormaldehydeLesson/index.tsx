// DEPRECATED — folded into the "energy-gap" lesson (Energy gap and polarization).
// This wrapper is no longer registered in the lesson list. It is kept only as a
// valid alias because it cannot be deleted from a remote session; the whole
// EthyleneFormaldehydeLesson/ folder is safe to delete.
import { GuidedOrbitalLesson } from '../GuidedOrbitalLesson';
import type { LessonComponentProps } from '../types';

export function EthyleneFormaldehydeLesson(props: LessonComponentProps) {
  return <GuidedOrbitalLesson {...props} lessonId="energy-gap" />;
}
