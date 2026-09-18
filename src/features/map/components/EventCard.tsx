import { useState } from 'react';
import { cn } from '@/lib/utils';
import { CATEGORY_LABELS } from '../constants/categories';
import type { HistoricalEvent } from '../types';

const MONTH_ABBR = [
  '', 'GEN', 'FEB', 'MAR', 'APR', 'MAG', 'GIU',
  'LUG', 'AGO', 'SET', 'OTT', 'NOV', 'DIC',
];

// A small section-flag swatch + text, not a filled pill — the one
// committed accent in this redesign is wire-red (--primary); category
// color-coding is a separate data dimension and stays deliberately
// quieter than that. Every entry still needs an explicit dark: pair.
const CATEGORY_SWATCH: Record<HistoricalEvent['category'], string> = {
  war:      'bg-red-600 dark:bg-red-400',
  politics: 'bg-blue-600 dark:bg-blue-400',
  science:  'bg-purple-600 dark:bg-purple-400',
  culture:  'bg-yellow-600 dark:bg-yellow-400',
  disaster: 'bg-orange-600 dark:bg-orange-400',
  economy:  'bg-green-600 dark:bg-green-400',
};

// Type size carries importance, not color alone — raised from the
// festival-lineup-poster challenger in the direction contract.
const TITLE_SIZE: Record<HistoricalEvent['importance'], string> = {
  high: 'text-lg',
  medium: 'text-base',
  low: 'text-sm',
};

interface EventCardProps {
  event: HistoricalEvent;
  compact?: boolean;
}

export function EventCard({ event, compact = false }: EventCardProps) {
  const [expanded, setExpanded] = useState(false);
  const canExpand = !compact;

  return (
    <div
      className={cn(
        'group border-b border-border py-3 first:pt-0 last:border-b-0',
        canExpand && 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
      )}
      role={canExpand ? 'button' : undefined}
      tabIndex={canExpand ? 0 : undefined}
      aria-expanded={canExpand ? expanded : undefined}
      onClick={canExpand ? () => setExpanded((v) => !v) : undefined}
      onKeyDown={
        canExpand
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setExpanded((v) => !v);
              }
            }
          : undefined
      }
    >
      {/* Dateline stamp: place + full date, monospace, the wire-bulletin
          device the whole redesign is built around. */}
      <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
        {event.countryName} &middot; {event.day} {MONTH_ABBR[event.month]} {event.year}
      </p>
      <p
        className={cn(
          'mt-1 font-display font-semibold leading-tight tracking-tight transition-[color] motion-safe:duration-150',
          TITLE_SIZE[event.importance],
          !expanded && 'line-clamp-2',
          canExpand && 'group-hover:text-primary',
        )}
      >
        {event.title}
      </p>
      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className={cn('h-2 w-2 shrink-0', CATEGORY_SWATCH[event.category])} aria-hidden="true" />
        {CATEGORY_LABELS[event.category]}
      </p>
      {!compact && (
        <p
          className={cn(
            'mt-1.5 font-serif text-sm leading-relaxed text-muted-foreground',
            !expanded && 'line-clamp-2'
          )}
        >
          {event.description}
        </p>
      )}
    </div>
  );
}
