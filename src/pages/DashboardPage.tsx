import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/ui/PageHeader";
import { DashboardStats, MostViewedStats, useDashboard, usePopularityStats } from "@/features/dashboard";
import { usePageMeta } from "@/hooks/usePageMeta";

export function DashboardPage() {
  const { t } = useTranslation();
  const { stats, isLoading, error } = useDashboard();
  const popularity = usePopularityStats();
  usePageMeta(t("nav.dashboard"), t("meta.dashboard.description"));

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <PageHeader
          title={t("nav.dashboard")}
          description={t("dashboard.description")}
        />

        {isLoading && (
          <p className="px-0.5 py-2 text-sm italic text-muted-foreground">{t("common.loading")}</p>
        )}
        {error && (
          <p role="alert" className="border border-destructive p-4 text-sm text-destructive">
            {t("dashboard.loadError", { error })}
          </p>
        )}
        {!isLoading && !error && <DashboardStats stats={stats} />}

        <MostViewedStats
          topDays={popularity.topDays}
          topCountries={popularity.topCountries}
          isLoading={popularity.isLoading}
          error={popularity.error}
        />

        <div className="flex flex-wrap items-center justify-between gap-4 border border-border p-5">
          <div>
            <h2 className="font-display text-eyebrow uppercase text-muted-foreground">
              {t("dashboard.archiveTeaser.heading")}
            </h2>
            <p className="mt-1 max-w-prose text-sm text-muted-foreground">
              {t("dashboard.archiveTeaser.description")}
            </p>
          </div>
          <Link
            to="/archive"
            className="inline-flex min-h-11 shrink-0 items-center gap-1.5 border border-input px-4 text-sm font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t("dashboard.archiveTeaser.cta")}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
