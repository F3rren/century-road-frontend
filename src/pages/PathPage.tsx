import { RotateCw } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/PageHeader';
import { EditorialNotice, paragraphs, PATHS_ROUTE, ReportForm, usePath } from '@/features/history';
import { LegalSection } from '@/features/legal';
import { PathCover, PathStops } from '@/features/paths';
import { usePageMeta } from '@/hooks/usePageMeta';

const LINK_CLASS =
  'inline-flex min-h-11 items-center text-sm font-bold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export function PathPage() {
  const { t } = useTranslation();
  const { slug = '' } = useParams();
  const { data, isLoading, error, retry } = usePath(slug);
  usePageMeta(data?.title ?? t('nav.paths'), data?.tagline ?? t('meta.paths.description'));

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-3xl space-y-8 pb-8">
        <Link to={PATHS_ROUTE} className={LINK_CLASS}>
          {t('paths.back')}
        </Link>

        {isLoading && <p className="text-sm text-muted-foreground">{t('common.loading')}</p>}
        {error && (
          <div className="space-y-3">
            <Alert>{t('paths.pathLoadError', { error })}</Alert>
            <Button size="sm" variant="outline" onClick={retry}>
              <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
              {t('common.retry')}
            </Button>
          </div>
        )}

        {data && (
          <>
            <PageHeader title={data.title} description={data.tagline} lang="it" />
            <EditorialNotice />
            {data.cover && <PathCover cover={data.cover} />}
            <p className="text-sm text-muted-foreground">
              {t('paths.meta', {
                stops: t('paths.stops', { count: data.stops.length }),
                minutes: t('paths.minutes', { count: data.readingMinutes }),
              })}
            </p>
            <div lang="it" className="max-w-[65ch] space-y-3 text-base leading-relaxed">
              {paragraphs(data.intro).map((part, index) => (
                <p key={index}>{part}</p>
              ))}
            </div>

            <LegalSection title={t('paths.stopsHeading')}>
              <PathStops stops={data.stops} />
            </LegalSection>

            <ReportForm target={{ type: 'PATH', slug: data.slug }} subject={data.title} />
          </>
        )}
      </div>
    </div>
  );
}
