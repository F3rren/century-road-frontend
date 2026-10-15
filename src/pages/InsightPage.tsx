import { RotateCw } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/button';
import { PATHS_ROUTE, useInsight } from '@/features/history';
import { InsightView } from '@/features/insights';
import { usePageMeta } from '@/hooks/usePageMeta';

const LINK_CLASS =
  'inline-flex min-h-11 items-center text-sm font-bold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export function InsightPage() {
  const { t } = useTranslation();
  const { slug = '' } = useParams();
  const { data, isLoading, error, retry } = useInsight(slug);
  usePageMeta(data?.title ?? t('nav.paths'), data?.summary ?? t('meta.paths.description'));

  if (data) return <InsightView insight={data} />;

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-3xl space-y-6 pb-8">
        <Link to={PATHS_ROUTE} className={LINK_CLASS}>
          {t('paths.back')}
        </Link>
        {isLoading && <p className="text-sm text-muted-foreground">{t('common.loading')}</p>}
        {error && (
          <div className="space-y-3">
            <Alert>{t('insights.loadError', { error })}</Alert>
            <Button size="sm" variant="outline" onClick={retry}>
              <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
              {t('common.retry')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
