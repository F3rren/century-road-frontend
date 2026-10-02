import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Alert } from '@/components/ui/Alert';
import {
  AttributionNotice,
  buildCountryTimelinePath,
  cleanText,
  fetchCountryTimeline,
  type CountryTimelineEvent,
  type HistoryLanguage,
} from '@/features/history';
import { useKeyedFetch } from '@/hooks/useFetchState';
import { formatEventDate } from '@/lib/months';

const STATUS_CLASS = 'px-0.5 py-2 text-sm italic text-muted-foreground';

interface CenturyTimelineProps {
  country: string;
  language: HistoryLanguage;
  fromYear: number | null;
  toYear: number | null;
}

function groupByDecade(events: readonly CountryTimelineEvent[]): [number, CountryTimelineEvent[]][] {
  const decades = new Map<number, CountryTimelineEvent[]>();
  for (const event of events) {
    const decade = Math.floor(event.year / 10) * 10;
    const group = decades.get(decade);
    if (group) group.push(event);
    else decades.set(decade, [event]);
  }
  return [...decades.entries()];
}

// The full entry, its articles and image credits already live in the archive: each row opens
// that day there, narrowed to the event's own year.
function archiveLink(event: CountryTimelineEvent, language: HistoryLanguage): string {
  const params = new URLSearchParams({
    month: String(event.month),
    day: String(event.day),
    from: String(event.year),
    to: String(event.year),
    types: 'events',
    lang: language,
  });
  return `/archive?${params}`;
}

export function CenturyTimeline({ country, language, fromYear, toYear }: CenturyTimelineProps) {
  const { t, i18n } = useTranslation();
  const path = buildCountryTimelinePath({ code: country, lang: language, fromYear, toYear });
  const { data, isLoading, error } = useKeyedFetch(path, fetchCountryTimeline);
  const decades = useMemo(() => groupByDecade(data?.events ?? []), [data]);

  if (isLoading) return <p className={STATUS_CLASS}>{t('common.loading')}</p>;
  if (error) return <Alert>{t('century.loadError', { error })}</Alert>;
  if (!data) return null;
  if (data.events.length === 0) return <p className={STATUS_CLASS}>{t('century.empty')}</p>;

  const yearLabel = (year: number) => (year < 0 ? `${-year} ${t('date.era.bc')}` : String(year));
  // A decade before the common era counts down: -110 holds 110 to 101 BC.
  const decadeLabel = (decade: number) =>
    decade < 0 ? `${-decade}–${-(decade + 9)} ${t('date.era.bc')}` : `${decade}–${decade + 9}`;

  return (
    <div className="space-y-8">
      <div className="space-y-1 text-sm text-muted-foreground">
        <p>
          {t('century.summary', {
            count: data.events.length,
            first: yearLabel(data.events[0].year),
            last: yearLabel(data.events[data.events.length - 1].year),
          })}
        </p>
        {data.indexedAt && (
          <p>
            {t('century.indexedAt', {
              date: new Intl.DateTimeFormat(i18n.language, { dateStyle: 'long' }).format(new Date(data.indexedAt)),
            })}
          </p>
        )}
      </div>

      {decades.map(([decade, events]) => (
        <section key={decade} aria-labelledby={`decade-${decade}`}>
          <h2
            id={`decade-${decade}`}
            className="break-after-avoid font-display text-lg font-semibold uppercase tracking-wide"
          >
            {decadeLabel(decade)}
          </h2>
          <ol lang={data.language} className="mt-2 divide-y divide-border border-t border-border">
            {events.map((event, index) => (
              <li key={`${event.year}-${event.month}-${event.day}-${index}`} className="break-inside-avoid py-2.5">
                <Link
                  to={archiveLink(event, language)}
                  className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    {formatEventDate(event.day, event.month, event.year, i18n.language)}
                  </span>
                  <span className="mt-0.5 block text-sm leading-snug group-hover:text-primary">
                    {cleanText(event.text)}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      ))}

      <div className="border-t border-border pt-3">
        <AttributionNotice attribution={data.attribution} />
      </div>
    </div>
  );
}
