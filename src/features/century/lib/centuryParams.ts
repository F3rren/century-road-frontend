export interface CenturyParams {
  // ISO 3166-1 alpha-2, as the backend stores it; null until one is picked.
  country: string | null;
  // null = no limit on that side.
  fromYear: number | null;
  toYear: number | null;
}

export const DEFAULT_FROM_YEAR = 1901;
export const DEFAULT_TO_YEAR = 2000;

const COUNTRY_CODE = /^[A-Z]{2}$/;

// Missing means the default century; present but empty ("from=") means no limit; anything
// malformed falls back to the default rather than erroring, like the archive's own params.
function parseYear(raw: string | null, fallback: number): number | null {
  if (raw === null) return fallback;
  if (raw === '') return null;
  const value = Number(raw);
  return Number.isInteger(value) ? value : fallback;
}

export function parseCenturyParams(params: URLSearchParams): CenturyParams {
  const country = params.get('country');
  return {
    country: country !== null && COUNTRY_CODE.test(country) ? country : null,
    fromYear: parseYear(params.get('from'), DEFAULT_FROM_YEAR),
    toYear: parseYear(params.get('to'), DEFAULT_TO_YEAR),
  };
}

// from/to are always written, empty for "no limit", so "every year" survives a reload or a
// shared link instead of snapping back to the default century.
export function toCenturySearchParams({ country, fromYear, toYear }: CenturyParams): URLSearchParams {
  const params = new URLSearchParams();
  if (country !== null) params.set('country', country);
  params.set('from', fromYear === null ? '' : String(fromYear));
  params.set('to', toYear === null ? '' : String(toYear));
  return params;
}
