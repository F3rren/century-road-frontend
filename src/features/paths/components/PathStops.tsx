import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { insightOnMapRoute, insightRoute, PlaceLine, YearMark, type PathStop } from '@/features/history';
import { StopWhyItMatters } from './StopWhyItMatters';

const LINK_CLASS =
  'inline-flex min-h-11 items-center text-sm font-bold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

// The stops in order, the year leading each one in the margin like every list of events. A
// stop's own text is the insight with the stop's slug: its "Perché conta" opens under the stop
// when asked for, and its own page is one link away, so a path stays short to read. `narrative`
// is the line that ties a stop to the one before.
export function PathStops({ stops }: { stops: readonly PathStop[] }) {
  const { t } = useTranslation();
  return (
    <ol className="divide-y divide-border border-y border-border">
      {stops.map((stop) => (
        <li key={stop.slug} className="py-4">
          <div className="grid grid-cols-[3.75rem_minmax(0,1fr)] gap-x-3">
            <YearMark year={stop.date.year} />
            <div lang="it">
              <p className="text-xs text-muted-foreground">
                {t('paths.stopLabel', { position: stop.position, count: stops.length })}
              </p>
              <h3 className="font-display text-lg font-semibold leading-snug">
                <Link
                  to={insightRoute(stop.slug)}
                  className="hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {stop.title}
                </Link>
              </h3>
              <p className="mt-1 font-serif text-base leading-snug">{stop.narrative}</p>
              <p className="mt-1 text-sm text-muted-foreground">{stop.summary}</p>
              <p className="mt-1 text-sm">
                <PlaceLine place={stop.place} />
              </p>
            </div>
          </div>
          <div className="mt-1 pl-[4.5rem]">
            <StopWhyItMatters slug={stop.slug} />
            <p className="flex flex-wrap gap-x-6">
              <Link to={insightRoute(stop.slug)} className={LINK_CLASS}>
                {t('paths.fullInsight')}
              </Link>
              <Link to={insightOnMapRoute(stop.slug)} className={LINK_CLASS}>
                {t('paths.onMap')}
              </Link>
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
