import { QueryClient } from '@tanstack/react-query';

// The one cache every fetch hook reads through (see useFetchState). Held at module level, not
// created inside a component, so the hooks do not need a provider to find it: a component test
// that renders one works as before, and src/test/setup.ts empties this between tests.
//
// - staleTime matches what the backend itself allows a copy to live (Cache-Control max-age=300):
//   going back to a page within five minutes shows what it showed, without asking again.
//   "Riprova" (retry) ignores it and asks.
// - No retries here: api.ts already asks a GET once more, for the failures worth it, and a
//   second layer of retries would multiply the waiting (2 x 2 attempts x the timeout).
// - No refetch on focus or reconnect: nothing here changes while the tab is in the background,
//   and the hooks never did.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60_000,
      gcTime: 10 * 60_000,
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});
