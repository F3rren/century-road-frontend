import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ReadingPage } from "@/components/layout/ReadingPage";

interface LegalPageProps {
  title: string;
  description: string;
  children: ReactNode;
}

// The frame shared by the legal pages: the reading layout with its contents list.
// Both pages are Italian-only content - the notice below is translated so a visitor
// in any other UI language is still told plainly, rather than left to infer it.
export function LegalPage({ title, description, children }: LegalPageProps) {
  const { t } = useTranslation();
  return (
    <ReadingPage title={title} description={description}>
      <p className="text-sm text-muted-foreground">{t("legal.italianOnlyNotice")}</p>
      {children}
    </ReadingPage>
  );
}
