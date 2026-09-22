import { useId, type ReactNode } from "react";

interface LegalSectionProps {
  title: string;
  children: ReactNode;
}

// One block of a legal page: a labelled region with a heading and its text. The
// text stays on the system sans: only one weight (600) of the serif is loaded,
// which is too heavy for paragraphs, and the design keeps the serif for
// headlines (see the font-face note in globals.css).
export function LegalSection({ title, children }: LegalSectionProps) {
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className="space-y-3">
      <h2
        id={headingId}
        className="font-display text-lg font-semibold uppercase tracking-wide"
      >
        {title}
      </h2>
      <div className="space-y-3 text-base leading-relaxed">{children}</div>
    </section>
  );
}
