import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { fetchTimelineCountries, type HistoryLanguage } from '@/features/history';
import { localizedCountryName } from '@/features/map/data';
import { useKeyedFetch } from '@/hooks/useFetchState';

// How many countries to offer as a first step.
const SUGGESTED = 6;

interface CountrySuggestionsProps {
  language: HistoryLanguage;
  onPick: (country: string) => void;
}

// The page before a country is chosen: an invitation, not an empty box. It says
// what the page does and offers the countries with the most events as a first
// click. The list is the same request the country picker makes (the answer is
// cached for five minutes, so the browser does not ask twice).
export function CountrySuggestions({ language, onPick }: CountrySuggestionsProps) {
  const { t, i18n } = useTranslation();
  const { data } = useKeyedFetch(language, fetchTimelineCountries);
  const top = useMemo(
    () =>
      [...(data ?? [])]
        .sort((a, b) => b.eventCount - a.eventCount)
        .slice(0, SUGGESTED)
        .map(({ countryCode, eventCount }) => ({
          code: countryCode,
          events: eventCount,
          name: localizedCountryName(countryCode, countryCode, i18n.language),
        })),
    [data, i18n.language],
  );

  return (
    <section className="space-y-5 py-4">
      <p className="max-w-xl font-display text-2xl leading-snug">{t('century.pickCountry')}</p>
      {top.length > 0 && (
        <div>
          <h2 className="text-eyebrow text-muted-foreground">{t('century.startWith')}</h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {top.map(({ code, events, name }) => (
              <li key={code}>
                <Button type="button" variant="outline" onClick={() => onPick(code)}>
                  {t('century.countryOption', { name, events })}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
