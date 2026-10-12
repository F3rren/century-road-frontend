import { formatEventDate, formatYear, monthNames } from '@/lib/months';
import type { EditorialDate, HistoryEntry, InsightSummary } from '../types';

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

// An insight's date as exactly as it is known and no more: "133 a.C." when only the year is,
// "settembre 52 a.C." with the month, the whole day when the backend says so or says nothing (an
// older one). The month and day of a coarser date are placeholders the backend sorts by: showing
// them would invent a "1 gennaio 133 a.C.", so a precision this does not know, or a month that is
// not one, falls back to the year alone.
export function formatEditorialDate(date: EditorialDate, language: string): string {
  if (date.precision === undefined || date.precision === 'DAY') {
    return formatEventDate(date.day, date.month, date.year, language);
  }
  const month = date.precision === 'MONTH' ? monthNames(language)[date.month] : undefined;
  return month ? `${month} ${formatYear(date.year, language)}` : formatYear(date.year, language);
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
