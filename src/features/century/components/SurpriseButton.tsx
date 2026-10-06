import { useState } from 'react';
import { Shuffle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/button';
import {
  archiveEventRoute,
  buildRandomEventPath,
  fetchRandomEvent,
  type HistoryLanguage,
} from '@/features/history';
import { describeFetchError } from '@/hooks/useFetchState';
import type { CenturyParams } from '../lib/centuryParams';

interface SurpriseButtonProps {
  params: CenturyParams;
  language: HistoryLanguage;
}

type Outcome = { kind: 'idle' } | { kind: 'loading' } | { kind: 'none' } | { kind: 'error'; message: string };

// "Sorprendimi": one event picked at random from the country index among those that match the
// filters in force here (the country, if one is chosen, and the years), opened in the archive on
// its day and year, like any row of the timeline. When nothing matches, it says so and keeps the
// reader where they are: an empty answer is a 200, not an error.
export function SurpriseButton({ params, language }: SurpriseButtonProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [outcome, setOutcome] = useState<Outcome>({ kind: 'idle' });

  async function handleClick() {
    setOutcome({ kind: 'loading' });
    try {
      const data = await fetchRandomEvent(
        buildRandomEventPath({
          lang: language,
          country: params.country ?? undefined,
          fromYear: params.fromYear ?? undefined,
          toYear: params.toYear ?? undefined,
        }),
      );
      if (!data.event) {
        setOutcome({ kind: 'none' });
        return;
      }
      navigate(archiveEventRoute(data.event, data.language));
    } catch (error) {
      setOutcome({ kind: 'error', message: describeFetchError(error) });
    }
  }

  return (
    <>
      <Button type="button" variant="outline" disabled={outcome.kind === 'loading'} onClick={handleClick}>
        <Shuffle className="h-4 w-4" aria-hidden="true" />
        {t('century.surprise.button')}
      </Button>
      <div aria-live="polite" className="basis-full empty:hidden">
        {outcome.kind === 'loading' && <p className="text-sm text-muted-foreground">{t('century.surprise.loading')}</p>}
        {outcome.kind === 'none' && <p className="text-sm text-muted-foreground">{t('century.surprise.none')}</p>}
        {outcome.kind === 'error' && (
          <Alert variant="inline">{t('century.surprise.error', { error: outcome.message })}</Alert>
        )}
      </div>
    </>
  );
}
