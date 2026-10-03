import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { describeEventDate } from '@/lib/months';
import { cleanText } from '../lib/text';
import type { Attribution, HistoryEntry, HistoryLanguage } from '../types';
import { AttributionNotice } from './AttributionNotice';
import { RelatedArticle } from './RelatedArticle';

interface EventDialogProps {
  entry: HistoryEntry;
  month: number;
  day: number;
  // The edition the text really came from, which is not always the one asked for.
  language: HistoryLanguage;
  attribution: Attribution;
  onClose: () => void;
}

// A native <dialog> opened as a modal: the browser traps focus, makes the
// rest of the page inert, closes on Escape and hands focus back to the button
// that opened it. It also sits in the top layer, so the map panel's overflow
// and its mobile drawer's transform cannot clip or offset it.
//
// Read like the caption of a print: the year first, as large as everywhere
// else in the app, then the full date once (with the weekday where it can be
// trusted, and how long ago it was), the event in reading type, and the
// articles to read further. It all scrolls as one; only the close button
// stays in its corner.
export function EventDialog({ entry, month, day, language, attribution, onClose }: EventDialogProps) {
  const { t, i18n } = useTranslation();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const relatedId = useId();
  const when = describeEventDate(day, month, entry.year, i18n.language);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      lang={language}
      aria-labelledby={titleId}
      onClose={onClose}
      // A click on the backdrop lands on the <dialog> itself (it has no padding).
      onClick={(e) => {
        if (e.target === e.currentTarget) e.currentTarget.close();
      }}
      // Keys typed in the popup belong to it, not to the app's single-key
      // shortcuts (1/2/3 navigate away, / focuses the country picker).
      onKeyDown={(e) => e.stopPropagation()}
      className="relative m-auto max-h-[calc(100dvh-1.5rem)] w-[calc(100vw-1.5rem)] max-w-2xl overflow-hidden border border-border bg-background p-0 text-foreground backdrop:bg-black/50 open:flex open:flex-col"
    >
      <Button
        variant="ghost"
        size="icon"
        aria-label={t('history.dialog.close')}
        className="absolute right-2 top-2 z-10 bg-background"
        onClick={() => dialogRef.current?.close()}
      >
        <X aria-hidden="true" className="h-4 w-4" />
      </Button>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-6 sm:px-8">
        <div className="max-w-[60ch] pr-10">
          {entry.year !== undefined && (
            <p aria-hidden="true" className="font-display text-5xl font-semibold leading-none tabular-nums tracking-[-0.02em]">
              {Math.abs(entry.year)}
              {entry.year < 0 && <span className="ml-2 text-xl text-muted-foreground">{t('date.era.bc')}</span>}
            </p>
          )}
          <p className="mt-2 text-sm text-muted-foreground">
            {when.ago ? t('history.dialog.when', { date: when.date, ago: when.ago }) : when.date}
          </p>
          <h2 id={titleId} className="mt-4 whitespace-pre-line font-serif text-xl leading-snug sm:text-2xl sm:leading-snug">
            {cleanText(entry.text)}
          </h2>
        </div>

        {entry.pages.length > 0 && (
          <section aria-labelledby={relatedId} className="mt-8 border-t border-border pt-5">
            <h3 id={relatedId} className="mb-4 font-display text-lg font-semibold">
              {t('history.dialog.relatedHeading')}
            </h3>
            <ul>
              {entry.pages.map((page) => (
                <RelatedArticle key={page.url} page={page} />
              ))}
            </ul>
          </section>
        )}
        <div className="mt-4 border-t border-border pt-3">
          <AttributionNotice attribution={attribution} />
        </div>
      </div>
    </dialog>
  );
}
