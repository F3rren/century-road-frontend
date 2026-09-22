import type { HistoryEntry } from '../types';

// Case-insensitive: the event's own text, or the title of any article linked
// from it. An empty/whitespace-only query matches everything.
export function matchesQuery(entry: HistoryEntry, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  if (entry.text.toLowerCase().includes(needle)) return true;
  return entry.pages.some((page) => page.title.toLowerCase().includes(needle));
}
