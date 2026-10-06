import type { HistoryEntry, InsightSummary } from '../types';

// Where the hand-written content lives in the app. Slugs come from the backend, so they are
// escaped like any other value that goes into a URL.
export const PATHS_ROUTE = '/paths';

export function pathRoute(slug: string): string {
  return `${PATHS_ROUTE}/${encodeURIComponent(slug)}`;
}

export function insightRoute(slug: string): string {
  return `/insights/${encodeURIComponent(slug)}`;
}

// The map opens on an insight's place: `/?insight=sputnik-1` (see MapPage).
export function insightOnMapRoute(slug: string): string {
  return `/?${new URLSearchParams({ insight: slug })}`;
}

// A day's events carry no identifier, so an insight is matched to one by its year alone (the
// backend's own contract: the insights of a day are asked for next to the day, matched on
// `date.year`). Holidays have no year and never match.
export function findInsight(
  entry: Pick<HistoryEntry, 'year'>,
  insights: readonly InsightSummary[],
): InsightSummary | undefined {
  if (entry.year === undefined) return undefined;
  return insights.find((insight) => insight.date.year === entry.year);
}
