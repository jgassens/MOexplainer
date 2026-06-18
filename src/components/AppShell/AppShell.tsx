import { Download } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { lessons } from '../../content/lessons';
import { readObservation } from '../ObservationBox/storage';
import { lessonComponents } from '../../lessons';

export function AppShell() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeLesson = lessons[activeIndex];
  const ActiveLesson = lessonComponents[activeLesson.id];
  const progress = useMemo(() => ((activeIndex + 1) / lessons.length) * 100, [activeIndex]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [activeIndex]);

  const previous = () => setActiveIndex((index) => Math.max(0, index - 1));
  const next = () => setActiveIndex((index) => Math.min(lessons.length - 1, index + 1));

  const exportObservations = () => {
    const markdown = lessons
      .map((lesson) => {
        const record = readObservation(lesson.id);
        return [
          `## Lesson ${lesson.number}: ${lesson.title}`,
          '',
          `**Prediction**`,
          record.prediction || '_No response yet._',
          '',
          `**Observation**`,
          record.observation || '_No response yet._',
          '',
          `**Check understanding**`,
          record.check || '_No response yet._',
          '',
        ].join('\n');
      })
      .join('\n');

    const blob = new Blob([`# Molecular Orbital Observations\n\n${markdown}`], {
      type: 'text/markdown;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'mo-observations.md';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <span className="brand-mark" aria-hidden="true">psi</span>
          <div>
            <p>Ceci n'est pas une orbitale</p>
            <strong>MO Explainer</strong>
          </div>
        </div>
        <div className="mobile-progress" aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </div>
        <nav className="lesson-list" aria-label="Lesson progress">
          {lessons.map((lesson, index) => (
            <button
              key={lesson.id}
              type="button"
              className={index === activeIndex ? 'is-active' : ''}
              onClick={() => setActiveIndex(index)}
              aria-current={index === activeIndex ? 'step' : undefined}
            >
              <span>{lesson.number}</span>
              <strong>{lesson.shortTitle}</strong>
            </button>
          ))}
        </nav>
        <button type="button" className="export-button" onClick={exportObservations}>
          <Download aria-hidden="true" size={17} />
          Export observations
        </button>
      </aside>

      <main className="main-stage">
        <ActiveLesson
          meta={activeLesson}
          onPrevious={previous}
          onNext={next}
          previousDisabled={activeIndex === 0}
          nextDisabled={activeIndex === lessons.length - 1}
        />
      </main>
    </div>
  );
}
