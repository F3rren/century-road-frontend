import { useId, type ReactNode } from "react";

interface SettingsSectionProps {
  title: string;
  children: ReactNode;
}

// One row of the settings page: the section's name on the left, its controls
// on the right, rows divided by a rule rather than each boxed in a card.
// Stacks on a narrow screen.
export function SettingsSection({ title, children }: SettingsSectionProps) {
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className="grid gap-x-10 gap-y-3 border-t border-border py-7 first:border-t-0 first:pt-0 sm:grid-cols-[11rem_minmax(0,1fr)]"
    >
      <h2 id={headingId} className="font-display text-lg font-semibold leading-snug">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
