import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { HistoricalEvent } from '../types';

// Direct swatches (not design tokens) because these are data categories, not
// UI surfaces — but every one needs an explicit dark: pair so the badges
// don't stay light-mode-only once `.dark` is applied. `text-yellow-800`
// (rather than -700) keeps "culture" at a safe WCAG AA contrast on yellow-100.
const CATEGORY_STYLES: Record<HistoricalEvent['category'], string> = {
  war:      'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  politics: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  science:  'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  culture:  'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300',
  disaster: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  economy:  'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
};

// Text-only counterpart of CATEGORY_STYLES, used inline next to the country
// name — kept as its own map instead of string-splitting CATEGORY_STYLES so
// the two can't silently drift when either map's class list changes.
const CATEGORY_TEXT_STYLES: Record<HistoricalEvent['category'], string> = {
  war:      'text-red-700 dark:text-red-300',
  politics: 'text-blue-700 dark:text-blue-300',
  science:  'text-purple-700 dark:text-purple-300',
  culture:  'text-yellow-800 dark:text-yellow-300',
  disaster: 'text-orange-700 dark:text-orange-300',
  economy:  'text-green-700 dark:text-green-300',
};

const CATEGORY_LABELS: Record<HistoricalEvent['category'], string> = {
  war:      'Guerra',
  politics: 'Politica',
  science:  'Scienza',
  culture:  'Cultura',
  disaster: 'Disastro',
  economy:  'Economia',
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
        'group rounded-lg border bg-card p-3 transition-shadow',
        canExpand && 'cursor-pointer hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
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
      <div className="flex items-start gap-2">
        <span
          className={cn(
            'shrink-0 rounded-md px-1.5 py-0.5 text-xs font-bold tabular-nums',
            CATEGORY_STYLES[event.category],
          )}
        >
          {event.year}
        </span>
        <div className="min-w-0 flex-1">
          <p className={cn('text-sm font-semibold leading-tight', !expanded && 'line-clamp-2')}>
            {event.title}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {event.countryName} &middot;{' '}
            <span className={cn('font-medium', CATEGORY_TEXT_STYLES[event.category])}>
              {CATEGORY_LABELS[event.category]}
            </span>
          </p>
          {!compact && (
            <p
              className={cn(
                'mt-1 text-xs text-muted-foreground leading-relaxed',
                !expanded && 'line-clamp-2'
              )}
            >
              {event.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
