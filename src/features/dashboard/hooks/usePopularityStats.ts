import { useEffect, useState } from 'react';
import i18n from '@/i18n';
import { fetchTopCountries, fetchTopDays } from '@/features/history';
import type { CountryViewStat, DayViewStat } from '@/features/history';

// How many rows each ranked list shows — a top-N, not the full table.
const LIMIT = 5;

interface PopularityState {
  topDays: DayViewStat[];
  topCountries: CountryViewStat[];
  isLoading: boolean;
  error: string | null;
}

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : i18n.t('common.unknownError');
}

// Site-wide, all-time view counts — a different question from useDashboard's "facts about
// today's events": this is "what has everyone been looking at", not "what happened today".
// Both requests run together since neither depends on the other.
export function usePopularityStats() {
  const [state, setState] = useState<PopularityState>({
    topDays: [],
    topCountries: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let isStale = false;

    Promise.all([fetchTopDays(LIMIT), fetchTopCountries(LIMIT)])
      .then(([topDays, topCountries]) => {
        if (!isStale) setState({ topDays, topCountries, isLoading: false, error: null });
      })
      .catch((error: unknown) => {
        if (!isStale) setState({ topDays: [], topCountries: [], isLoading: false, error: toMessage(error) });
      });

    return () => {
      isStale = true;
    };
  }, []);

  return state;
}
