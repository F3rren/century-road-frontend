import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

const YEAR_DEBOUNCE_MS = 500;
const FIELD_CLASS =
  'min-h-11 w-full border border-input bg-background px-2 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

interface YearRangeFieldsProps {
  fromYear: number | null;
  toYear: number | null;
  onChange: (patch: { fromYear: number | null; toYear: number | null }) => void;
}

function parseYearInput(raw: string): number | null {
  if (raw === '' || raw === '-') return null;
  const value = Number(raw);
  return Number.isInteger(value) ? value : null;
}

function toInputValue(year: number | null): string {
  return year === null ? '' : String(year);
}

// Local text state, not a value bound straight to the filters: every
// keystroke here would otherwise fire a network request through
// ArchiveResults' debounce, and a lone "-" (typing a BCE year) isn't a valid
// number to hold as `fromYear`/`toYear` yet. Remounted (via the parent's
// `key`) whenever filters reset from outside typing, so this never goes stale.
export function YearRangeFields({ fromYear, toYear, onChange }: YearRangeFieldsProps) {
  const { t } = useTranslation();
  const [fromText, setFromText] = useState(() => toInputValue(fromYear));
  const [toText, setToText] = useState(() => toInputValue(toYear));
  const debouncedFrom = useDebouncedValue(fromText, YEAR_DEBOUNCE_MS);
  const debouncedTo = useDebouncedValue(toText, YEAR_DEBOUNCE_MS);
  // Only true once the person has actually typed in one of these fields —
  // set directly inside the input handlers below, not inferred from effect
  // timing. A "skip the first run" ref counting invocations isn't enough:
  // StrictMode runs effects twice in dev, and the second simulated run would
  // see that guard already spent. Without this, every page load (and every
  // "Azzera i filtri") would fire onChange ~500ms in with the exact value it
  // already had — harmless data, but a spurious rewrite of the page's URL.
  const hasEdited = useRef(false);

  useEffect(() => {
    if (!hasEdited.current) return;
    onChange({ fromYear: parseYearInput(debouncedFrom), toYear: parseYearInput(debouncedTo) });
    // Committing what's already been typed; onChange's identity changing
    // between renders isn't a reason to re-fire this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFrom, debouncedTo]);

  return (
    <div className="grid grid-cols-2 gap-2">
      <div>
        <label htmlFor="archive-year-from" className="sr-only">
          {t('archive.filters.yearFromSr')}
        </label>
        <input
          id="archive-year-from"
          type="text"
          inputMode="numeric"
          placeholder={t('archive.filters.yearFromPlaceholder')}
          value={fromText}
          onChange={(e) => {
            if (!/^-?\d*$/.test(e.target.value)) return;
            hasEdited.current = true;
            setFromText(e.target.value);
          }}
          className={FIELD_CLASS}
        />
      </div>
      <div>
        <label htmlFor="archive-year-to" className="sr-only">
          {t('archive.filters.yearToSr')}
        </label>
        <input
          id="archive-year-to"
          type="text"
          inputMode="numeric"
          placeholder={t('archive.filters.yearToPlaceholder')}
          value={toText}
          onChange={(e) => {
            if (!/^-?\d*$/.test(e.target.value)) return;
            hasEdited.current = true;
            setToText(e.target.value);
          }}
          className={FIELD_CLASS}
        />
      </div>
    </div>
  );
}
