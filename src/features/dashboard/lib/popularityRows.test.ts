import { describe, expect, it } from 'vitest';
import { countryRows, dayRows } from './popularityRows';

describe('dayRows', () => {
  const stats = [
    { month: 10, day: 4, viewCount: 120 },
    { month: 2, day: 29, viewCount: 7 },
  ];

  it('names each day in the interface language and keeps the order the backend gave', () => {
    expect(dayRows(stats, 'it').map((row) => row.name)).toEqual(['4 ottobre', '29 febbraio']);
    expect(dayRows(stats, 'en').map((row) => row.name)).toEqual(['October 4', 'February 29']);
    expect(dayRows(stats, 'it').map((row) => row.viewCount)).toEqual([120, 7]);
  });

  it('leads nowhere unless asked to, and then to that day in the Archive', () => {
    expect(dayRows(stats, 'it').every((row) => row.href === undefined)).toBe(true);
    expect(dayRows(stats, 'it', true).map((row) => row.href)).toEqual([
      '/archive?month=10&day=4',
      '/archive?month=2&day=29',
    ]);
  });

  it('gives every day its own id, so two days with the same number do not collide', () => {
    const ids = dayRows([{ month: 1, day: 12, viewCount: 1 }, { month: 11, day: 2, viewCount: 1 }], 'it').map((row) => row.id);
    expect(new Set(ids).size).toBe(2);
  });
});

describe('countryRows', () => {
  const stats = [
    { countryCode: 'IT', viewCount: 50 },
    { countryCode: 'US', viewCount: 9 },
  ];

  it('names each country in the interface language', () => {
    expect(countryRows(stats, 'it').map((row) => row.name)).toEqual(['Italia', 'Stati Uniti']);
    expect(countryRows(stats, 'en')[0].name).toBe('Italy');
  });

  it('leads nowhere unless asked to, and then to that country in Il mio secolo', () => {
    expect(countryRows(stats, 'it')[0].href).toBeUndefined();
    expect(countryRows(stats, 'it', true).map((row) => row.href)).toEqual(['/century?country=IT', '/century?country=US']);
  });
});
