import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { usePageMeta } from "@/hooks/usePageMeta";

export function NotFoundPage() {
  const { t } = useTranslation();
  usePageMeta(t("notFound.title"), t("meta.notFound.description"));

  return (
    <div className="h-full flex flex-col items-center justify-center gap-4">
      <h1 className="font-display text-6xl font-semibold text-muted-foreground">404</h1>
      <p className="text-lg text-muted-foreground">{t("notFound.title")}</p>
      <Link to="/" className="text-primary hover:underline text-sm">
        {t("notFound.backToMap")}
      </Link>
    </div>
  );
}
