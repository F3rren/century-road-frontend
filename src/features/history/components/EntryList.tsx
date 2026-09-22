import { useMemo } from 'react';
import { matchesQuery } from '../lib/matchesQuery';
import type { Attribution, SectionResult } from '../types';
import { HistoryEventCard } from './HistoryEventCard';

interface EntryListProps {
  section: SectionResult;
  // The day every entry in `section` shares — the response is "on this day",
  // one month/day at a time — so each card can print a complete date.
  month: number;
  day: number;
  attribution: Attribution;
  // Case-insensitive filter over each entry's text and its linked articles'
  // titles. Omitted or empty shows every entry.
  query?: string;
}

// Oldest first, like the map's own event lists.
export function EntryList({ section, month, day, attribution, query }: EntryListProps) {
  const entries = useMemo(() => {
    const sorted = [...section.items].sort((a, b) => (a.year ?? 0) - (b.year ?? 0));
    return query ? sorted.filter((entry) => matchesQuery(entry, query)) : sorted;
  }, [section, query]);

  return (
    <div>
      {entries.map((entry, index) => (
        <HistoryEventCard
          key={`${entry.year}-${index}`}
          entry={entry}
          month={month}
          day={day}
          language={section.language}
          attribution={attribution}
        />
      ))}
    </div>
  );
}
