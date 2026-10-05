import type { GeocodedEntry } from "@/features/map";
import type { CenturyGrains, TodaySummary } from "../types";

// Real facts about today's real history-API data, not placeholder business
// metrics (PRODUCT.md, Product Principle 4). Countries come from the same
// coordinate-based guess the map's heatmap uses (features/map/lib/geocodeEntries):
// an event with no linked article that carries coordinates has no country.

export function summarizeToday(events: readonly GeocodedEntry[]): TodaySummary | null {
  if (events.length === 0) return null;

  const years = events.map(({ entry }) => entry.year).filter((year): year is number => year !== undefined);
  const counts = new Map<string, { name: string; count: number }>();
  for (const { country } of events) {
    if (!country) continue;
    counts.set(country.code, { name: country.name, count: (counts.get(country.code)?.count ?? 0) + 1 });
  }
  const top = [...counts.values()].sort((a, b) => b.count - a.count)[0];

  return {
    total: events.length,
    firstYear: years.length ? Math.min(...years) : null,
    lastYear: years.length ? Math.max(...years) : null,
    placed: [...counts.values()].reduce((sum, c) => sum + c.count, 0),
    countries: counts.size,
    topCountry: top ?? null,
  };
}

// Today's events with a year, one column per century that has any, oldest
// first. A century starts on a multiple of 100: 1900 holds 1900-1999, and -100
// holds 100-1 BC (Math.floor rounds -44 down to -100, not up to 0).
export function groupByCentury(events: readonly GeocodedEntry[]): CenturyGrains[] {
  const columns = new Map<number, number>();
  for (const { entry } of events) {
    if (entry.year === undefined) continue;
    const start = Math.floor(entry.year / 100) * 100;
    columns.set(start, (columns.get(start) ?? 0) + 1);
  }
  return [...columns.entries()].sort(([a], [b]) => a - b).map(([start, count]) => ({ start, count }));
}
