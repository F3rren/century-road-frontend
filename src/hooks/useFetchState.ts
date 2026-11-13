import { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import i18n from '@/i18n';
import { queryClient } from '@/lib/queryClient';
import { httpStatus, isTimeout } from '@/services/fetchErrors';

// Re-exported: callers have always imported it from here.
export { httpStatus };

export interface FetchState<D> {
  data: D | null;
  isLoading: boolean;
  error: string | null;
}

// What a reader needs from a failed request: what went wrong in plain words and
// what to do, never the browser's or the server's own text ("Failed to fetch",
// "HTTP 502: Bad Gateway"), which would also stay English in every language.
// ponytail: a TypeError is read as "no connection" - fetch() throws one when the
// server cannot be reached, but so would a bug in a fetcher; split them if a
// fetcher ever does more than parse a response.
export function describeFetchError(error: unknown): string {
  if (error instanceof TypeError) return i18n.t('errors.network');
  if (isTimeout(error)) return i18n.t('errors.timeout');
  const status = httpStatus(error);
  if (status === 404) return i18n.t('errors.notFound');
  if (status === 429) return i18n.t('errors.rateLimited');
  if (status !== undefined && status >= 500 && status < 600) return i18n.t('errors.server');
  return i18n.t('errors.unexpected');
}

// Which fetcher a cached answer came from. The key a caller passes is often just a language or a slug,
// and two hooks with the same one ask for different things, so the cache key also carries the identity
// of the owner of the question: the fetcher itself, which is a module-level function, never a closure
// made per render (a new one every time would be a new question every time).
let nextScope = 0;
const scopes = new WeakMap<object, number>();

function scopeOf(owner: object): number {
  let scope = scopes.get(owner);
  if (scope === undefined) {
    scope = nextScope++;
    scopes.set(owner, scope);
  }
  return scope;
}

function useScopedFetch<K, D>(
  owner: object,
  key: K,
  fetcher: (key: K, signal: AbortSignal) => Promise<D>,
): FetchState<D> & { key: K; retry: () => void } {
  const scope = scopeOf(owner);
  const queryKey = useMemo(() => ['fetch', scope, key] as const, [scope, key]);

  const query = useQuery(
    {
      queryKey,
      // TanStack hands over a signal and aborts it when nobody is looking at the query any more: the
      // fetcher passes it on to api.get, which cancels the request.
      queryFn: ({ signal }) => fetcher(key, signal),
    },
    queryClient,
  );

  // Asks again for the same key, and shows loading until the new answer lands: what a "Riprova"
  // button calls after an error. A reset, not a refetch: a refetch would keep the old error on screen.
  const retry = useCallback(() => {
    void queryClient.resetQueries({ queryKey });
  }, [queryKey]);

  return {
    key,
    isLoading: query.isPending,
    data: query.data ?? null,
    error: query.error ? describeFetchError(query.error) : null,
    retry,
  };
}

// The cached, deduplicated fetch behind every data hook. Two components asking the same thing - the
// same fetcher and the same key - share one request and one answer; an answer for a key that is no
// longer current can never be shown for the new one, because each key is its own query.
//
// The fetcher is handed an AbortSignal, aborted when the last component reading the query goes away: one
// that passes it on to api.get() cancels the request nobody is waiting for any more. `fetcher` must be
// a stable function (module-level, or a caller-memoized closure), as it is the question's identity.
export function useKeyedFetch<K, D>(
  key: K,
  fetcher: (key: K, signal: AbortSignal) => Promise<D>,
): FetchState<D> & { key: K; retry: () => void } {
  return useScopedFetch(fetcher, key, fetcher);
}

const ONCE_KEY = 0;

// For a fetch with no meaningful key — runs once per mount, like a plain [] effect.
export function useFetchOnce<D>(
  fetcher: (signal: AbortSignal) => Promise<D>,
): FetchState<D> & { retry: () => void } {
  const { data, isLoading, error, retry } = useScopedFetch(fetcher, ONCE_KEY, (_key, signal) => fetcher(signal));
  return { data, isLoading, error, retry };
}
