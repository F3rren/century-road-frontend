import { useTranslation } from 'react-i18next';
import { RotateCw } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/button';
import { ExternalAnchor } from '@/components/ui/ExternalAnchor';
import { useSources } from '@/features/history';
import { formatYear } from '@/lib/months';

const CELL = 'py-1.5 pr-4 last:pr-0';
const SUBHEADING_CLASS = 'mb-1 text-eyebrow text-muted-foreground';

// Where the content comes from, under what terms, how much of it there is and what it leaves
// out - asked of the backend, so it cannot go stale in a text written here. It is provenance, not
// a seal: nothing in it says "verified", and the page says so.
export function SourcesReport() {
  const { t, i18n } = useTranslation();
  const { data, isLoading, error, retry } = useSources();
  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat(i18n.language, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(iso));

  if (isLoading) return <p className="text-sm text-muted-foreground">{t('common.loading')}</p>;
  if (error) {
    return (
      <div className="space-y-3">
        <Alert variant="inline">{t('methodology.sources.loadError', { error })}</Alert>
        <Button size="sm" variant="outline" onClick={retry}>
          <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
          {t('common.retry')}
        </Button>
      </div>
    );
  }
  if (!data) return null;

  const { editorial, index } = data.coverage;

  return (
    <div className="space-y-5">
      <p>{t('methodology.sources.intro')}</p>

      <div>
        <h3 className={SUBHEADING_CLASS}>{t('methodology.sources.sourcesHeading')}</h3>
        <ul className="divide-y divide-border border-y border-border">
          {data.sources.map((source) => (
            <li key={source.id} className="space-y-0.5 py-2.5">
              <p className="font-bold">
                {source.url ? (
                  <ExternalAnchor href={source.url} className="text-primary">
                    {source.name}
                  </ExternalAnchor>
                ) : (
                  source.name
                )}
              </p>
              <p lang="it" className="text-sm">{source.provides}</p>
              <p className="text-sm text-muted-foreground">
                {source.license ? (
                  source.licenseUrl ? (
                    <ExternalAnchor href={source.licenseUrl}>{source.license}</ExternalAnchor>
                  ) : (
                    source.license
                  )
                ) : (
                  t('methodology.sources.noLicense')
                )}
                {source.attributionRequired && `. ${t('methodology.sources.attributionRequired')}`}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-3">
        <h3 className={SUBHEADING_CLASS}>{t('methodology.sources.coverageHeading')}</h3>
        {index.length > 0 ? (
          <table className="w-full text-left text-sm tabular-nums">
            <caption className="sr-only">{t('methodology.sources.indexCaption')}</caption>
            <thead>
              <tr className="border-b border-border text-xs font-bold text-muted-foreground">
                <th scope="col" className={`${CELL} font-medium`}>{t('methodology.report.colLanguage')}</th>
                <th scope="col" className={`${CELL} text-right font-medium`}>{t('methodology.sources.colEvents')}</th>
                <th scope="col" className={`${CELL} text-right font-medium`}>{t('methodology.sources.colCountries')}</th>
                <th scope="col" className={`${CELL} font-medium`}>{t('methodology.sources.colYears')}</th>
                <th scope="col" className={`${CELL} font-medium`}>{t('methodology.sources.colUpdated')}</th>
              </tr>
            </thead>
            <tbody>
              {index.map((edition) => (
                <tr key={edition.language} className="border-b border-border last:border-b-0">
                  <th scope="row" className={`${CELL} font-normal`}>
                    {edition.language === 'it' || edition.language === 'en'
                      ? t(`archive.filters.language${edition.language === 'it' ? 'Italian' : 'English'}`)
                      : edition.language}
                  </th>
                  <td className={`${CELL} text-right`}>{edition.eventCount}</td>
                  <td className={`${CELL} text-right`}>{edition.countryCount}</td>
                  <td className={CELL}>
                    {formatYear(edition.oldestYear, i18n.language)}–{formatYear(edition.newestYear, i18n.language)}
                  </td>
                  <td className={CELL}>{formatDate(edition.indexedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-muted-foreground">{t('methodology.sources.indexEmpty')}</p>
        )}

        <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 border-t border-border pt-3 text-sm tabular-nums">
          <dt className="text-muted-foreground">{t('methodology.sources.paths')}</dt>
          <dd className="text-right">{editorial.paths}</dd>
          <dt className="text-muted-foreground">{t('methodology.sources.insights')}</dt>
          <dd className="text-right">{editorial.insights}</dd>
          <dt className="text-muted-foreground">{t('methodology.sources.reviewed')}</dt>
          <dd className="text-right">{editorial.reviewedInsights}</dd>
          {editorial.lastReviewedAt && (
            <>
              <dt className="text-muted-foreground">{t('methodology.sources.lastReviewed')}</dt>
              <dd className="text-right">{formatDate(editorial.lastReviewedAt)}</dd>
            </>
          )}
        </dl>
      </div>

      <div>
        <h3 className={SUBHEADING_CLASS}>{t('methodology.sources.limitsHeading')}</h3>
        <ul lang="it" className="list-disc space-y-1.5 pl-5">
          {data.limits.map((limit) => (
            <li key={limit.code}>{limit.message}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
