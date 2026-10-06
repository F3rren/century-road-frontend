import { useFetchOnce, useKeyedFetch } from '@/hooks/useFetchState';
import {
  buildInsightsPath,
  fetchInsight,
  fetchInsights,
  fetchPath,
  fetchPaths,
  fetchStartHere,
} from '../services/historyApi';
import type { InsightsDayParams } from '../types';

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
