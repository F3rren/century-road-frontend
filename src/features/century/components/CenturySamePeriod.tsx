import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/Input';
import { SamePeriod } from '@/features/discovery';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { parseAroundYear } from '../lib/aroundYear';

interface CenturySamePeriodProps {
  // The country being read: the comparison leaves it out.
  country: string;
  // Where the field starts: the year in the middle of the events on screen.
  initialYear: number;
}

// "Nello stesso periodo" under a country's timeline: what the index has, in other countries, for
// the years around one the reader chooses. The timeline spans many years and the comparison is a
// window of at most 25 either side, so the year is the reader's to move. Not printed: on paper
// the page is the country's own year.
export function CenturySamePeriod({ country, initialYear }: CenturySamePeriodProps) {
  const { t } = useTranslation();
  const yearId = useId();
  const [text, setText] = useState(String(initialYear));
  const year = parseAroundYear(useDebouncedValue(text, 500));

  return (
    <div className="print:hidden">
      <SamePeriod
        year={year}
        excludeCountry={country}
        controls={
          <div className="max-w-[14rem]">
            <label htmlFor={yearId} className="mb-1.5 block text-eyebrow text-muted-foreground">
              {t('samePeriod.yearLabel')}
            </label>
            <Input
              id={yearId}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={text}
              aria-invalid={parseAroundYear(text) === null}
              aria-describedby={`${yearId}-hint`}
              onChange={(e) => setText(e.target.value)}
            />
            <p id={`${yearId}-hint`} className="mt-1 text-xs text-muted-foreground">
              {parseAroundYear(text) === null ? t('samePeriod.yearInvalid') : t('samePeriod.yearHint')}
            </p>
          </div>
        }
      />
    </div>
  );
}
