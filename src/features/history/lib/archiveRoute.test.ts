import { describe, expect, it } from 'vitest';
import { archiveEventRoute } from './archiveRoute';

describe('archiveEventRoute', () => {
  it("opens the event's day, narrowed to its year and to events", () => {
    expect(archiveEventRoute({ year: 1957, month: 10, day: 4 }, 'it')).toBe(
      '/archive?month=10&day=4&from=1957&to=1957&types=events&lang=it',
    );
  });

  it('keeps a year before the common era negative', () => {
    expect(archiveEventRoute({ year: -44, month: 3, day: 15 }, 'en')).toContain('from=-44&to=-44');
  });
});
