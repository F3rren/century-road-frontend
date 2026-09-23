import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { daysInMonth } from '@/lib/months';
import { parseFilters, toSearchParams } from '../lib/filterParams';
import type { ArchiveFilters } from '../types';

// Filters live in the URL (via react-router's own search params), not in
// useState: the page stays bookmarkable and shareable, and back/forward
// step through filter changes the way they do everywhere else on the web.
export function useArchiveFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);

  const update = useCallback(
    (patch: Partial<ArchiveFilters>) => {
      const next: ArchiveFilters = { ...filters, ...patch };
      // A shorter month can't keep an out-of-range day (there is no 31 April).
      next.day = Math.min(next.day, daysInMonth(next.month));
      // replace, not push: every keystroke in a filter shouldn't add a
      // separate back-button stop.
      setSearchParams(toSearchParams(next), { replace: true });
    },
    [filters, setSearchParams],
  );

  const reset = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  return { filters, update, reset };
}
