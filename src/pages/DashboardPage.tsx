import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/ui/PageHeader";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { CenturyChart, MostViewedStats, TodaySummary, useDashboard, usePopularityStats } from "@/features/dashboard";
import { usePageMeta } from "@/hooks/usePageMeta";

export function DashboardPage() {
  const { t } = useTranslation();
  const { today, language, summary, centuries, isLoading, error } = useDashboard();
  const popularity = usePopularityStats();
  usePageMeta(t("nav.dashboard"), t("meta.dashboard.description"));

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-5xl space-y-10 pb-8">
        <PageHeader title={t("nav.dashboard")} description={t("dashboard.description")} />

        {isLoading && <p className="px-0.5 py-2 text-sm text-muted-foreground">{t("common.loading")}</p>}
        {error && <Alert>{t("dashboard.loadError", { error })}</Alert>}
        {!isLoading && !error && !summary && (
          <EmptyState
            variant="dashed"
            title={t("dashboard.empty.title")}
            description={t("dashboard.empty.description")}
          />
        )}
        {summary && (
          <>
            <TodaySummary summary={summary} month={today.month} day={today.day} />
            {centuries.length > 0 && (
              <CenturyChart centuries={centuries} month={today.month} day={today.day} language={language} />
            )}
          </>
        )}

        <MostViewedStats
          topDays={popularity.topDays}
          topCountries={popularity.topCountries}
          isLoading={popularity.isLoading}
          error={popularity.error}
        />
      </div>
    </div>
  );
}
