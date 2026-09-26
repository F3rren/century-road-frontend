import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatEventDate } from "@/lib/months";
import { localizedCountryName } from "@/features/map";
import type { CountryViewStat, DayViewStat } from "@/features/history";

interface MostViewedStatsProps {
  topDays: DayViewStat[];
  topCountries: CountryViewStat[];
  isLoading: boolean;
  error: string | null;
}

interface RankedListProps {
  label: string;
  rows: { id: string; name: string; viewCount: number }[];
  emptyText: string;
}

function RankedList({ label, rows, emptyText }: RankedListProps) {
  const { t } = useTranslation();

  return (
    <div>
      <p className="font-display text-eyebrow uppercase text-muted-foreground">{label}</p>
      {rows.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        <ol className="mt-2 divide-y divide-border border-t border-border">
          {rows.map((row, index) => (
            <li key={row.id} className="flex items-baseline justify-between gap-3 py-2">
              <span className="flex items-baseline gap-3 truncate">
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="truncate text-sm font-medium">{row.name}</span>
              </span>
              <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                {t("dashboard.popularity.views", { count: row.viewCount })}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

// Site-wide, all-time view counts (usePopularityStats) - a different question from
// DashboardStats above it, which is about today's events only. Silently shows nothing
// (rather than an error banner) when the request fails: this is a secondary, non-essential
// panel, and the rest of the dashboard still works without it.
export function MostViewedStats({ topDays, topCountries, isLoading, error }: MostViewedStatsProps) {
  const { t, i18n } = useTranslation();
  if (isLoading || error) return null;
  if (topDays.length === 0 && topCountries.length === 0) return null;

  const dayRows = topDays.map((stat) => ({
    id: `${stat.month}-${stat.day}`,
    name: formatEventDate(stat.day, stat.month, undefined, i18n.language),
    viewCount: stat.viewCount,
  }));
  const countryRows = topCountries.map((stat) => ({
    id: stat.countryCode,
    name: localizedCountryName(stat.countryCode, stat.countryCode, i18n.language),
    viewCount: stat.viewCount,
  }));

  return (
    <div className="border border-border p-5">
      <h2 className="font-display text-eyebrow uppercase text-muted-foreground">
        {t("dashboard.popularity.heading")}
      </h2>
      <p className="mt-1 max-w-prose text-sm text-muted-foreground">
        {t("dashboard.popularity.description")}
      </p>
      <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <RankedList
          label={t("dashboard.popularity.days.label")}
          rows={dayRows}
          emptyText={t("dashboard.popularity.noData")}
        />
        <RankedList
          label={t("dashboard.popularity.countries.label")}
          rows={countryRows}
          emptyText={t("dashboard.popularity.noData")}
        />
      </div>
      <div className="mt-5 border-t border-border pt-4">
        <Link
          to="/"
          className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {t("dashboard.popularity.cta")}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
