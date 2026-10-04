import { useKeyedFetch } from '@/hooks/useFetchState';
import { buildOnThisDayPath, fetchOnThisDay } from '../services/historyApi';
import type { OnThisDayParams } from '../types';

export function useOnThisDay(params: OnThisDayParams) {
  const path = buildOnThisDayPath(params);
  const { data, error, isLoading, retry } = useKeyedFetch(path, fetchOnThisDay);
  return { path, isLoading, data, error, retry };
}
