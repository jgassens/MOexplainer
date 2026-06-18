import type { ReactNode } from 'react';

interface ConceptCardProps {
  title: string;
  children: ReactNode;
}

export function ConceptCard({ title, children }: ConceptCardProps) {
  return (
    <section className="concept-card">
      <h3>{title}</h3>
      <div className="concept-card__body">{children}</div>
    </section>
  );
}
