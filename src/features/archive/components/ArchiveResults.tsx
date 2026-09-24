import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AttributionNotice,
  EntryList,
  SECTION_LABEL_KEYS,
  SECTION_ORDER,
  matchesQuery,
  useOnThisDay,
  type HistorySectionKey,
  type OnThisDayParams,
  type SectionResult,
} from '@/features/history';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import type { ArchiveFilters } from '../types';

// Year-range changes fire on every keystroke of the filter fields; waiting a
// beat before refetching avoids sending one request per digit typed. Every
// other filter (date, type, language) is a discrete control (a select, a
// checkbox, a button), so it applies immediately — only free typing needs this.
const YEAR_DEBOUNCE_MS = 500;

const STATUS_CLASS = 'px-0.5 py-2 text-sm italic text-muted-foreground';
const NOTE_CLASS = 'px-0.5 pb-2 text-xs text-muted-foreground';
const HEADING_CLASS = 'mb-1 font-display text-eyebrow uppercase text-muted-foreground';

interface ArchiveResultsProps {
  filters: ArchiveFilters;
}

export function ArchiveResults({ filters }: ArchiveResultsProps) {
  const { t } = useTranslation();
  const fromYear = useDebouncedValue(filters.fromYear, YEAR_DEBOUNCE_MS);
  const toYear = useDebouncedValue(filters.toYear, YEAR_DEBOUNCE_MS);

  const params = useMemo<OnThisDayParams>(
    () => ({
      month: filters.month,
      day: filters.day,
      lang: filters.lang,
      types: filters.types,
      fromYear: fromYear ?? undefined,
      toYear: toYear ?? undefined,
    }),
    [filters.month, filters.day, filters.lang, filters.types, fromYear, toYear],
  );

  const { isLoading, data, error } = useOnThisDay(params);

  const sections = useMemo(() => {
    if (!data) return [];
    const result: { key: HistorySectionKey; section: SectionResult }[] = [];
    for (const key of SECTION_ORDER) {
      if (!filters.types.includes(key)) continue;
      const section = data.sections[key];
      if (section) result.push({ key, section });
    }
    return result;
  }, [data, filters.types]);

  const totalEntries = sections.reduce((sum, { section }) => sum + section.items.length, 0);
  const query = filters.query.trim();
  const matchingEntries = query
    ? sections.reduce(
        (sum, { section }) => sum + section.items.filter((entry) => matchesQuery(entry, query)).length,
        0,
      )
    : totalEntries;

  return (
    <div className="space-y-6" aria-live="polite">
      {isLoading && <p className={STATUS_CLASS}>{t('archive.results.loading')}</p>}

      {error && (
        <p role="alert" className="border border-destructive p-4 text-sm text-destructive">
          {t('archive.results.loadError', { error })}
        </p>
      )}

      {data && sections.some(({ section }) => section.fallback) && (
        <p className={NOTE_CLASS}>
          {t('archive.results.fallbackNote')}
        </p>
      )}
      {data && sections.some(({ section }) => section.stale) && (
        <p className={NOTE_CLASS}>{t('archive.results.staleNote')}</p>
      )}

      {data && totalEntries === 0 && (
        <p className={STATUS_CLASS}>{t('archive.results.empty')}</p>
      )}

      {data && totalEntries > 0 && query && matchingEntries === 0 && (
        <p className={STATUS_CLASS}>{t('archive.results.noMatches', { query })}</p>
      )}

      {data &&
        sections.map(({ key, section }) =>
          section.items.length === 0 ? null : (
            <div key={key}>
              <h2 className={HEADING_CLASS}>{t(SECTION_LABEL_KEYS[key])}</h2>
              <EntryList
                section={section}
                month={data.date.month}
                day={data.date.day}
                attribution={data.attribution}
                query={filters.query}
              />
            </div>
          ),
        )}

      {data && (
        <div className="border-t border-border pt-3">
          <AttributionNotice attribution={data.attribution} />
        </div>
      )}
    </div>
  );
}
