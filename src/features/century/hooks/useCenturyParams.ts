import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { parseCenturyParams, toCenturySearchParams, type CenturyParams } from '../lib/centuryParams';

// Country and years live in the URL, like the archive's filters: the link is the "save" -
// bookmark it or share it and the same timeline comes back.
export function useCenturyParams() {
  const [searchParams, setSearchParams] = useSearchParams();
  const params = useMemo(() => parseCenturyParams(searchParams), [searchParams]);

  const update = useCallback(
    (patch: Partial<CenturyParams>) => {
      setSearchParams(toCenturySearchParams({ ...params, ...patch }), { replace: true });
    },
    [params, setSearchParams],
  );

  return { params, update };
}
