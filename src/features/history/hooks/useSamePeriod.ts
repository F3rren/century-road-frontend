import { useKeyedFetch } from '@/hooks/useFetchState';
import { buildSamePeriodPath, fetchSamePeriod } from '../services/historyApi';
import type { SamePeriodData, SamePeriodParams } from '../types';

const fetchSamePeriodIfAny = (path: string | null): Promise<SamePeriodData | null> =>
  path === null ? Promise.resolve(null) : fetchSamePeriod(path);

// With `null` there is nothing to ask for (a year field that is empty or not a year yet) and
// `data` stays null once settled.
export function useSamePeriod(params: SamePeriodParams | null) {
  const path = params ? buildSamePeriodPath(params) : null;
  const { data, error, isLoading, retry } = useKeyedFetch(path, fetchSamePeriodIfAny);
  return { path, isLoading, data, error, retry };
}
