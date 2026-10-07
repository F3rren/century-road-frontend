import { useMemo } from 'react';
import { RotateCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/PageHeader';
import { EditorialNotice, usePaths, useStartHere } from '@/features/history';
import { LegalSection } from '@/features/legal';
import {
  filterPaths,
  GroupedPathList,
  groupByTopic,
  hasFilters,
  NO_FILTERS,
  PathFilters,
  StartHereList,
  topicOptions,
  usePathFilters,
} from '@/features/paths';
import { usePageMeta } from '@/hooks/usePageMeta';

// Below this the list is short enough to read whole, and a search box over four rows is noise.
const MIN_PATHS_TO_FILTER = 8;

// The way in for a visitor who does not know where to begin: a few proposals picked by an editor,
// and then every guided path, grouped by topic and searchable. All of it answers from the
// backend's own memory, so it works when Wikipedia does not.
export function PathsPage() {
  const { t } = useTranslation();
  usePageMeta(t('nav.paths'), t('meta.paths.description'));
  const startHere = useStartHere();
  const paths = usePaths();
  const { filters, update } = usePathFilters();

  const all = paths.data;
  const visible = useMemo(() => (all ? filterPaths(all, filters) : []), [all, filters]);
  const groups = useMemo(() => groupByTopic(visible), [visible]);
  const options = useMemo(() => (all ? topicOptions(all, filters.query, filters.topic) : []), [all, filters]);
  const showFilters = all !== null && (all.length >= MIN_PATHS_TO_FILTER || hasFilters(filters));

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-3xl space-y-8 pb-8">
        <PageHeader title={t('nav.paths')} description={t('paths.pageDescription')} />
        <EditorialNotice />

        <LegalSection title={t('paths.startHere')}>
          {startHere.isLoading && <p className="text-sm text-muted-foreground">{t('common.loading')}</p>}
          {startHere.error && (
            <div className="space-y-3">
              <Alert variant="inline">{t('paths.loadError', { error: startHere.error })}</Alert>
              <Button size="sm" variant="outline" onClick={startHere.retry}>
                <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
                {t('common.retry')}
              </Button>
            </div>
          )}
          {startHere.data && <StartHereList items={startHere.data} />}
        </LegalSection>

        <LegalSection title={t('paths.browse')}>
          {paths.isLoading && <p className="text-sm text-muted-foreground">{t('common.loading')}</p>}
          {paths.error && (
            <div className="space-y-3">
              <Alert variant="inline">{t('paths.loadError', { error: paths.error })}</Alert>
              <Button size="sm" variant="outline" onClick={paths.retry}>
                <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
                {t('common.retry')}
              </Button>
            </div>
          )}
          {all && all.length === 0 && <p className="text-sm text-muted-foreground">{t('paths.empty')}</p>}
          {showFilters && (
            <PathFilters
              filters={filters}
              options={options}
              shown={visible.length}
              onChange={update}
              onReset={() => update(NO_FILTERS)}
            />
          )}
          {/* The strip above already offers "clear" whenever a filter is on. */}
          {all && all.length > 0 && visible.length === 0 && (
            <p className="py-2 text-sm text-muted-foreground">{t('paths.filters.noMatches')}</p>
          )}
          {visible.length > 0 && <GroupedPathList groups={groups} />}
        </LegalSection>
      </div>
    </div>
  );
}
