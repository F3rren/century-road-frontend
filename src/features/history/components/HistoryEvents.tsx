import { useOnThisDay } from '../hooks/useOnThisDay';
import type { HistorySectionKey } from '../types';
import { AttributionNotice } from './AttributionNotice';
import { EntryList } from './EntryList';

// The panel is framed as "Accadde oggi nel '900" while Wikipedia's feed spans
// every era, so ask for the twentieth century only. Italian sections only:
// the Italian feed has no births/deaths, and the English fallback would mix
// languages into a list that is otherwise Italian.
const FROM_YEAR = 1900;
const TO_YEAR = 1999;
// `selected` is the editors' short pick for the day; `events` is the full list.
const TYPES: readonly HistorySectionKey[] = ['selected', 'events'];

const STATUS_CLASS = 'px-0.5 py-2 text-xs italic text-muted-foreground';
const NOTE_CLASS = 'px-0.5 pb-2 text-xs text-muted-foreground';
const SUBHEADING_CLASS = 'mb-1 font-display text-eyebrow uppercase';

interface HistoryEventsProps {
  title: string;
  month: number;
  day: number;
}

export function HistoryEvents({ title, month, day }: HistoryEventsProps) {
  const { isLoading, data, error } = useOnThisDay({
    month,
    day,
    lang: 'it',
    types: TYPES,
    fromYear: FROM_YEAR,
    toYear: TO_YEAR,
  });

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
        <p className={STATUS_CLASS}>Nessun evento nel Novecento per questo giorno.</p>
      )}

      {data && featured && hasFeatured && (
        <div>
          <h3 className={`${SUBHEADING_CLASS} text-primary`}>In evidenza</h3>
          <EntryList section={featured} attribution={data.attribution} />
        </div>
      )}

      {data && events && hasEvents && (
        <div className={hasFeatured ? 'mt-5' : undefined}>
          {hasFeatured && (
            <h3 className={`${SUBHEADING_CLASS} text-muted-foreground`}>
              Tutti gli eventi
            </h3>
          )}
          <EntryList section={events} attribution={data.attribution} />
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
