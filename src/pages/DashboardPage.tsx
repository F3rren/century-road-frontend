import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
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
        {error && <Alert>{t("dashboard.loadError", { error })}</Alert>}
        {!isLoading && !error && <DashboardStats stats={stats} />}

        <MostViewedStats
          topDays={popularity.topDays}
          topCountries={popularity.topCountries}
          isLoading={popularity.isLoading}
          error={popularity.error}
        />

        <Card className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-eyebrow uppercase text-muted-foreground">
              {t("dashboard.archiveTeaser.heading")}
            </h2>
            <p className="mt-1 max-w-prose text-sm text-muted-foreground">
              {t("dashboard.archiveTeaser.description")}
            </p>
          </div>
          <Button asChild variant="outline" className="shrink-0">
            <Link to="/archive">
              {t("dashboard.archiveTeaser.cta")}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </Card>
      </div>
    </div>
  );
}
