import type { HistoryEntry } from '../types';

// Wikipedia's "selected" section is the editors' pick of the day, and most of its
// entries are also in "events", worded differently: listed in both, a reader
// counts one happening twice. A pick and an event are the same happening when
// they share the year and at least one linked article (both sections come from
// the same edition, so the article URLs match).
export function splitFeatured(
  selected: readonly HistoryEntry[],
  events: readonly HistoryEntry[],
): { featured: Set<HistoryEntry>; onlySelected: HistoryEntry[] } {
  const featured = new Set<HistoryEntry>();
  const onlySelected: HistoryEntry[] = [];
  for (const pick of selected) {
    const urls = new Set(pick.pages.map((page) => page.url));
    const match = events.find(
      (event) => event.year !== undefined && event.year === pick.year && event.pages.some((page) => urls.has(page.url)),
    );
    if (match) featured.add(match);
    else onlySelected.push(pick);
  }
  return { featured, onlySelected };
}
