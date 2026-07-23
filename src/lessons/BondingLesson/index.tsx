// DEPRECATED — the standalone "bonding" lesson was merged into the Combination
// lesson ("Bond or node"). This wrapper is no longer registered in the lesson
// list. It is kept only as a valid alias because it cannot be deleted from a
// remote session; the whole BondingLesson/ folder is safe to delete.
import { CombinationLesson } from '../CombinationLesson';
import type { LessonComponentProps } from '../types';

export function BondingLesson(props: LessonComponentProps) {
  return <CombinationLesson {...props} />;
}
