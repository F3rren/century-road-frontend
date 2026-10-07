import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { parsePathFilters, toPathSearchParams, type PathFilters } from '../lib/pathFilters';

// The topic and the search words live in the URL, like the Archive's and Il mio secolo's filters:
// the link is the "save", and Back returns to the same narrowed list.
export function usePathFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => parsePathFilters(searchParams), [searchParams]);

  const update = useCallback(
    (patch: Partial<PathFilters>) => {
      setSearchParams(toPathSearchParams({ ...filters, ...patch }), { replace: true });
    },
    [filters, setSearchParams],
  );

  return { filters, update };
}
