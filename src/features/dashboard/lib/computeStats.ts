import type { TFunction } from "i18next";
import type { GeocodedEntry } from "@/features/map";
import type { StatCard } from "../types";

// Real facts about today's real history-API data, not placeholder business
// metrics — confirmed direction (PRODUCT.md, Product Principle 4). "Paesi
// individuati"/"Paese più citato" come from the same coordinate-based
// heuristic the map's heatmap uses (see features/map/lib/geocodeEntries) —
// an event with no linked article that carries coordinates isn't counted
// toward either.
export function computeStats(geocodedEvents: readonly GeocodedEntry[], t: TFunction): StatCard[] {
  if (geocodedEvents.length === 0) return [];

  const years = geocodedEvents
    .map(({ entry }) => entry.year)
    .filter((year): year is number => year !== undefined);
  const hasYears = years.length > 0;
  const minYear = hasYears ? Math.min(...years) : undefined;
  const maxYear = hasYears ? Math.max(...years) : undefined;

  const countryCounts = new Map<string, { name: string; count: number }>();
  for (const { country } of geocodedEvents) {
    if (!country) continue;
    const existing = countryCounts.get(country.code);
    countryCounts.set(country.code, { name: country.name, count: (existing?.count ?? 0) + 1 });
  }
  const geocodedCount = [...countryCounts.values()].reduce((sum, c) => sum + c.count, 0);
  const topCountry = [...countryCounts.values()].sort((a, b) => b.count - a.count)[0];

  return [
    { id: "events", label: t("dashboard.stats.events.label"), value: String(geocodedEvents.length) },
    {
      id: "countries",
      label: t("dashboard.stats.countries.label"),
      value: String(countryCounts.size),
      detail: t("dashboard.stats.countries.detail", { geocoded: geocodedCount, total: geocodedEvents.length }),
    },
    {
      id: "span",
      label: t("dashboard.stats.span.label"),
      value: hasYears ? `${minYear}–${maxYear}` : "—",
    },
    {
      id: "top-country",
      label: t("dashboard.stats.topCountry.label"),
      value: topCountry?.name ?? "—",
      detail: topCountry
        ? t("dashboard.stats.topCountry.detail", { count: topCountry.count })
        : undefined,
    },
  ];
}
