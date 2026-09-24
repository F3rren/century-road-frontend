import type { ReactNode } from "react";

interface SettingsSectionProps {
  title: string;
  children: ReactNode;
}

// Shared bordered-block shape, matching the box styling ArchiveFilters' own
// filter panel and DashboardPage's archive-teaser box already use — no new
// visual language invented for Settings.
export function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <section className="space-y-3 border border-border p-5">
      <h2 className="font-display text-eyebrow uppercase text-muted-foreground">{title}</h2>
      {children}
    </section>
  );
}
