import { useCallback, useEffect, useState } from 'react';
import i18n from '@/i18n';

export interface FetchState<D> {
  data: D | null;
  isLoading: boolean;
  error: string | null;
}

// `attempt` ties a result to the try that produced it, so a retry shows as loading
// again instead of keeping the previous error on screen until the new answer lands.
type Settled<K, D> =
  | { key: K; attempt: number; data: D; error: null }
  | { key: K; attempt: number; data: null; error: string };

// What a reader needs from a failed request: what went wrong in plain words and
// what to do, never the browser's or the server's own text ("Failed to fetch",
// "HTTP 502: Bad Gateway"), which would also stay English in every language.
// ponytail: a TypeError is read as "no connection" - fetch() throws one when the
// server cannot be reached, but so would a bug in a fetcher; split them if a
// fetcher ever does more than parse a response.
export function describeFetchError(error: unknown): string {
  if (error instanceof TypeError) return i18n.t('errors.network');
  const status = error instanceof Error ? /^HTTP (\d{3})/.exec(error.message)?.[1] : undefined;
  if (status?.startsWith('5')) return i18n.t('errors.server');
  return i18n.t('errors.unexpected');
}

// Shared fetch+race-guard engine, generalizing useOnThisDay's original settle-by-key
// logic: a fetch that resolves for a key that is no longer current is discarded
// (isStale), and even the latest-fired fetch's result is only trusted if it matches
// the render's current key — this avoids a stale-data flash when the key changes
// rapidly, without resetting state inside the effect (which would cost an extra render).
export function useKeyedFetch<K, D>(
  key: K,
  fetcher: (key: K) => Promise<D>,
): FetchState<D> & { key: K; retry: () => void } {
  const [settled, setSettled] = useState<Settled<K, D> | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let isStale = false;

    fetcher(key)
      .then((data) => {
        if (!isStale) setSettled({ key, attempt, data, error: null });
      })
      .catch((error: unknown) => {
        if (!isStale) setSettled({ key, attempt, data: null, error: describeFetchError(error) });
      });

    return () => {
      isStale = true;
    };
    // `fetcher` is expected to be referentially stable for the lifetime of a given
    // key (a module-level function, or a caller-memoized closure) — only `key`, or
    // an explicit retry, should retrigger the fetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, attempt]);

  const current = settled?.key === key && settled.attempt === attempt ? settled : null;
  // Asks again for the same key: what a "Riprova" button calls after an error.
  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return {
    key,
    isLoading: current === null,
    data: current?.data ?? null,
    error: current?.error ?? null,
    retry,
  };
}

const ONCE_KEY = 0;

// For a fetch with no meaningful key — runs once per mount, like a plain [] effect.
export function useFetchOnce<D>(fetcher: () => Promise<D>): FetchState<D> & { retry: () => void } {
  const { data, isLoading, error, retry } = useKeyedFetch(ONCE_KEY, fetcher);
  return { data, isLoading, error, retry };
}
