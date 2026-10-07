import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { hasFilters, type PathFilters as Filters, type TopicOption } from '../lib/pathFilters';
import { topicName } from '../lib/pathText';

const LABEL_CLASS = 'mb-1.5 block text-eyebrow text-muted-foreground';

interface PathFiltersProps {
  filters: Filters;
  // The topics there are, with how many of their paths match the search (see topicOptions).
  options: readonly TopicOption[];
  // How many paths the filters leave.
  shown: number;
  onChange: (patch: Partial<Filters>) => void;
  onReset: () => void;
}

// A ruled strip over the list, like Il mio secolo's: a search box and the topic, and how many
// paths are left, said aloud when it changes. No boxes (DESIGN.md, The Flat Rule).
export function PathFilters({ filters, options, shown, onChange, onReset }: PathFiltersProps) {
  const { t } = useTranslation();
  const searchId = useId();
  const topicId = useId();

  return (
    <div className="space-y-3 border-y border-border py-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={searchId} className={LABEL_CLASS}>
            {t('paths.filters.searchLabel')}
          </label>
          <Input
            id={searchId}
            type="search"
            value={filters.query}
            placeholder={t('paths.filters.searchPlaceholder')}
            onChange={(e) => onChange({ query: e.target.value })}
          />
        </div>
        {options.length > 0 && (
          <div>
            <label htmlFor={topicId} className={LABEL_CLASS}>
              {t('paths.filters.topicLabel')}
            </label>
            <Select id={topicId} value={filters.topic ?? ''} onChange={(e) => onChange({ topic: e.target.value || null })}>
              <option value="">{t('paths.filters.allTopics')}</option>
              {options.map(({ code, label, count }) => (
                <option key={code} value={code}>
                  {t('paths.filters.topicOption', { name: topicName(t, code, label), count })}
                </option>
              ))}
            </Select>
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
          {t('paths.filters.count', { count: shown })}
        </p>
        {hasFilters(filters) && (
          <Button type="button" variant="outline" size="sm" onClick={onReset}>
            {t('paths.filters.clear')}
          </Button>
        )}
      </div>
    </div>
  );
}
