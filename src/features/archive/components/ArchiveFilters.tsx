import { SECTION_LABELS, SECTION_ORDER, type HistoryLanguage } from '@/features/history';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { daysInMonth, MONTH_NAMES } from '@/lib/months';
import type { ArchiveFilters as ArchiveFiltersState } from '../types';
import { YearRangeFields } from './YearRangeFields';

const LABEL_CLASS = 'mb-1.5 block font-display text-eyebrow uppercase text-muted-foreground';
const FIELD_CLASS =
  'min-h-11 w-full border border-input bg-background px-2 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

const LANGUAGES: readonly { code: HistoryLanguage; label: string }[] = [
  { code: 'it', label: 'Italiano' },
  { code: 'en', label: 'Inglese' },
];

interface ArchiveFiltersProps {
  filters: ArchiveFiltersState;
  onChange: (patch: Partial<ArchiveFiltersState>) => void;
  onReset: () => void;
}

export function ArchiveFilters({ filters, onChange, onReset }: ArchiveFiltersProps) {
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
    <div className="space-y-5 border border-border p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <span className={LABEL_CLASS} id="archive-date-label">
            Giorno
          </span>
          <div className="grid grid-cols-[1fr_auto] gap-2" role="group" aria-labelledby="archive-date-label">
            <div>
              <label htmlFor="archive-month" className="sr-only">
                Mese
              </label>
              <select
                id="archive-month"
                value={filters.month}
                onChange={(e) => onChange({ month: Number(e.target.value) })}
                className={FIELD_CLASS}
              >
                {MONTH_NAMES.slice(1).map((name, index) => (
                  <option key={name} value={index + 1}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="archive-day" className="sr-only">
                Giorno del mese
              </label>
              <select
                id="archive-day"
                value={filters.day}
                onChange={(e) => onChange({ day: Number(e.target.value) })}
                className={cn(FIELD_CLASS, 'w-20')}
              >
                {dayOptions.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div>
          <span className={LABEL_CLASS} id="archive-years-label">
            Anni (opzionale)
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
        <legend className={LABEL_CLASS}>Tipo di voce</legend>
        <div className="flex flex-wrap gap-x-5 gap-y-1">
          {SECTION_ORDER.map((key) => (
            <label key={key} className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={filters.types.includes(key)}
                onChange={() => toggleType(key)}
                className="h-4 w-4 accent-primary"
              />
              {SECTION_LABELS[key]}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className={LABEL_CLASS} id="archive-lang-label">
            Lingua
          </span>
          <div
            role="group"
            aria-labelledby="archive-lang-label"
            className="inline-flex divide-x divide-border border border-input"
          >
            {LANGUAGES.map(({ code, label }) => (
              <button
                key={code}
                type="button"
                aria-pressed={filters.lang === code}
                onClick={() => onChange({ lang: code })}
                className={cn(
                  'min-h-11 px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  filters.lang === code
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background text-muted-foreground hover:text-foreground',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="min-w-[14rem] flex-1">
          <label htmlFor="archive-query" className={LABEL_CLASS}>
            Cerca nei risultati
          </label>
          <input
            id="archive-query"
            type="search"
            value={filters.query}
            onChange={(e) => onChange({ query: e.target.value })}
            placeholder="Una parola nel testo o in un articolo…"
            className={FIELD_CLASS}
          />
        </div>

        <Button type="button" variant="outline" size="sm" onClick={onReset}>
          Azzera i filtri
        </Button>
      </div>
    </div>
  );
}
