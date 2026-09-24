import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatEventDate } from '@/lib/months';
import { cleanText } from '../lib/text';
import type { Attribution, HistoryEntry, HistoryLanguage } from '../types';
import { EventDialog } from './EventDialog';

interface HistoryEventCardProps {
  entry: HistoryEntry;
  // The day every entry in the list shares — the API answers "on this day",
  // one month/day at a time — paired with the entry's own (or absent) year
  // to print a complete date instead of a bare, context-free year.
  month: number;
  day: number;
  // The edition the text really came from, which is not always the one asked for.
  language: HistoryLanguage;
  attribution: Attribution;
}

// Same dateline/headline rhythm as the map's EventCard, but it shows only
// what the history API provides: no country, category or importance, and
// none is invented to fill those slots. `text` is the event; the linked
// articles are related reading and are never used as its title or summary.
// The full picture opens in a popup, so the list stays a scannable column.
export function HistoryEventCard({ entry, month, day, language, attribution }: HistoryEventCardProps) {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const relatedCount = entry.pages.length;

  // The browser only restores focus to what was focused when the popup
  // opened, and Safari does not focus a button on click. Put it back
  // explicitly so keyboard and screen-reader users land where they were.
  const handleClose = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <article lang={language} className="border-b border-border py-3 first:pt-0 last:border-b-0">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        onClick={() => setIsOpen(true)}
        className="group block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          {formatEventDate(day, month, entry.year, i18n.language)}
        </span>
        <span className="mt-1 line-clamp-2 block whitespace-pre-line font-display text-base font-semibold leading-tight tracking-tight transition-[color] group-hover:text-primary motion-safe:duration-150">
          {cleanText(entry.text)}
        </span>
        {relatedCount > 0 && (
          <span className="mt-1.5 block text-xs text-muted-foreground">
            {t('history.card.relatedCount', { count: relatedCount })}
          </span>
        )}
      </button>
      {isOpen && (
        <EventDialog
          entry={entry}
          month={month}
          day={day}
          language={language}
          attribution={attribution}
          onClose={handleClose}
        />
      )}
    </article>
  );
}
