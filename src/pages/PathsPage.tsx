import { RotateCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/PageHeader';
import { EditorialNotice, usePaths, useStartHere } from '@/features/history';
import { LegalSection } from '@/features/legal';
import { PathList, StartHereList } from '@/features/paths';
import { usePageMeta } from '@/hooks/usePageMeta';

// The way in for a visitor who does not know where to begin: a few proposals picked by hand, and
// then every guided path. All of it is written by hand and answers from the backend's own
// memory, so it works when Wikipedia does not.
export function PathsPage() {
  const { t } = useTranslation();
  usePageMeta(t('nav.paths'), t('meta.paths.description'));
  const startHere = useStartHere();
  const paths = usePaths();

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

        <LegalSection title={t('paths.all')}>
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
          {paths.data && paths.data.length === 0 && <p className="text-sm text-muted-foreground">{t('paths.empty')}</p>}
          {paths.data && paths.data.length > 0 && <PathList paths={paths.data} />}
        </LegalSection>
      </div>
    </div>
  );
}
