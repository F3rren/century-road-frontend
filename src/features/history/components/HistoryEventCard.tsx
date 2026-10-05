import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cleanText } from '../lib/text';
import type { Attribution, HistoryEntry, HistoryLanguage, PlaceRef } from '../types';
import { EventDialog } from './EventDialog';
import { YearMark } from './YearMark';

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
  // The narrow map panel: smaller year and text, so a row is not six lines long.
  compact?: boolean;
  // Also one of the editors' picks for the day.
  featured?: boolean;
  // Where the map places the event, when it does: its popup links to that country.
  country?: PlaceRef;
}

// The year in the margin, the event beside it. It shows only what the history
// API provides, plus the editors' pick: no country, category or importance, and
// none is invented to fill those slots. `text` is the event; the linked
// articles are related reading and are never used as its title or summary.
// The full picture opens in a popup, so the list stays a scannable column.
export function HistoryEventCard({ entry, month, day, language, attribution, compact = false, featured = false, country }: HistoryEventCardProps) {
  const { t } = useTranslation();
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
    <article
      lang={language}
      // content-visibility skips layout/paint for rows far off-screen - a
      // real cost on a day with hundreds of entries (births/deaths sections
      // can run that high). contain-intrinsic-size is only the placeholder
      // height used before a row has ever been measured, so the scrollbar
      // doesn't jump; it doesn't need to be exact. Native, so unlike a
      // virtualization library this keeps every row in the DOM - Ctrl+F and
      // scroll-position restoration keep working normally. It also clips
      // paint to the row, so the button's focus ring is drawn inset.
      style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 88px' }}
      className="border-b border-border py-3 first:pt-0 last:border-b-0">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        onClick={() => setIsOpen(true)}
        className={`group grid w-full ${compact ? 'grid-cols-[2.75rem_minmax(0,1fr)] gap-x-2.5' : 'grid-cols-[3.75rem_minmax(0,1fr)] gap-x-3'} text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring`}
      >
        {/* Every row in a list shares its day, so only the year is shown. */}
        <YearMark year={entry.year} compact={compact} />
        <span>
          <span className={`line-clamp-3 block whitespace-pre-line font-serif ${compact ? 'text-sm' : 'text-base'} leading-snug transition-[color] group-hover:text-primary motion-safe:duration-150`}>
            {cleanText(entry.text)}
          </span>
          {(featured || relatedCount > 0) && (
            <span className="mt-1 flex flex-wrap gap-x-3 text-xs text-muted-foreground">
              {featured && <span className="font-bold text-primary">{t('history.section.selected')}</span>}
              {relatedCount > 0 && <span>{t('history.card.relatedCount', { count: relatedCount })}</span>}
            </span>
          )}
        </span>
      </button>
      {isOpen && (
        <EventDialog
          entry={entry}
          month={month}
          day={day}
          language={language}
          attribution={attribution}
          country={country}
          onClose={handleClose}
        />
      )}
    </article>
  );
}
