import katex from 'katex';

interface EquationCardProps {
  equation: string;
  definitions: Array<{ symbol: string; meaning: string }>;
  note?: string;
}

export function EquationCard({ equation, definitions, note }: EquationCardProps) {
  const html = katex.renderToString(equation, {
    throwOnError: false,
    displayMode: true,
    strict: 'ignore',
  });

  return (
    <section className="equation-card" aria-label="Equation and symbol definitions">
      <div className="equation-card__math" dangerouslySetInnerHTML={{ __html: html }} />
      <dl className="symbol-list">
        {definitions.map((item) => (
          <div key={item.symbol} className="symbol-list__row">
            <dt>{item.symbol}</dt>
            <dd>{item.meaning}</dd>
          </div>
        ))}
      </dl>
      {note ? <p className="equation-card__note">{note}</p> : null}
    </section>
  );
}
