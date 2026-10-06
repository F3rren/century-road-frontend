import { useCallback } from 'react';
import { useFetchOnce, useKeyedFetch } from '@/hooks/useFetchState';
import {
  buildInsightsPath,
  fetchInsight,
  fetchInsights,
  fetchPath,
  fetchPaths,
  fetchStartHere,
} from '../services/historyApi';
import { findInsight } from '../lib/editorial';
import type { HistoryEntry, InsightDetail, InsightsDayParams, InsightSummary } from '../types';

// The hand-written content (paths, "Perché conta"). It answers from the backend's memory, never
// from Wikipedia, so these hooks keep working when the day feed does not.

export function useStartHere() {
  return useFetchOnce(fetchStartHere);
}

export function usePaths() {
  return useFetchOnce(fetchPaths);
}

export function usePath(slug: string) {
  const { data, error, isLoading, retry } = useKeyedFetch(slug, fetchPath);
  return { slug, isLoading, data, error, retry };
}

// Without a day, every insight; with one, only that day's.
export function useInsights(day?: InsightsDayParams) {
  const path = buildInsightsPath(day);
  const { data, error, isLoading, retry } = useKeyedFetch(path, fetchInsights);
  return { path, isLoading, data, error, retry };
}

export function useInsight(slug: string) {
  const { data, error, isLoading, retry } = useKeyedFetch(slug, fetchInsight);
  return { slug, isLoading, data, error, retry };
}

const fetchInsightIfAny = (slug: string | null): Promise<InsightDetail | null> =>
  slug === null ? Promise.resolve(null) : fetchInsight(slug);

// For a page where the insight is optional (the map, when a link names one): with no slug there
// is nothing to ask for, and data stays null once settled.
export function useOptionalInsight(slug: string | null) {
  const { data, error, isLoading } = useKeyedFetch(slug, fetchInsightIfAny);
  return { isLoading, data, error };
}

const fetchDayInsights = (path: string | null): Promise<InsightSummary[]> =>
  path === null ? Promise.resolve([]) : fetchInsights(path);

// "Approfondimento disponibile": asks for a day's insights next to the day's own events and
// answers, for any event, which insight (if any) it has. A failure just means no event is marked:
// the marker is an extra, never a reason to show an error over the events themselves.
export function useInsightFinder(day: InsightsDayParams | null): (entry: HistoryEntry) => InsightSummary | undefined {
  const { data } = useKeyedFetch(day ? buildInsightsPath(day) : null, fetchDayInsights);
  return useCallback((entry: HistoryEntry) => findInsight(entry, data ?? []), [data]);
}
