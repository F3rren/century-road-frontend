import type { InsightDetail, InsightRelated } from '../types';
import { paragraphs } from './paragraphs';

// How many "Collegamenti" to show: two or three to read on, not the whole list.
export const MAX_CONNECTIONS = 3;

export interface Excerpt {
  // Before, the event, after: only the parts that have text, in that order.
  parts: { key: 'before' | 'event' | 'after'; paragraphs: string[] }[];
  connections: InsightRelated[];
}

// What an insight gives to a place with little room (an event's dialog, a path's stop): the three
// parts of the story and a few insights to read on, never the caveats, sources and provenance
// that only the insight's own page carries. Anything missing is left out rather than shown empty.
export function buildExcerpt(insight: InsightDetail): Excerpt {
  const parts = (
    [
      { key: 'before', text: insight.before },
      { key: 'event', text: insight.event },
      { key: 'after', text: insight.after },
    ] as const
  )
    .map(({ key, text }) => ({ key, paragraphs: paragraphs(text) }))
    .filter((part) => part.paragraphs.length > 0);
  return { parts, connections: insight.related.slice(0, MAX_CONNECTIONS) };
}

export function isEmptyExcerpt({ parts, connections }: Excerpt): boolean {
  return parts.length === 0 && connections.length === 0;
}
