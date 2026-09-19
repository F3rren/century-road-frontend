import { useMemo } from 'react';
import { useOnThisDay } from '../hooks/useOnThisDay';
import { HistoryEventCard } from './HistoryEventCard';
import type { HistorySectionKey } from '../types';

// The panel is framed as "Accadde oggi nel '900" while Wikipedia's feed spans
// every era, so ask for the twentieth century only. Italian events only: the
// Italian feed has no births/deaths, and the English fallback would mix
// languages into a list that is otherwise Italian.
const FROM_YEAR = 1900;
const TO_YEAR = 1999;
const TYPES: readonly HistorySectionKey[] = ['events'];

const STATUS_CLASS = 'px-0.5 py-2 text-xs italic text-muted-foreground';

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

  const section = data?.sections.events;
  const entries = useMemo(
    () => [...(section?.items ?? [])].sort((a, b) => (a.year ?? 0) - (b.year ?? 0)),
    [section],
  );

  return (
    <div>
      <h2 className="mb-1 font-display text-eyebrow uppercase text-muted-foreground">
        {title}
      </h2>

      {isLoading && <p className={STATUS_CLASS}>Caricamento degli eventi…</p>}

      {error && (
        <p className="px-0.5 py-2 text-xs text-destructive">
          Impossibile caricare gli eventi di oggi ({error}).
        </p>
      )}

      {data && entries.length === 0 && (
        <p className={STATUS_CLASS}>Nessun evento nel Novecento per questo giorno.</p>
      )}

      {entries.map((entry, index) => (
        <HistoryEventCard key={`${entry.year}-${index}`} entry={entry} />
      ))}

      {data && (
        <p className="pt-3 text-[11px] leading-snug text-muted-foreground">
          {section?.stale && 'Dati non aggiornati: Wikipedia non era raggiungibile. '}
          Fonte: {data.attribution.source}, licenza{' '}
          <a
            href={data.attribution.licenseUrl}
            target="_blank"
            rel="noreferrer"
            className="underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {data.attribution.license}
          </a>
          .
        </p>
      )}
    </div>
  );
}
