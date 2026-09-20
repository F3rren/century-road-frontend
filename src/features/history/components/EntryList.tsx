import { useMemo } from 'react';
import type { Attribution, SectionResult } from '../types';
import { HistoryEventCard } from './HistoryEventCard';

interface EntryListProps {
  section: SectionResult;
  attribution: Attribution;
}

// Oldest first, like the map's own event lists.
export function EntryList({ section, attribution }: EntryListProps) {
  const entries = useMemo(
    () => [...section.items].sort((a, b) => (a.year ?? 0) - (b.year ?? 0)),
    [section],
  );

  return (
    <div>
      {entries.map((entry, index) => (
        <HistoryEventCard
          key={`${entry.year}-${index}`}
          entry={entry}
          language={section.language}
          attribution={attribution}
        />
      ))}
    </div>
  );
}
