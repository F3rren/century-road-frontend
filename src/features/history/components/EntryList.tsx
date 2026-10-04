import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { centuryRange } from '@/lib/months';
import { matchesQuery } from '../lib/matchesQuery';
import type { Attribution, HistoryEntry, PlaceRef, SectionResult } from '../types';
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
  compact?: boolean;
  // A heading at this level for each century: a day's list can run from
  // antiquity to last year. Omitted, the list runs on without headings.
  centuryHeadings?: 'h3' | 'h4';
  // Entries the editors also picked for the day, marked where they stand.
  featured?: ReadonlySet<HistoryEntry>;
  // The country each entry is placed in, where the caller knows it.
  countryFor?: (entry: HistoryEntry) => PlaceRef | undefined;
}

// Oldest first, like the map's own event lists.
export function EntryList({ section, month, day, attribution, query, compact, centuryHeadings, featured, countryFor }: EntryListProps) {
  const { i18n } = useTranslation();
  const entries = useMemo(() => {
    const sorted = [...section.items].sort((a, b) => (a.year ?? 0) - (b.year ?? 0));
    return query ? sorted.filter((entry) => matchesQuery(entry, query)) : sorted;
  }, [section, query]);

  // Runs of entries from the same century; one run when there are no headings.
  // A century starts on a multiple of 100, as on the Dashboard's grain chart.
  const groups = useMemo(() => {
    if (!centuryHeadings) return [{ start: null, entries }];
    const runs: { start: number | null; entries: HistoryEntry[] }[] = [];
    for (const entry of entries) {
      const start = entry.year === undefined ? null : Math.floor(entry.year / 100) * 100;
      const last = runs[runs.length - 1];
      if (last && last.start === start) last.entries.push(entry);
      else runs.push({ start, entries: [entry] });
    }
    return runs;
  }, [entries, centuryHeadings]);

  const Heading = centuryHeadings ?? 'h3';

  return (
    <div>
      {groups.map(({ start, entries: run }) => (
        <div key={start ?? 'none'} className={centuryHeadings ? 'mt-5 first:mt-0' : undefined}>
          {centuryHeadings && start !== null && (
            <Heading className="mb-2 font-display text-sm font-semibold tabular-nums text-muted-foreground">
              {centuryRange(start, i18n.language)}
            </Heading>
          )}
          {run.map((entry, index) => (
            <HistoryEventCard
              key={`${entry.year}-${index}`}
              entry={entry}
              month={month}
              day={day}
              language={section.language}
              attribution={attribution}
              compact={compact}
              featured={featured?.has(entry)}
              country={countryFor?.(entry)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
