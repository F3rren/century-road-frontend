import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
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
import { Alert } from '@/components/ui/Alert';
import type { ArchiveFilters } from '../types';

const STATUS_CLASS = 'px-0.5 py-2 text-sm text-muted-foreground';
const NOTE_CLASS = 'px-0.5 pb-2 text-xs text-muted-foreground';
const HEADING_CLASS = 'mb-1 text-eyebrow text-muted-foreground';

interface ArchiveResultsProps {
  filters: ArchiveFilters;
  // Empties the search box, offered when the search matches nothing.
  onClearQuery: () => void;
}

export function ArchiveResults({ filters, onClearQuery }: ArchiveResultsProps) {
  const { t } = useTranslation();

  // No debounce here: YearRangeFields already debounces raw typed text 500ms before
  // committing to filters.fromYear/toYear, so by the time either changes it has
  // already been stable for 500ms — a second debounce here would only double the
  // latency with nothing left to guard against.
  const params = useMemo<OnThisDayParams>(
    () => ({
      month: filters.month,
      day: filters.day,
      lang: filters.lang,
      types: filters.types,
      fromYear: filters.fromYear ?? undefined,
      toYear: filters.toYear ?? undefined,
    }),
    [filters.month, filters.day, filters.lang, filters.types, filters.fromYear, filters.toYear],
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

      {error && <Alert>{t('archive.results.loadError', { error })}</Alert>}

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
        <div className="space-y-2 py-2">
          <p className="text-sm text-muted-foreground">{t('archive.results.noMatches', { query })}</p>
          <Button type="button" variant="outline" size="sm" onClick={onClearQuery}>
            {t('archive.results.clearSearch')}
          </Button>
        </div>
      )}

      {data &&
        sections.map(({ key, section }) =>
          // A section with nothing matching the search keeps no heading of its own.
          section.items.length === 0 || (query && !section.items.some((entry) => matchesQuery(entry, query))) ? null : (
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
