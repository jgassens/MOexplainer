import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { LessonMeta } from "../../content/lessons";
import { scrollToPageTop } from "../../utils/scroll";
import { ObservationBox } from "../ObservationBox/ObservationBox";
import { PhaseLegend } from "../PhaseLegend/PhaseLegend";

interface LessonShellProps {
  meta: LessonMeta;
  purpose: string;
  question?: string;
  children: ReactNode;
  showPhaseLegend?: boolean;
  showLearningCycle?: boolean;
  onPrevious: () => void;
  onNext: () => void;
  previousDisabled: boolean;
  nextDisabled: boolean;
}

export function LessonShell({
  meta,
  question,
  children,
  showPhaseLegend = true,
  onPrevious,
  onNext,
  previousDisabled,
  nextDisabled,
}: LessonShellProps) {
  const previous = () => {
    onPrevious();
    scrollToPageTop();
  };

  const next = () => {
    onNext();
    scrollToPageTop();
  };

  return (
    <article className="lesson-shell">
      <header className="lesson-shell__header">
        <div>
          <p className="lesson-shell__step">Lesson {meta.number}</p>
          <h1>{meta.title}</h1>
        </div>
        {showPhaseLegend ? <PhaseLegend /> : null}
      </header>

      {question ? (
        <section className="lesson-question" aria-label="Big question">
          <span>Big question</span>
          <p>{question}</p>
        </section>
      ) : null}

      {children}

      <ObservationBox lessonId={meta.id} />

      <nav className="lesson-nav" aria-label="Lesson navigation">
        <button type="button" onClick={previous} disabled={previousDisabled}>
          <ArrowLeft aria-hidden="true" size={18} />
          Previous
        </button>
        <button type="button" onClick={next} disabled={nextDisabled}>
          Next
          <ArrowRight aria-hidden="true" size={18} />
        </button>
      </nav>
    </article>
  );
}
