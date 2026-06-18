import { useEffect, useState } from 'react';
import type { LessonId } from '../../content/lessons';
import type { ObservationRecord } from './storage';
import { observationKey, readObservation } from './storage';

export function ObservationBox({ lessonId }: { lessonId: LessonId }) {
  const [record, setRecord] = useState<ObservationRecord>(() => readObservation(lessonId));

  useEffect(() => {
    setRecord(readObservation(lessonId));
  }, [lessonId]);

  useEffect(() => {
    localStorage.setItem(observationKey(lessonId), JSON.stringify(record));
  }, [lessonId, record]);

  const update = (field: keyof ObservationRecord, value: string) => {
    setRecord((current) => ({ ...current, [field]: value }));
  };

  return (
    <section className="observation-box" aria-label="Observation notes">
      <h3>Observation box</h3>
      <label>
        Prediction
        <textarea value={record.prediction} onChange={(event) => update('prediction', event.currentTarget.value)} />
      </label>
      <label>
        Observation
        <textarea value={record.observation} onChange={(event) => update('observation', event.currentTarget.value)} />
      </label>
      <label>
        Check response
        <textarea value={record.check} onChange={(event) => update('check', event.currentTarget.value)} />
      </label>
    </section>
  );
}
