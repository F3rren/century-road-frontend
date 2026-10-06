import { RotateCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/button';
import {
  archiveEventRoute,
  AttributionNotice,
  cleanText,
  useSamePeriod,
  YearMark,
} from '@/features/history';
import { LegalSection } from '@/features/legal';
import { localizedCountryName } from '@/features/map/data';
import { deriveContentLanguage } from '@/i18n/contentLanguage';
import { formatEventDate, formatYear } from '@/lib/months';

interface SamePeriodProps {
  // The year at the centre of the window.
  year: number;
  // The country being looked at: the comparison is with the others.
  excludeCountry?: string;
}

// "Nello stesso periodo": what the country index has for the years around an event, in other
// countries. A comparison in time and nothing more, and it says how thin the data can be: the
// backend's own notice and coverage note are shown at every level, and a window with little in
// it is "poco materiale", never "nothing happened".
export function SamePeriod({ year, excludeCountry }: SamePeriodProps) {
  const { t, i18n } = useTranslation();
  const language = deriveContentLanguage(i18n.language);
  const { data, isLoading, error, retry } = useSamePeriod({ year, lang: language, excludeCountry });

  return (
    <LegalSection title={t('samePeriod.title')}>
      {isLoading && <p className="text-sm text-muted-foreground">{t('common.loading')}</p>}

      {error && (
        <div className="space-y-3">
          <Alert variant="inline">{t('samePeriod.loadError', { error })}</Alert>
          <Button size="sm" variant="outline" onClick={retry}>
            <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
            {t('common.retry')}
          </Button>
        </div>
      )}

      {data && (
        <>
          <p>
            {t('samePeriod.intro', {
              year: formatYear(data.year, i18n.language),
              from: formatYear(data.fromYear, i18n.language),
              to: formatYear(data.toYear, i18n.language),
            })}
          </p>
          <div lang="it" className="space-y-1 text-sm text-muted-foreground">
            <p>{data.notice}</p>
            <p>{data.coverage.note}</p>
          </div>
          <p className="text-sm font-bold">
            {data.coverage.level === 'NONE' && t('samePeriod.level.NONE')}
            {data.coverage.level === 'SPARSE' && t('samePeriod.level.SPARSE')}
            {data.coverage.level === 'OK' &&
              t('samePeriod.level.OK', { events: data.coverage.eventCount, countries: data.coverage.countryCount })}
          </p>

          {data.countries.map((country) => {
            const name = localizedCountryName(country.countryCode, country.countryCode, i18n.language);
            return (
              <div key={country.countryCode} className="border-t border-border pt-3">
                <h3 className="font-display text-base font-semibold">
                  {t('samePeriod.country', { country: name, count: country.eventCount })}
                </h3>
                <ol lang={data.language} className="mt-1 divide-y divide-border">
                  {country.events.map((event, index) => (
                    <li key={`${event.year}-${event.month}-${event.day}-${index}`} className="py-2.5">
                      <Link
                        to={archiveEventRoute(event, data.language)}
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
                <Link
                  to={`/century?${new URLSearchParams({
                    country: country.countryCode,
                    from: String(data.fromYear),
                    to: String(data.toYear),
                  })}`}
                  className="inline-flex min-h-11 items-center text-sm font-bold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {t('samePeriod.countryYears', {
                    country: name,
                    from: formatYear(data.fromYear, i18n.language),
                    to: formatYear(data.toYear, i18n.language),
                  })}
                </Link>
              </div>
            );
          })}

          <div className="border-t border-border pt-3">
            <AttributionNotice attribution={data.attribution} />
          </div>
        </>
      )}
    </LegalSection>
  );
}
