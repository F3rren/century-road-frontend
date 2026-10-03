import { useTranslation } from "react-i18next";
import { formatEventDate } from "@/lib/months";
import type { TodaySummary as Summary } from "../types";

interface TodaySummaryProps {
  summary: Summary;
  month: number;
  day: number;
}

// The day's numbers written as a sentence, not stat tiles: how many events,
// across what span, and how many the map can place. Countries follow a colon
// rather than "in <country>", which no language here inflects safely.
export function TodaySummary({ summary, month, day }: TodaySummaryProps) {
  const { t, i18n } = useTranslation();
  const year = (y: number | null) => (y === null ? "—" : y < 0 ? `${-y} ${t("date.era.bc")}` : String(y));
  const top = summary.topCountry;

  const placed =
    summary.placed === 0 || !top
      ? t("dashboard.summary.noneOnMap")
      : summary.countries === 1
        ? t("dashboard.summary.placedOneCountry", { count: summary.placed, top: top.name })
        : t("dashboard.summary.placed", {
            count: summary.placed,
            countries: summary.countries,
            top: top.name,
            topCount: top.count,
          });

  return (
    <p className="max-w-3xl font-display text-2xl leading-snug sm:text-[1.75rem] sm:leading-[1.35]">
      {t("dashboard.summary.lead", {
        count: summary.total,
        date: formatEventDate(day, month, undefined, i18n.language),
        first: year(summary.firstYear),
        last: year(summary.lastYear),
      })}{" "}
      {placed}
    </p>
  );
}
