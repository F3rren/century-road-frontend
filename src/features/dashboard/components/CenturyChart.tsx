import { useTranslation } from "react-i18next";
import { GrainChart } from "@/components/ui/GrainChart";
import { centuryRange } from "@/lib/months";
import type { CenturyGrains } from "../types";

interface CenturyChartProps {
  centuries: CenturyGrains[];
  month: number;
  day: number;
  // The edition the events came from, so the archive opens on the same text.
  language?: string;
}

// Today's events as grains, piled in the column of their century: where the
// day's history sits, at a glance. Only centuries with events get a column (a day
// can reach from 2333 BC to now). Each column opens the archive on today,
// narrowed to that century.
export function CenturyChart({ centuries, month, day, language }: CenturyChartProps) {
  const { t, i18n } = useTranslation();
  const bc = t("date.era.bc");

  const columns = centuries.map((century, i) => ({
    key: century.start,
    count: century.count,
    gapBefore: i > 0 && century.start - centuries[i - 1].start > 100,
    ariaLabel: t("dashboard.centuries.column", { count: century.count, range: centuryRange(century.start, i18n.language) }),
    href: `/archive?${new URLSearchParams({
      month: String(month),
      day: String(day),
      from: String(century.start),
      to: String(century.start + 99),
      types: "events",
      ...(language ? { lang: language } : {}),
    })}`,
    label: (
      <>
        {Math.abs(century.start)}
        {century.start < 0 && <span className="block">{bc}</span>}
      </>
    ),
  }));

  return (
    <section aria-labelledby="century-chart-title">
      <h2 id="century-chart-title" className="font-display text-xl font-semibold">
        {t("dashboard.centuries.title")}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{t("dashboard.centuries.hint")}</p>
      <GrainChart columns={columns} className="mt-5" />
    </section>
  );
}
