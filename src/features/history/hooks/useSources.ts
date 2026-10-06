import { useFetchOnce } from '@/hooks/useFetchState';
import { fetchSources } from '../services/historyApi';

export function useSources() {
  return useFetchOnce(fetchSources);
}
