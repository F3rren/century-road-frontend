import { describe, expect, it } from 'vitest';
import type { InsightSummary } from '../types';
import { findInsight, insightOnMapRoute, insightRoute, pathRoute } from './editorial';

const insight = (slug: string, year: number): InsightSummary => ({
  slug,
  title: slug,
  summary: '',
  date: { year, month: 10, day: 4 },
  place: { name: 'Baikonur', lat: 45.92, lon: 63.34, approximate: false },
});

describe('routes', () => {
  it('escapes a slug that goes into a path or a query', () => {
    expect(pathRoute('conquista dello spazio')).toBe('/paths/conquista%20dello%20spazio');
    expect(insightRoute('a/b')).toBe('/insights/a%2Fb');
    expect(insightOnMapRoute('sputnik-1')).toBe('/?insight=sputnik-1');
    expect(insightOnMapRoute('a&b=c')).toBe('/?insight=a%26b%3Dc');
  });
});

describe('findInsight', () => {
  const insights = [insight('sputnik-1', 1957), insight('apollo-11', 1969)];

  it('matches an event to the insight of its year', () => {
    expect(findInsight({ year: 1969 }, insights)?.slug).toBe('apollo-11');
  });

  it('matches nothing when the year differs, or when there is no year', () => {
    expect(findInsight({ year: 1970 }, insights)).toBeUndefined();
    expect(findInsight({ year: undefined }, insights)).toBeUndefined();
  });

  it('matches nothing in an empty list', () => {
    expect(findInsight({ year: 1957 }, [])).toBeUndefined();
  });

  it('matches a year before the common era as it is written, negative', () => {
    expect(findInsight({ year: -44 }, [insight('ides', -44)])?.slug).toBe('ides');
  });
});
