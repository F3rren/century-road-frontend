import { useFetchOnce } from '@/hooks/useFetchState';
import { fetchTopCountries, fetchTopDays } from '@/features/history';
import type { CountryViewStat, DayViewStat } from '@/features/history';

// How many rows each ranked list shows — a top-N, not the full table.
const LIMIT = 5;

interface Popularity {
  topDays: DayViewStat[];
  topCountries: CountryViewStat[];
}

function fetchPopularity(): Promise<Popularity> {
  return Promise.all([fetchTopDays(LIMIT), fetchTopCountries(LIMIT)]).then(
    ([topDays, topCountries]) => ({ topDays, topCountries }),
  );
}

// Site-wide, all-time view counts — a different question from useDashboard's "facts about
// today's events": this is "what has everyone been looking at", not "what happened today".
// Both requests run together since neither depends on the other.
export function usePopularityStats() {
  const { data, isLoading, error } = useFetchOnce(fetchPopularity);
  return {
    topDays: data?.topDays ?? [],
    topCountries: data?.topCountries ?? [],
    isLoading,
    error,
  };
}
