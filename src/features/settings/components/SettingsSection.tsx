import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";

interface SettingsSectionProps {
  title: string;
  children: ReactNode;
}

export function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <section aria-label={title}>
      <Card className="space-y-3">
        <h2 className="font-display text-eyebrow uppercase text-muted-foreground">{title}</h2>
        {children}
      </Card>
    </section>
  );
}
