import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Alert } from '@/components/ui/Alert';
import { GrainChart } from '@/components/ui/GrainChart';
import {
  archiveEventRoute,
  AttributionNotice,
  buildCountryTimelinePath,
  cleanText,
  fetchCountryTimeline,
  type CountryTimelineEvent,
  type HistoryLanguage,
  YearMark,
} from '@/features/history';
import { useKeyedFetch } from '@/hooks/useFetchState';
import { CenturySamePeriod } from './CenturySamePeriod';
import { formatEventDate } from '@/lib/months';

const STATUS_CLASS = 'px-0.5 py-2 text-sm text-muted-foreground';

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
      <div className="space-y-2">
        <p className="font-display text-2xl leading-snug">
          {t('century.summary', {
            count: data.events.length,
            first: yearLabel(data.events[0].year),
            last: yearLabel(data.events[data.events.length - 1].year),
          })}
        </p>
        {data.indexedAt && (
          <p className="text-sm text-muted-foreground">
            {t('century.indexedAt', {
              date: new Intl.DateTimeFormat(i18n.language, { dateStyle: 'long' }).format(new Date(data.indexedAt)),
            })}
          </p>
        )}
      </div>

      {/* The same decades as below, as grains: where this country's history sits, and
          a way to jump to a decade. Not printed: on paper the decades simply follow. */}
      <div className="print:hidden">
        <p className="text-sm text-muted-foreground">{t('century.grainsHint')}</p>
        <GrainChart
          className="mt-4"
          columns={decades.map(([decade, events], i) => ({
            key: decade,
            count: events.length,
            gapBefore: i > 0 && decade - decades[i - 1][0] > 10,
            href: `#decade-${decade}`,
            ariaLabel: t('century.decadeColumn', { count: events.length, range: decadeLabel(decade) }),
            label: decade < 0 ? (
              <>
                {-decade}
                <span className="block">{t('date.era.bc')}</span>
              </>
            ) : (
              decade
            ),
          }))}
        />
      </div>

      {decades.map(([decade, events]) => (
        <section key={decade} id={`decade-${decade}`} aria-labelledby={`decade-${decade}-title`} className="scroll-mt-6">
          <h2
            id={`decade-${decade}-title`}
            className="break-after-avoid font-display text-xl font-semibold"
          >
            {decadeLabel(decade)}
          </h2>
          <ol lang={data.language} className="mt-2 divide-y divide-border border-t border-border">
            {events.map((event, index) => (
              <li key={`${event.year}-${event.month}-${event.day}-${index}`} className="break-inside-avoid py-2.5">
                <Link
                  to={archiveEventRoute(event, language)}
                  className="group grid grid-cols-[3.75rem_minmax(0,1fr)] gap-x-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <YearMark year={event.year} />
                  <span>
                    <span className="block font-serif text-base leading-snug group-hover:text-primary">
                      {cleanText(event.text)}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {formatEventDate(event.day, event.month, undefined, i18n.language)}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      ))}

      {/* Keyed on the country: another country starts again from its own middle year. */}
      <CenturySamePeriod
        key={country}
        country={country}
        initialYear={data.events[Math.floor(data.events.length / 2)].year}
      />

      <div className="border-t border-border pt-3">
        <AttributionNotice attribution={data.attribution} />
      </div>
    </div>
  );
}
