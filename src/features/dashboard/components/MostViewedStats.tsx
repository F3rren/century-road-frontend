import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/Alert";
import type { CountryViewStat, DayViewStat } from "@/features/history";
import { countryRows, dayRows } from "../lib/popularityRows";
import { RankedList } from "./RankedList";

interface MostViewedStatsProps {
  topDays: DayViewStat[];
  topCountries: CountryViewStat[];
  isLoading: boolean;
  error: string | null;
}

// Site-wide, all-time view counts (usePopularityStats) - a different question from
// DashboardStats above it, which is about today's events only. A secondary,
// non-essential panel: a loading pass renders nothing extra, but a failure still needs
// to say so — the rest of the dashboard still works without it, but silence isn't the
// same as "nothing to report".
export function MostViewedStats({ topDays, topCountries, isLoading, error }: MostViewedStatsProps) {
  const { t, i18n } = useTranslation();
  if (isLoading) return null;
  if (error) return <Alert variant="inline">{t("dashboard.popularity.loadError", { error })}</Alert>;
  if (topDays.length === 0 && topCountries.length === 0) return null;

  // A section with a rule above, like the chart before it: no box of its own.
  return (
    <section aria-labelledby="most-viewed-title" className="border-t border-border pt-8">
      <h2 id="most-viewed-title" className="font-display text-xl font-semibold">
        {t("dashboard.popularity.heading")}
      </h2>
      <p className="mt-1 max-w-prose text-sm text-muted-foreground">
        {t("dashboard.popularity.description")}
      </p>
      <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <RankedList
          label={t("dashboard.popularity.days.label")}
          rows={dayRows(topDays, i18n.language)}
          emptyText={t("dashboard.popularity.noData")}
        />
        <RankedList
          label={t("dashboard.popularity.countries.label")}
          rows={countryRows(topCountries, i18n.language)}
          emptyText={t("dashboard.popularity.noData")}
        />
      </div>
      <div className="mt-5 flex flex-wrap gap-x-6 border-t border-border pt-4">
        <Button asChild variant="link" className="px-0">
          <Link to="/popular">{t("popular.seeAll")}</Link>
        </Button>
        <Button asChild variant="link" className="px-0">
          <Link to="/">{t("dashboard.popularity.cta")}</Link>
        </Button>
      </div>
    </section>
  );
}
