import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { HistoryEntry } from '../types';

// Wikipedia's Italian feed ends many entries with a stray ";" (they are list
// items in the source); it reads as a typo once the entry stands alone.
function cleanText(text: string): string {
  return text.replace(/[;\s]+$/, '');
}

interface HistoryEventCardProps {
  entry: HistoryEntry;
}

// Same dateline/headline/dek rhythm as the map's EventCard, but it shows only
// what the history API actually provides: there is no country, category or
// importance here, and none is invented to fill those slots.
export function HistoryEventCard({ entry }: HistoryEventCardProps) {
  const [expanded, setExpanded] = useState(false);
  const page = entry.pages[0];

  return (
    <article className="border-b border-border py-3 first:pt-0 last:border-b-0">
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((v) => !v)}
        className="group block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          {entry.year ?? '—'}
        </span>
        <span
          className={cn(
            'mt-1 block font-display text-base font-semibold leading-tight tracking-tight transition-[color] group-hover:text-primary motion-safe:duration-150',
            !expanded && 'line-clamp-2',
          )}
        >
          {cleanText(entry.text)}
        </span>
        {page?.extract && (
          <span
            className={cn(
              'mt-1.5 block font-serif text-sm leading-relaxed text-muted-foreground',
              !expanded && 'line-clamp-2',
            )}
          >
            {page.extract}
          </span>
        )}
      </button>
      {expanded && page && (
        <a
          href={page.url}
          target="_blank"
          rel="noreferrer"
          className="mt-1 inline-flex min-h-11 items-center text-xs text-primary underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Leggi «{page.title}» su Wikipedia
        </a>
      )}
    </article>
  );
}
