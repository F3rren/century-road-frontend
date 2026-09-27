import { useTranslation } from "react-i18next";

// Shown while a lazy-loaded route's chunk is still downloading - see
// src/router/index.tsx. On a warm cache this never appears; it exists for
// the first request for a given route after a deploy. Deliberately just
// text, matching the design system's no-spinner, no-shadow register - the
// same treatment DashboardPage already uses for its own loading state.
export function RouteFallback() {
  const { t } = useTranslation();
  return (
    <div className="flex h-full items-center justify-center">
      <p className="text-sm italic text-muted-foreground">{t("common.loading")}</p>
    </div>
  );
}
