import { describe, expect, it } from 'vitest';
import { DEFAULT_FROM_YEAR, DEFAULT_TO_YEAR, parseCenturyParams, toCenturySearchParams } from './centuryParams';

describe('parseCenturyParams', () => {
  it('defaults to no country and the twentieth century', () => {
    expect(parseCenturyParams(new URLSearchParams())).toEqual({
      country: null,
      fromYear: DEFAULT_FROM_YEAR,
      toYear: DEFAULT_TO_YEAR,
    });
  });

  it('reads a country and a year range, negative years included', () => {
    expect(parseCenturyParams(new URLSearchParams('country=IT&from=-44&to=1500'))).toEqual({
      country: 'IT',
      fromYear: -44,
      toYear: 1500,
    });
  });

  it('treats an empty year as no limit, not as the default', () => {
    expect(parseCenturyParams(new URLSearchParams('country=IT&from=&to='))).toEqual({
      country: 'IT',
      fromYear: null,
      toYear: null,
    });
  });

  it('falls back to the defaults for anything malformed', () => {
    expect(parseCenturyParams(new URLSearchParams('country=it&from=abc&to=19.5'))).toEqual({
      country: null,
      fromYear: DEFAULT_FROM_YEAR,
      toYear: DEFAULT_TO_YEAR,
    });
    expect(parseCenturyParams(new URLSearchParams('country=ITA')).country).toBeNull();
  });
});

describe('toCenturySearchParams', () => {
  it('always writes both years, empty for no limit, so every year survives a reload', () => {
    const params = toCenturySearchParams({ country: 'FR', fromYear: null, toYear: 1945 });
    expect(params.toString()).toBe('country=FR&from=&to=1945');
    expect(parseCenturyParams(params)).toEqual({ country: 'FR', fromYear: null, toYear: 1945 });
  });

  it('leaves the country out until one is picked', () => {
    expect(toCenturySearchParams({ country: null, fromYear: 1901, toYear: 2000 }).toString()).toBe(
      'from=1901&to=2000',
    );
  });
});
