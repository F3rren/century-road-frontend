import { describe, expect, it } from 'vitest';
import type { EditorialDate, InsightSummary } from '../types';
import { findInsight, formatEditorialDate, insightOnMapRoute, insightRoute, pathRoute } from './editorial';

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

describe('formatEditorialDate', () => {
  // The month and day of a coarser date are placeholders (1 January, the 1st): they must never show.
  const yearOnly: EditorialDate = { year: -133, month: 1, day: 1, precision: 'YEAR' };
  const monthOnly: EditorialDate = { year: -52, month: 9, day: 1, precision: 'MONTH' };

  it('says only the year when only the year is known', () => {
    expect(formatEditorialDate(yearOnly, 'it')).toBe('133 a.C.');
    expect(formatEditorialDate(yearOnly, 'en')).toBe('133 BC');
    expect(formatEditorialDate(yearOnly, 'de')).toBe('133 v. Chr.');
    expect(formatEditorialDate(yearOnly, 'fr')).toBe('133 av. J.-C.');
    expect(formatEditorialDate({ year: 1066, month: 1, day: 1, precision: 'YEAR' }, 'it')).toBe('1066');
  });

  it('says the month and the year when the day is not known', () => {
    expect(formatEditorialDate(monthOnly, 'it')).toBe('settembre 52 a.C.');
    expect(formatEditorialDate(monthOnly, 'en')).toBe('September 52 BC');
    expect(formatEditorialDate(monthOnly, 'fr')).toBe('septembre 52 av. J.-C.');
    expect(formatEditorialDate({ year: 1066, month: 10, day: 1, precision: 'MONTH' }, 'it')).toBe('ottobre 1066');
  });

  it('falls back to the year alone, never to an invented day, for a precision or a month it does not know', () => {
    const unknown = 'CENTURY' as unknown as EditorialDate['precision'];
    expect(formatEditorialDate({ ...yearOnly, precision: unknown }, 'it')).toBe('133 a.C.');
    expect(formatEditorialDate({ ...monthOnly, month: 13 }, 'it')).toBe('52 a.C.');
  });

  it('says the whole day when it is known, or when the backend says nothing', () => {
    expect(formatEditorialDate({ year: -44, month: 3, day: 15, precision: 'DAY' }, 'it')).toBe('15 marzo 44 a.C.');
    expect(formatEditorialDate({ year: -44, month: 3, day: 15 }, 'it')).toBe('15 marzo 44 a.C.');
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
