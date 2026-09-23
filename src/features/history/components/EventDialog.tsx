import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatEventDate } from '@/lib/months';
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
export function EventDialog({ entry, month, day, language, attribution, onClose }: EventDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const relatedId = useId();

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
      className="m-auto max-h-[calc(100dvh-1.5rem)] w-[calc(100vw-1.5rem)] max-w-2xl overflow-hidden border border-border bg-background p-0 text-foreground backdrop:bg-black/50 open:flex open:flex-col"
    >
      <header className="flex shrink-0 items-start gap-3 border-b border-border px-5 py-4">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            {formatEventDate(day, month, entry.year)}
          </p>
          <h2
            id={titleId}
            className="mt-1 whitespace-pre-line font-display text-xl font-semibold leading-tight tracking-tight"
          >
            {cleanText(entry.text)}
          </h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Chiudi"
          className="-mr-2 -mt-2"
          onClick={() => dialogRef.current?.close()}
        >
          <X aria-hidden="true" className="h-4 w-4" />
        </Button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        {entry.pages.length > 0 && (
          <section aria-labelledby={relatedId}>
            <h3
              id={relatedId}
              className="mb-3 font-display text-eyebrow uppercase text-muted-foreground"
            >
              Articoli collegati
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
