import { describe, expect, it } from 'vitest';
import type { InsightDetail } from '../types';
import { buildExcerpt, isEmptyExcerpt, MAX_CONNECTIONS } from './excerpt';

const related = (n: number) => ({ slug: `e-${n}`, title: `E ${n}`, date: { year: 1960 + n, month: 1, day: 1 }, reason: `R ${n}` });

const insight: InsightDetail = {
  slug: 'sputnik-1',
  language: 'it',
  title: 'Lo Sputnik 1',
  summary: 's',
  date: { year: 1957, month: 10, day: 4 },
  place: { name: 'Baikonur', lat: 1, lon: 2, approximate: false },
  before: 'Prima uno.\n\nPrima due.',
  event: "L'evento.",
  after: 'Dopo.',
  related: [1, 2, 3, 4].map(related),
  inPaths: [],
  sources: [],
  notes: ['Una nota.'],
  provenance: { author: 'Century Road' },
};

describe('buildExcerpt', () => {
  it('keeps before, the event and after in that order, split into paragraphs', () => {
    const { parts } = buildExcerpt(insight);
    expect(parts.map((p) => p.key)).toEqual(['before', 'event', 'after']);
    expect(parts[0].paragraphs).toEqual(['Prima uno.', 'Prima due.']);
  });

  it('shows at most the first three connections', () => {
    const { connections } = buildExcerpt(insight);
    expect(connections).toHaveLength(MAX_CONNECTIONS);
    expect(connections.map((c) => c.slug)).toEqual(['e-1', 'e-2', 'e-3']);
  });

  it('leaves out a part with no text', () => {
    expect(buildExcerpt({ ...insight, before: '  \n\n ' }).parts.map((p) => p.key)).toEqual(['event', 'after']);
  });

  it('is empty only when there is neither text nor a connection', () => {
    expect(isEmptyExcerpt(buildExcerpt(insight))).toBe(false);
    expect(isEmptyExcerpt(buildExcerpt({ ...insight, before: '', event: '', after: '' }))).toBe(false);
    expect(isEmptyExcerpt(buildExcerpt({ ...insight, before: '', event: '', after: '', related: [] }))).toBe(true);
  });
});
