import type { LessonId } from '../../content/lessons';

export interface ObservationRecord {
  prediction: string;
  observation: string;
  check: string;
}

export const blankRecord: ObservationRecord = {
  prediction: '',
  observation: '',
  check: '',
};

export function observationKey(lessonId: LessonId): string {
  return `moexplainer:observation:${lessonId}`;
}

export function readObservation(lessonId: LessonId): ObservationRecord {
  if (typeof localStorage === 'undefined') {
    return blankRecord;
  }
  const raw = localStorage.getItem(observationKey(lessonId));
  if (!raw) {
    return blankRecord;
  }
  try {
    return { ...blankRecord, ...JSON.parse(raw) } as ObservationRecord;
  } catch {
    return blankRecord;
  }
}
