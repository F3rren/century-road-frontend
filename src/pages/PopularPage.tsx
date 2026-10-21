import { RotateCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/PageHeader';
import { countryRows, dayRows, FULL_LIMIT, RankedList, usePopularityStats } from '@/features/dashboard';
import { ProseLink } from '@/features/info';
import { LegalSection } from '@/features/legal';
import { usePageMeta } from '@/hooks/usePageMeta';

const LINK_CLASS =
  'inline-flex min-h-11 items-center text-sm font-bold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

// The full rankings behind the Dashboard's top five: up to what the backend allows (50) of the
// days and the countries the site has shown most, each row leading to that day in the Archive or
// that country in Il mio secolo. What the counts are, and are not, is said on the page itself.
export function PopularPage() {
  const { t, i18n } = useTranslation();
  const { topDays, topCountries, isLoading, error, retry } = usePopularityStats(FULL_LIMIT);
  usePageMeta(t('popular.title'), t('meta.popular.description'));

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-5xl space-y-8 pb-8">
        <Link to="/dashboard" className={LINK_CLASS}>
          {t('popular.back')}
        </Link>
        <PageHeader title={t('popular.title')} description={t('popular.description')} />

        {isLoading && <p className="text-sm text-muted-foreground">{t('common.loading')}</p>}
        {error && (
          <div className="space-y-3">
            <Alert>{t('dashboard.popularity.loadError', { error })}</Alert>
            <Button size="sm" variant="outline" onClick={retry}>
              <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
              {t('common.retry')}
            </Button>
          </div>
        )}

        {!isLoading && !error && (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <RankedList
              headingTag="h2"
              label={t('dashboard.popularity.days.label')}
              rows={dayRows(topDays, i18n.language, true)}
              emptyText={t('dashboard.popularity.noData')}
            />
            <RankedList
              headingTag="h2"
              label={t('dashboard.popularity.countries.label')}
              rows={countryRows(topCountries, i18n.language, true)}
              emptyText={t('dashboard.popularity.noData')}
            />
          </div>
        )}

        <LegalSection title={t('popular.method.title')}>
          <p>{t('popular.method.days')}</p>
          <p>{t('popular.method.countries')}</p>
          <p>
            <Trans i18nKey="popular.method.anonymous" components={{ privacy: <ProseLink to="/privacy" /> }} />
          </p>
        </LegalSection>
      </div>
    </div>
  );
}
