import { useTranslation } from 'react-i18next';

// The year as the row's main fact, set in the margin of an event list: Literata
// numerals, with the era under it before the common era. Holidays have no
// year, and keep an empty margin so the column stays aligned.
// compact: the narrow map panel, where the full-size numeral would crowd the text.
export function YearMark({ year, compact = false }: { year: number | null | undefined; compact?: boolean }) {
  const { t } = useTranslation();
  if (year === null || year === undefined) return <span aria-hidden="true" />;
  return (
    <span className={`font-display tabular-nums ${compact ? 'text-base font-semibold leading-snug' : 'text-dateline'}`}>
      {Math.abs(year)}
      {year < 0 && <span className="block text-xs font-normal text-muted-foreground">{t('date.era.bc')}</span>}
    </span>
  );
}
