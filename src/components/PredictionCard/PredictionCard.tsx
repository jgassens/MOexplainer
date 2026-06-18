interface PredictionCardProps {
  prompt: string;
  answerHint?: string;
}

export function PredictionCard({ prompt, answerHint }: PredictionCardProps) {
  return (
    <section className="prediction-card">
      <h3>Check</h3>
      <p>{prompt}</p>
      {answerHint ? <p className="prediction-card__hint">{answerHint}</p> : null}
    </section>
  );
}
