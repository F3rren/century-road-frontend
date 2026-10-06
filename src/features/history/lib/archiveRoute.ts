import type { HistoryLanguage } from '../types';

// The archive opened on one event's day, narrowed to its own year: where the full entry, its
// articles and their image credits live. Used by every list of events that only has the date.
export function archiveEventRoute(
  event: { year: number; month: number; day: number },
  language: HistoryLanguage,
): string {
  const params = new URLSearchParams({
    month: String(event.month),
    day: String(event.day),
    from: String(event.year),
    to: String(event.year),
    types: 'events',
    lang: language,
  });
  return `/archive?${params}`;
}
