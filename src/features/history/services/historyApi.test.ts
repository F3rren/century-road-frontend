import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/services/api';
import {
  buildInsightsPath,
  buildRandomEventPath,
  buildSamePeriodPath,
  fetchInsight,
  fetchInsights,
  fetchPath,
  fetchPaths,
  fetchRandomEvent,
  fetchSamePeriod,
  fetchSources,
  fetchStartHere,
  submitErrorReport,
} from './historyApi';

vi.mock('@/services/api', () => ({ api: { get: vi.fn(), post: vi.fn() } }));

const get = vi.mocked(api.get);
const post = vi.mocked(api.post);

const ok = (data: unknown) => ({ success: true, data });
const failed = (message: string) => ({ success: false, message });

beforeEach(() => {
  get.mockReset();
  post.mockReset();
});

describe('path builders', () => {
  it('asks for every insight, or for one day of the year', () => {
    expect(buildInsightsPath()).toBe('/history/insights');
    expect(buildInsightsPath({ month: 10, day: 4 })).toBe('/history/insights?month=10&day=4');
  });

  it('adds only the random-event filters that are set, and keeps year 0-adjacent values', () => {
    expect(buildRandomEventPath({ lang: 'it' })).toBe('/history/random?lang=it');
    expect(buildRandomEventPath({ lang: 'en', country: 'IT', fromYear: -500, toYear: 0 })).toBe(
      '/history/random?lang=en&country=IT&fromYear=-500&toYear=0',
    );
  });

  it('adds only the same-period options that are set, and keeps a span of 0', () => {
    expect(buildSamePeriodPath({ year: 1969, lang: 'it' })).toBe('/history/same-period?year=1969&lang=it');
    expect(
      buildSamePeriodPath({ year: 1969, lang: 'it', span: 0, excludeCountry: 'US', perCountry: 10 }),
    ).toBe('/history/same-period?year=1969&lang=it&span=0&excludeCountry=US&perCountry=10');
  });
});

describe('lists', () => {
  it.each([
    ['fetchStartHere', () => fetchStartHere(), '/history/start-here'],
    ['fetchPaths', () => fetchPaths(), '/history/paths'],
    ['fetchInsights', () => fetchInsights('/history/insights?month=10&day=4'), '/history/insights?month=10&day=4'],
  ])('%s resolves the array in the envelope', async (_name, call, endpoint) => {
    get.mockResolvedValue(ok([{ slug: 'a' }]));
    await expect(call()).resolves.toEqual([{ slug: 'a' }]);
    expect(get).toHaveBeenCalledWith(endpoint);
  });

  it('treats a day with no insights as an empty list, not an error', async () => {
    get.mockResolvedValue(ok([]));
    await expect(fetchInsights('/history/insights?month=2&day=30')).resolves.toEqual([]);
  });

  it("throws the backend's own message when the envelope says it failed", async () => {
    get.mockResolvedValue(failed('Indica sia il mese sia il giorno'));
    await expect(fetchPaths()).rejects.toThrow('Indica sia il mese sia il giorno');
  });

  it('throws when data is not an array', async () => {
    get.mockResolvedValue(ok({ not: 'a list' }));
    await expect(fetchStartHere()).rejects.toThrow('Unexpected response shape from server');
  });
});

describe('one path, one insight', () => {
  const path = { slug: 'conquista-dello-spazio', title: 'La conquista dello spazio', stops: [] };
  const insight = {
    slug: 'sputnik-1',
    title: 'Lo Sputnik 1 entra in orbita',
    before: 'a',
    event: 'b',
    after: 'c',
    related: [],
  };

  it('escapes the slug it puts in the URL', async () => {
    get.mockResolvedValue(ok(path));
    await fetchPath('a/b c');
    expect(get).toHaveBeenCalledWith('/history/paths/a%2Fb%20c');
  });

  it('accepts a path and an insight in the documented shape', async () => {
    get.mockResolvedValueOnce(ok(path));
    await expect(fetchPath(path.slug)).resolves.toEqual(path);
    get.mockResolvedValueOnce(ok(insight));
    await expect(fetchInsight(insight.slug)).resolves.toEqual(insight);
    expect(get).toHaveBeenLastCalledWith('/history/insights/sputnik-1');
  });

  it('rejects an insight missing one of its three parts', async () => {
    get.mockResolvedValue(ok({ ...insight, after: undefined }));
    await expect(fetchInsight('sputnik-1')).rejects.toThrow();
  });

  it('rejects a path without stops', async () => {
    get.mockResolvedValue(ok({ slug: 'x', title: 'X' }));
    await expect(fetchPath('x')).rejects.toThrow();
  });
});

