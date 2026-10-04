import { useId, type ReactNode } from "react";

interface LegalSectionProps {
  title: string;
  children: ReactNode;
}

// One block of a long-form reading page (the legal pages, and the guide,
// methodology and credits pages): a labelled region with a Literata heading and
// its text in the interface face, Atkinson Hyperlegible, for steady reading.
export function LegalSection({ title, children }: LegalSectionProps) {
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className="scroll-mt-6 space-y-3">
      <h2
        id={headingId}
        className="font-display text-xl font-semibold"
      >
        {title}
      </h2>
      <div className="space-y-3 text-base leading-relaxed">{children}</div>
    </section>
  );
}
