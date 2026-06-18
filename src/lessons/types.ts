import type { LessonMeta } from '../content/lessons';

export interface LessonComponentProps {
  meta: LessonMeta;
  onPrevious: () => void;
  onNext: () => void;
  previousDisabled: boolean;
  nextDisabled: boolean;
}
