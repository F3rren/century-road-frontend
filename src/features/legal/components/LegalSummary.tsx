import { useId, type ReactNode } from "react";

interface LegalSummaryProps {
  items: readonly ReactNode[];
}

// The "in short" box that opens a legal page: a few plain points, set apart by
// the accent rule, before the full text.
export function LegalSummary({ items }: LegalSummaryProps) {
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className="border-l-2 border-primary pl-4">
      <h2
        id={headingId}
        className="font-display text-eyebrow uppercase text-muted-foreground"
      >
        In sintesi
      </h2>
      <ul className="mt-2 list-disc space-y-1.5 pl-5 text-base leading-relaxed">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
