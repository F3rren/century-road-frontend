import type { OnThisDayData } from '../types';
import { AttributionNotice } from './AttributionNotice';
import { EntryList } from './EntryList';

const STATUS_CLASS = 'px-0.5 py-2 text-xs italic text-muted-foreground';
const NOTE_CLASS = 'px-0.5 pb-2 text-xs text-muted-foreground';
const SUBHEADING_CLASS = 'mb-1 font-display text-eyebrow uppercase';

interface HistoryEventsProps {
  title: string;
  // Fetched by the caller — usually shared with other things on the same
  // page (the map's heatmap, its per-country lists) that need the exact
  // same day's data, so the fetch itself isn't repeated here.
  data: OnThisDayData | null;
  isLoading: boolean;
  error: string | null;
}

export function HistoryEvents({ title, data, isLoading, error }: HistoryEventsProps) {
  const featured = data?.sections.selected;
  const events = data?.sections.events;
  const hasFeatured = (featured?.items.length ?? 0) > 0;
  const hasEvents = (events?.items.length ?? 0) > 0;
  const received = [featured, events].filter((s) => s !== undefined);

  return (
    <div>
      <h2 className="mb-1 font-display text-eyebrow uppercase text-muted-foreground">
        {title}
      </h2>

      {received.some((s) => s.fallback) && (
        <p className={NOTE_CLASS}>
          Testi in inglese: la versione italiana di Wikipedia non era disponibile.
        </p>
      )}
      {received.some((s) => s.stale) && (
        <p className={NOTE_CLASS}>
          Dati non aggiornati: Wikipedia non era raggiungibile.
        </p>
      )}

      {isLoading && <p className={STATUS_CLASS}>Caricamento degli eventi…</p>}

      {error && (
        <p className="px-0.5 py-2 text-xs text-destructive">
          Impossibile caricare gli eventi di oggi ({error}).
        </p>
      )}

      {data && !hasFeatured && !hasEvents && (
        <p className={STATUS_CLASS}>Nessuna voce per questo giorno.</p>
      )}

      {data && featured && hasFeatured && (
        <div>
          <h3 className={`${SUBHEADING_CLASS} text-primary`}>In evidenza</h3>
          <EntryList section={featured} month={data.date.month} day={data.date.day} attribution={data.attribution} />
        </div>
      )}

      {data && events && hasEvents && (
        <div className={hasFeatured ? 'mt-5' : undefined}>
          {hasFeatured && (
            <h3 className={`${SUBHEADING_CLASS} text-muted-foreground`}>
              Tutti gli eventi
            </h3>
          )}
          <EntryList section={events} month={data.date.month} day={data.date.day} attribution={data.attribution} />
        </div>
      )}

      {data && (
        <div className="pt-3">
          <AttributionNotice attribution={data.attribution} />
        </div>
      )}
    </div>
  );
}
