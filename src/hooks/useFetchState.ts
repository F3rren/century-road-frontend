import { useEffect, useState } from 'react';
import i18n from '@/i18n';

export interface FetchState<D> {
  data: D | null;
  isLoading: boolean;
  error: string | null;
}

type Settled<K, D> =
  | { key: K; data: D; error: null }
  | { key: K; data: null; error: string };

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : i18n.t('common.unknownError');
}

// Shared fetch+race-guard engine, generalizing useOnThisDay's original settle-by-key
// logic: a fetch that resolves for a key that is no longer current is discarded
// (isStale), and even the latest-fired fetch's result is only trusted if it matches
// the render's current key — this avoids a stale-data flash when the key changes
// rapidly, without resetting state inside the effect (which would cost an extra render).
export function useKeyedFetch<K, D>(
  key: K,
  fetcher: (key: K) => Promise<D>,
): FetchState<D> & { key: K } {
  const [settled, setSettled] = useState<Settled<K, D> | null>(null);

  useEffect(() => {
    let isStale = false;

    fetcher(key)
      .then((data) => {
        if (!isStale) setSettled({ key, data, error: null });
      })
      .catch((error: unknown) => {
        if (!isStale) setSettled({ key, data: null, error: toMessage(error) });
      });

    return () => {
      isStale = true;
    };
    // `fetcher` is expected to be referentially stable for the lifetime of a given
    // key (a module-level function, or a caller-memoized closure) — only `key`
    // should retrigger the fetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const current = settled?.key === key ? settled : null;

  return {
    key,
    isLoading: current === null,
    data: current?.data ?? null,
    error: current?.error ?? null,
  };
}

const ONCE_KEY = 0;

// For a fetch with no meaningful key — runs once per mount, like a plain [] effect.
export function useFetchOnce<D>(fetcher: () => Promise<D>): FetchState<D> {
  const { data, isLoading, error } = useKeyedFetch(ONCE_KEY, fetcher);
  return { data, isLoading, error };
}