describe('discovery', () => {
  const attribution = { source: 'Wikipedia', license: 'CC BY-SA 4.0', licenseUrl: 'u', notice: 'n' };

  it('returns a random event', async () => {
    const data = {
      language: 'it',
      event: { year: 1957, month: 10, day: 4, countryCode: 'KZ', text: 'Sputnik' },
      attribution,
    };
    get.mockResolvedValue(ok(data));
    await expect(fetchRandomEvent('/history/random?lang=it')).resolves.toEqual(data);
  });

  it('accepts the answer with no event when nothing matches the filters', async () => {
    get.mockResolvedValue(ok({ language: 'it', attribution }));
    const data = await fetchRandomEvent('/history/random?lang=it&country=VA');
    expect(data.event).toBeUndefined();
  });

  it('rejects a random event that has no country', async () => {
    get.mockResolvedValue(ok({ language: 'it', event: { year: 1957, text: 'x' }, attribution }));
    await expect(fetchRandomEvent('/history/random?lang=it')).rejects.toThrow();
  });

  it('returns a window with nothing in it as coverage NONE, not as an error', async () => {
    const data = {
      language: 'it',
      year: 1500,
      fromYear: 1495,
      toYear: 1505,
      comparison: 'TEMPORAL',
      notice: 'n',
      coverage: { level: 'NONE', eventCount: 0, countryCount: 0, note: 'n' },
      countries: [],
      attribution,
    };
    get.mockResolvedValue(ok(data));
    const result = await fetchSamePeriod('/history/same-period?year=1500&lang=it');
    expect(result.coverage.level).toBe('NONE');
    expect(result.countries).toEqual([]);
  });

  it('rejects a same-period answer without coverage', async () => {
    get.mockResolvedValue(ok({ countries: [] }));
    await expect(fetchSamePeriod('/history/same-period?year=1969&lang=it')).rejects.toThrow();
  });
});

describe('sources', () => {
  const sources = {
    sources: [{ id: 'natural-earth', name: 'Natural Earth', provides: 'p', attributionRequired: false }],
    coverage: { index: [], editorial: { paths: 1, insights: 9, reviewedInsights: 0 } },
    limits: [{ code: 'NOT_VERIFIED', message: 'm' }],
  };

  it('returns the sources, with no review date while nothing was reviewed', async () => {
    get.mockResolvedValue(ok(sources));
    const data = await fetchSources();
    expect(data.coverage.editorial.lastReviewedAt).toBeUndefined();
    expect(get).toHaveBeenCalledWith('/history/sources');
  });

  it('rejects an answer without its coverage', async () => {
    get.mockResolvedValue(ok({ sources: [], limits: [] }));
    await expect(fetchSources()).rejects.toThrow();
  });
});

describe('submitErrorReport', () => {
  const report = {
    target: { type: 'INSIGHT', slug: 'sputnik-1' },
    category: 'WRONG_DATE',
    message: 'A Baikonur era già il 5 ottobre.',
  } as const;

  it('posts the report as given and returns its receipt', async () => {
    post.mockResolvedValue(ok({ id: 42, receivedAt: '2026-10-06T16:10:35Z' }));
    await expect(submitErrorReport(report)).resolves.toEqual({ id: 42, receivedAt: '2026-10-06T16:10:35Z' });
    expect(post).toHaveBeenCalledWith('/history/reports', report);
  });

  it('rejects an answer that carries no report number', async () => {
    post.mockResolvedValue(ok({}));
    await expect(submitErrorReport(report)).rejects.toThrow();
  });

  it("lets the transport's HTTP 429 through, so a form can tell a limit from a typo", async () => {
    post.mockRejectedValue(new Error('HTTP 429: Too Many Requests'));
    await expect(submitErrorReport(report)).rejects.toThrow(/^HTTP 429/);
  });
});
