import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/ui/PageHeader";

interface LegalPageProps {
  title: string;
  description: string;
  children: ReactNode;
}

// The frame shared by the legal pages: a scrolling page with a readable column. Both
// pages are Italian-only content — the notice below is translated so a visitor in any
// other UI language is still told plainly, rather than left to infer it silently.
export function LegalPage({ title, description, children }: LegalPageProps) {
  const { t } = useTranslation();
  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-3xl space-y-8 pb-8">
        <PageHeader title={title} description={description} />
        <p className="text-sm text-muted-foreground">{t("legal.italianOnlyNotice")}</p>
        {children}
      </div>
    </div>
  );
}
