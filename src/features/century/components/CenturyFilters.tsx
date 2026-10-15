import { useMemo } from 'react';
import { Printer } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/Select';
import { YearRangeFields } from '@/features/archive';
import { Surprise } from '@/features/discovery';
import { fetchTimelineCountries, type HistoryLanguage } from '@/features/history';
import { localizedCountryName } from '@/features/map/data';
import { useKeyedFetch } from '@/hooks/useFetchState';
import type { CenturyParams } from '../lib/centuryParams';

const LABEL_CLASS = 'mb-1.5 block text-eyebrow text-muted-foreground';

interface CenturyFiltersProps {
  params: CenturyParams;
  language: HistoryLanguage;
  onChange: (patch: Partial<CenturyParams>) => void;
}

export function CenturyFilters({ params, language, onChange }: CenturyFiltersProps) {
  const { t, i18n } = useTranslation();
  // Only countries the index actually has events for, named in the UI language by the
  // browser's own locale data - no country shapes needed on this page.
  const { data, isLoading, error } = useKeyedFetch(language, fetchTimelineCountries);
  const countries = useMemo(
    () =>
      (data ?? [])
        .map(({ countryCode, eventCount }) => ({
          code: countryCode,
          events: eventCount,
          name: localizedCountryName(countryCode, countryCode, i18n.language),
        }))
        .sort((a, b) => a.name.localeCompare(b.name, i18n.language)),
    [data, i18n.language],
  );

  return (
    <div className="space-y-4 border-y border-border py-5 print:hidden">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="century-country" className={LABEL_CLASS}>
            {t('century.countryLabel')}
          </label>
          <Select
            id="century-country"
            value={params.country ?? ''}
            disabled={isLoading || countries.length === 0}
            onChange={(e) => onChange({ country: e.target.value || null })}
          >
            <option value="" disabled>
              {isLoading ? t('common.loading') : t('century.countryPlaceholder')}
            </option>
            {countries.map(({ code, events, name }) => (
              <option key={code} value={code}>
                {t('century.countryOption', { name, events })}
              </option>
            ))}
          </Select>
          {/* With a country chosen, the timeline below already reports the same outage. */}
          {error && params.country === null && (
            <Alert variant="inline" className="mt-1">
              {t('century.countriesLoadError', { error })}
            </Alert>
          )}
          {!isLoading && !error && countries.length === 0 && (
            <p className="mt-1 text-xs text-muted-foreground">{t('century.indexEmpty')}</p>
          )}
        </div>
        <div>
          <span className={LABEL_CLASS} id="century-years-label">
            {t('century.yearsLabel')}
          </span>
          <div aria-labelledby="century-years-label">
            <YearRangeFields fromYear={params.fromYear} toYear={params.toYear} onChange={onChange} />
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <Surprise lang={language} country={params.country} fromYear={params.fromYear} toYear={params.toYear} />
        <Button type="button" variant="outline" disabled={params.country === null} onClick={() => window.print()}>
          <Printer className="h-4 w-4" aria-hidden="true" />
          {t('century.print')}
        </Button>
      </div>
    </div>
  );
}
