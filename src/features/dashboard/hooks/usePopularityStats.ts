import { useKeyedFetch } from '@/hooks/useFetchState';
import { fetchTopCountries, fetchTopDays } from '@/features/history';
import type { CountryViewStat, DayViewStat } from '@/features/history';

// How many rows each ranked list shows on the dashboard — a top-N, not the full table.
export const DASHBOARD_LIMIT = 5;
// What the backend allows at most, which the page of the full rankings asks for.
export const FULL_LIMIT = 50;

interface Popularity {
  topDays: DayViewStat[];
  topCountries: CountryViewStat[];
}

function fetchPopularity(limit: number, signal: AbortSignal): Promise<Popularity> {
  return Promise.all([fetchTopDays(limit, signal), fetchTopCountries(limit, signal)]).then(
    ([topDays, topCountries]) => ({ topDays, topCountries }),
  );
}

// Site-wide, all-time view counts — a different question from useDashboard's "facts about
// today's events": this is "what has everyone been looking at", not "what happened today".
// Both requests run together since neither depends on the other.
export function usePopularityStats(limit: number = DASHBOARD_LIMIT) {
  const { data, isLoading, error, retry } = useKeyedFetch(limit, fetchPopularity);
  return {
    topDays: data?.topDays ?? [],
    topCountries: data?.topCountries ?? [],
    isLoading,
    error,
    retry,
  };
}
