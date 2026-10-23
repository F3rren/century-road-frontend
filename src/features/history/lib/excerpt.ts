import type { InsightDetail, InsightRelated, Provenance } from '../types';
import { paragraphs } from './paragraphs';

// How many "Collegamenti" to show: two or three to read on, not the whole list.
export const MAX_CONNECTIONS = 3;

export interface Excerpt {
  // Before, the event, after: only the parts that have text, in that order.
  parts: { key: 'before' | 'event' | 'after'; paragraphs: string[] }[];
  // Caveats on dates and places, as the backend wrote them.
  notes: string[];
  connections: InsightRelated[];
  provenance: Provenance;
}

// What an insight gives to a place with little room (an event's dialog, a path's stop): the three
// parts of the story, the caveats on its dates and places, a few insights to read on, and who
// wrote it and whether anyone checked it. Only the sources stay on the insight's own page.
// Anything missing is left out rather than shown empty.
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
  return {
    parts,
    notes: insight.notes.map((note) => note.trim()).filter(Boolean),
    connections: insight.related.slice(0, MAX_CONNECTIONS),
    provenance: insight.provenance,
  };
}

// The notes and the provenance only qualify the story, so they do not make a block worth showing.
export function isEmptyExcerpt({ parts, connections }: Excerpt): boolean {
  return parts.length === 0 && connections.length === 0;
}
