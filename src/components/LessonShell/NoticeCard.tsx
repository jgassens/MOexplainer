export function NoticeCard({ feedback }: { feedback: string }) {
  return (
    <section className="notice-card" aria-live="polite">
      <h3>What to notice</h3>
      <p>{feedback}</p>
    </section>
  );
}
