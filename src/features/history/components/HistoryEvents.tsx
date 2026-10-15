import { useMemo } from 'react';
import { RotateCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/button';
import { useInsightFinder } from '../hooks/useEditorial';
import { splitFeatured } from '../lib/featured';
import type { HistoryEntry, OnThisDayData, PlaceRef } from '../types';
import { AttributionNotice } from './AttributionNotice';
import { EntryList } from './EntryList';

const STATUS_CLASS = 'px-0.5 py-2 text-xs text-muted-foreground';
const NOTE_CLASS = 'px-0.5 pb-2 text-xs text-muted-foreground';
const SUBHEADING_CLASS = 'mb-1 text-eyebrow';

// The map panel's list of the day: its header already names the day, so the
// list adds no heading of its own and uses the panel's compact rows.
interface HistoryEventsProps {
  // Fetched by the caller — usually shared with other things on the same
  // page (the map's heatmap, its per-country lists) that need the exact
  // same day's data, so the fetch itself isn't repeated here.
  data: OnThisDayData | null;
  isLoading: boolean;
  error: string | null;
  // Asks for the day again after a failure.
  onRetry: () => void;
  // The country each event is placed in, where the map knows it.
  countryFor?: (entry: HistoryEntry) => PlaceRef | undefined;
}

export function HistoryEvents({ data, isLoading, error, onRetry, countryFor }: HistoryEventsProps) {
  const { t } = useTranslation();
  const selected = data?.sections.selected;
  const events = data?.sections.events;
  // An editors' pick that is also in the full list is marked there, not listed
  // twice in other words; only the picks with no match keep their own section.
  const { featured, onlySelected } = useMemo(
    () => splitFeatured(selected?.items ?? [], events?.items ?? []),
    [selected, events],
  );
  // "Approfondimento disponibile" on the events that have one, matched on the year.
  const insightFor = useInsightFinder(data?.date ?? null);
  const hasPicks = onlySelected.length > 0;
  const hasEvents = (events?.items.length ?? 0) > 0;
  const received = [selected, events].filter((s) => s !== undefined);

  return (
    <div>
      {received.some((s) => s.fallback) && (
        <p className={NOTE_CLASS}>
          {t('history.fallbackNote')}
        </p>
      )}
      {received.some((s) => s.stale) && (
        <p className={NOTE_CLASS}>
          {t('history.staleNote')}
        </p>
      )}

      {isLoading && <p className={STATUS_CLASS}>{t('history.loading')}</p>}

      {error && (
        <div className="space-y-3 px-0.5 py-2">
          <Alert variant="inline">{t('history.loadError', { error })}</Alert>
          <Button size="sm" variant="outline" onClick={onRetry}>
            <RotateCw className="h-3.5 w-3.5" />
            {t('common.retry')}
          </Button>
        </div>
      )}

      {data && !hasPicks && !hasEvents && (
        <p className={STATUS_CLASS}>{t('history.empty')}</p>
      )}

      {data && selected && hasPicks && (
        <div>
          <h3 className={`${SUBHEADING_CLASS} text-primary`}>{t('history.section.selected')}</h3>
          <EntryList
            section={{ ...selected, items: onlySelected }}
            month={data.date.month}
            day={data.date.day}
            attribution={data.attribution}
            compact
            insightFor={insightFor}
          />
        </div>
      )}

      {data && events && hasEvents && (
        <div className={hasPicks ? 'mt-5' : undefined}>
          {hasPicks && (
            <h3 className={`${SUBHEADING_CLASS} text-muted-foreground`}>
              {t('history.subheadingAllEvents')}
            </h3>
          )}
          <EntryList
            section={events}
            month={data.date.month}
            day={data.date.day}
            attribution={data.attribution}
            compact
            centuryHeadings={hasPicks ? 'h4' : 'h3'}
            featured={featured}
            countryFor={countryFor}
            insightFor={insightFor}
          />
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
