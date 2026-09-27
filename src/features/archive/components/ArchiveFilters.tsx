import { useTranslation } from 'react-i18next';
import { SECTION_LABEL_KEYS, SECTION_ORDER, type HistoryLanguage } from '@/features/history';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { SegmentedGroup } from '@/components/ui/SegmentedGroup';
import { daysInMonth, monthNames } from '@/lib/months';
import type { ArchiveFilters as ArchiveFiltersState } from '../types';
import { YearRangeFields } from './YearRangeFields';

const LABEL_CLASS = 'mb-1.5 block font-display text-eyebrow uppercase text-muted-foreground';

// UI-chrome strings, translated per active language ("Inglese" becomes
// "Englisch" in the German UI) — a different concept from the endonyms in
// src/i18n/languages.ts, which never translate.
const LANGUAGES: readonly { code: HistoryLanguage; labelKey: string }[] = [
  { code: 'it', labelKey: 'archive.filters.languageItalian' },
  { code: 'en', labelKey: 'archive.filters.languageEnglish' },
];

interface ArchiveFiltersProps {
  filters: ArchiveFiltersState;
  onChange: (patch: Partial<ArchiveFiltersState>) => void;
  onReset: () => void;
}

export function ArchiveFilters({ filters, onChange, onReset }: ArchiveFiltersProps) {
  const { t, i18n } = useTranslation();
  const months = monthNames(i18n.language);
  const dayOptions = Array.from({ length: daysInMonth(filters.month) }, (_, i) => i + 1);

  function toggleType(key: (typeof SECTION_ORDER)[number]) {
    const active = new Set(filters.types);
    if (active.has(key)) {
      // Always keep at least one type selected — an empty set would just
      // silently show nothing, with no clue why.
      if (active.size === 1) return;
      active.delete(key);
    } else {
      active.add(key);
    }
    onChange({ types: SECTION_ORDER.filter((k) => active.has(k)) });
  }

  return (
    <Card padding="sm" className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <span className={LABEL_CLASS} id="archive-date-label">
            {t('archive.filters.dayLabel')}
          </span>
          <div className="grid grid-cols-[1fr_auto] gap-2" role="group" aria-labelledby="archive-date-label">
            <div>
              <label htmlFor="archive-month" className="sr-only">
                {t('archive.filters.monthSrLabel')}
              </label>
              <Select
                id="archive-month"
                value={filters.month}
                onChange={(e) => onChange({ month: Number(e.target.value) })}
              >
                {months.slice(1).map((name, index) => (
                  <option key={name} value={index + 1}>
                    {name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label htmlFor="archive-day" className="sr-only">
                {t('archive.filters.daySrLabel')}
              </label>
              <Select
                id="archive-day"
                value={filters.day}
                onChange={(e) => onChange({ day: Number(e.target.value) })}
                className="w-20"
              >
                {dayOptions.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        <div>
          <span className={LABEL_CLASS} id="archive-years-label">
            {t('archive.filters.yearsLabel')}
          </span>
          <div aria-labelledby="archive-years-label">
            <YearRangeFields
              fromYear={filters.fromYear}
              toYear={filters.toYear}
              onChange={onChange}
            />
          </div>
        </div>
      </div>

      <fieldset>
        <legend className={LABEL_CLASS}>{t('archive.filters.typeLegend')}</legend>
        <div className="flex flex-wrap gap-x-5 gap-y-1">
          {SECTION_ORDER.map((key) => (
            <label key={key} className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={filters.types.includes(key)}
                onChange={() => toggleType(key)}
                className="h-4 w-4 accent-primary"
              />
              {t(SECTION_LABEL_KEYS[key])}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className={LABEL_CLASS} id="archive-lang-label">
            {t('archive.filters.languageLegend')}
          </span>
          <SegmentedGroup
            value={filters.lang}
            onChange={(lang) => onChange({ lang })}
            options={LANGUAGES.map(({ code, labelKey }) => ({ value: code, label: t(labelKey) }))}
            ariaLabel={t('archive.filters.languageLegend')}
          />
        </div>

        <div className="min-w-[14rem] flex-1">
          <label htmlFor="archive-query" className={LABEL_CLASS}>
            {t('archive.filters.searchLabel')}
          </label>
          <Input
            id="archive-query"
            type="search"
            value={filters.query}
            onChange={(e) => onChange({ query: e.target.value })}
            placeholder={t('archive.filters.searchPlaceholder')}
          />
        </div>

        <Button type="button" variant="outline" size="sm" onClick={onReset}>
          {t('archive.filters.reset')}
        </Button>
      </div>
    </Card>
  );
}
