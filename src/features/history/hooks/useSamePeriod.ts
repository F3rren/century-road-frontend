import { useKeyedFetch } from '@/hooks/useFetchState';
import { buildSamePeriodPath, fetchSamePeriod } from '../services/historyApi';
import type { SamePeriodParams } from '../types';

export function useSamePeriod(params: SamePeriodParams) {
  const path = buildSamePeriodPath(params);
  const { data, error, isLoading, retry } = useKeyedFetch(path, fetchSamePeriod);
  return { path, isLoading, data, error, retry };
}
