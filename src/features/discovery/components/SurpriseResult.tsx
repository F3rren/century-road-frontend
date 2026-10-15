import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Alert } from '@/components/ui/Alert';
import { archiveEventRoute, AttributionNotice, cleanText, YearMark } from '@/features/history';
import { localizedCountryName } from '@/features/map/data';
import { formatEventDate } from '@/lib/months';
import { cn } from '@/lib/utils';
import type { SurpriseOutcome } from '../hooks/useSurprise';

const LINK_CLASS =
  'inline-flex min-h-11 items-center text-sm font-bold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

type Found = Extract<SurpriseOutcome, { kind: 'found' }>['data'];

function FoundEvent({ data, compact }: { data: Found; compact: boolean }) {
  const { t, i18n } = useTranslation();
  const { event, language, attribution } = data;
  const country = localizedCountryName(event.countryCode, event.countryCode, i18n.language);
  return (
    <article className="space-y-2 border-y border-border py-3">
      <div
        lang={language}
        className={cn('grid gap-x-3', compact ? 'grid-cols-[2.75rem_minmax(0,1fr)]' : 'grid-cols-[3.75rem_minmax(0,1fr)]')}
      >
        <YearMark year={event.year} compact={compact} />
        <p className={cn('font-serif leading-snug', compact ? 'text-sm' : 'text-base')}>{cleanText(event.text)}</p>
      </div>
      <p className="text-xs text-muted-foreground">
        {t('discovery.surprise.dateAndCountry', {
          date: formatEventDate(event.day, event.month, undefined, i18n.language),
          country,
        })}
      </p>
      <p className="flex flex-wrap gap-x-5">
        <Link to={archiveEventRoute(event, language)} className={LINK_CLASS}>
          {t('history.dialog.archiveDay')}
        </Link>
        <Link
          to={`/century?${new URLSearchParams({ country: event.countryCode, from: '', to: '' })}`}
          className={LINK_CLASS}
        >
          {t('history.dialog.countryYear', { country })}
        </Link>
        <Link to={`/?${new URLSearchParams({ country: event.countryCode })}`} className={LINK_CLASS}>
          {t('discovery.surprise.onMap', { country })}
        </Link>
      </p>
      <AttributionNotice attribution={attribution} />
    </article>
  );
}

interface SurpriseResultProps {
  outcome: SurpriseOutcome;
  // The narrow map panel: smaller year and text.
  compact?: boolean;
  className?: string;
}

// What "Sorprendimi" drew: the event with its date and the country it is placed in, and the ways
// on from it - its day in the archive, the country's whole year, the country on the map. The
// country is shown and linked rather than dropped: the answer carries it, so it can lead on.
// Said in a live region, so a screen reader hears the answer, or that there was none.
export function SurpriseResult({ outcome, compact = false, className }: SurpriseResultProps) {
  const { t } = useTranslation();

  return (
    <div aria-live="polite" className={cn('empty:hidden', className)}>
      {outcome.kind === 'loading' && <p className="text-sm text-muted-foreground">{t('discovery.surprise.loading')}</p>}
      {outcome.kind === 'none' && <p className="text-sm text-muted-foreground">{t('discovery.surprise.none')}</p>}
      {outcome.kind === 'error' && <Alert variant="inline">{t('discovery.surprise.error', { error: outcome.message })}</Alert>}
      {outcome.kind === 'found' && <FoundEvent data={outcome.data} compact={compact} />}
    </div>
  );
}
