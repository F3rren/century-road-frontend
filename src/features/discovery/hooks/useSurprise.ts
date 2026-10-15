import { useCallback, useState } from 'react';
import {
  buildRandomEventPath,
  fetchRandomEvent,
  type HistoryLanguage,
  type RandomEventData,
} from '@/features/history';
import { describeFetchError } from '@/hooks/useFetchState';

export interface SurpriseFilters {
  lang: HistoryLanguage;
  // Only events placed in this country.
  country?: string | null;
  // Inclusive; null or absent = no limit on that side.
  fromYear?: number | null;
  toYear?: number | null;
}

export type SurpriseOutcome =
  | { kind: 'idle' }
  | { kind: 'loading' }
  // Nothing matches the filters: a 200 with no event, not an error.
  | { kind: 'none' }
  | { kind: 'error'; message: string }
  | { kind: 'found'; data: RandomEventData & { event: NonNullable<RandomEventData['event']> } };

// "Sorprendimi": one event picked at random from the country index, among those that match the
// filters in force where it is asked. An answer belongs to the filters it was drawn with: when
// they change (another country, other years), it is forgotten instead of passing for an answer
// to the new ones.
export function useSurprise({ lang, country, fromYear, toYear }: SurpriseFilters) {
  const path = buildRandomEventPath({
    lang,
    country: country ?? undefined,
    fromYear: fromYear ?? undefined,
    toYear: toYear ?? undefined,
  });
  const [drawn, setDrawn] = useState<{ path: string; outcome: SurpriseOutcome }>({ path, outcome: { kind: 'idle' } });
  const outcome: SurpriseOutcome = drawn.path === path ? drawn.outcome : { kind: 'idle' };

  const draw = useCallback(async () => {
    setDrawn({ path, outcome: { kind: 'loading' } });
    try {
      const data = await fetchRandomEvent(path);
      setDrawn({ path, outcome: data.event ? { kind: 'found', data: { ...data, event: data.event } } : { kind: 'none' } });
    } catch (error) {
      setDrawn({ path, outcome: { kind: 'error', message: describeFetchError(error) } });
    }
  }, [path]);

  return { outcome, draw };
}
