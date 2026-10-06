import { MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ReadingPage } from '@/components/layout/ReadingPage';
import { ExternalAnchor } from '@/components/ui/ExternalAnchor';
import {
  EditorialNotice,
  insightOnMapRoute,
  insightRoute,
  paragraphs,
  PlaceLine,
  pathRoute,
  ReportForm,
  YearMark,
  type InsightDetail,
} from '@/features/history';
import { LegalSection } from '@/features/legal';
import { formatEventDate } from '@/lib/months';
import { SamePeriod } from './SamePeriod';

const LINK_CLASS =
  'inline-flex min-h-11 items-center text-sm font-bold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

function Paragraphs({ text }: { text: string }) {
  return (
    <div lang="it" className="space-y-3">
      {paragraphs(text).map((part, index) => (
        <p key={index}>{part}</p>
      ))}
    </div>
  );
}

// "Perché conta": an event told as before, the event, after, with where to read on, where each
// claim can be checked, and who wrote it. What the backend says must not be dropped is shown
// here: an approximate pin says so, a text nobody reviewed shows no review date and is never
// called verified, and the caveats on dates and places are listed.
export function InsightView({ insight }: { insight: InsightDetail }) {
  const { t, i18n } = useTranslation();
  const { provenance } = insight;
  const reviewedOn =
    provenance.reviewedAt &&
    new Intl.DateTimeFormat(i18n.language, { dateStyle: 'long', timeZone: 'UTC' }).format(
      new Date(provenance.reviewedAt),
    );

  return (
    <ReadingPage title={insight.title} description={insight.summary} lang="it">
      <div className="space-y-3">
        <EditorialNotice />
        <p className="text-sm">
          <span className="font-bold">{formatEventDate(insight.date.day, insight.date.month, insight.date.year, i18n.language)}</span>
        </p>
        <p className="text-sm">
          <MapPin className="mr-1.5 inline h-4 w-4 align-text-bottom" aria-hidden="true" />
          <PlaceLine place={insight.place} />
        </p>
        <div className="flex flex-wrap gap-x-6">
          <Link to={insightOnMapRoute(insight.slug)} className={LINK_CLASS}>
            {t('insights.showOnMap')}
          </Link>
          {insight.inPaths.map((membership) => (
            <Link key={membership.path} to={pathRoute(membership.path)} className={LINK_CLASS}>
              {t('insights.stopOf', {
                position: membership.position,
                count: membership.stopCount,
                title: membership.title,
              })}
            </Link>
          ))}
        </div>
      </div>

      <LegalSection title={t('insights.before')}>
        <Paragraphs text={insight.before} />
      </LegalSection>
      <LegalSection title={t('insights.event')}>
        <Paragraphs text={insight.event} />
      </LegalSection>
      <LegalSection title={t('insights.after')}>
        <Paragraphs text={insight.after} />
      </LegalSection>

      {insight.notes.length > 0 && (
        <LegalSection title={t('insights.notes')}>
          <ul lang="it" className="list-disc space-y-1.5 pl-5">
            {insight.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </LegalSection>
      )}

      {insight.related.length > 0 && (
        <LegalSection title={t('insights.related')}>
          <ul className="divide-y divide-border border-y border-border">
            {insight.related.map((related) => (
              <li key={related.slug} className="py-2.5">
                <Link
                  to={insightRoute(related.slug)}
                  className="group grid grid-cols-[3.75rem_minmax(0,1fr)] gap-x-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <YearMark year={related.date.year} />
                  <span lang="it">
                    <span className="block font-serif text-base leading-snug group-hover:text-primary">
                      {related.title}
                    </span>
                    <span className="mt-1 block text-sm text-muted-foreground">{related.reason}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </LegalSection>
      )}

      <LegalSection title={t('insights.sources')}>
        <ul className="list-disc space-y-1.5 pl-5">
          {insight.sources.map((source) => (
            <li key={source.url}>
              <ExternalAnchor href={source.url} className="text-primary">
                {source.title}
              </ExternalAnchor>
              <span className="text-muted-foreground">
                {' '}
                ({source.license ? `${source.publisher}, ${source.license}` : source.publisher})
              </span>
            </li>
          ))}
        </ul>
        {/* Provenance, not a seal: a date only when a person really reviewed the text. */}
        <p className="text-sm text-muted-foreground">
          {t('insights.writtenBy', { author: provenance.author })}{' '}
          {reviewedOn ? t('insights.reviewedOn', { date: reviewedOn }) : t('insights.notReviewed')}
        </p>
      </LegalSection>

      <SamePeriod year={insight.date.year} excludeCountry={insight.place.countryCode} />

      <div className="border-t border-border pt-3">
        <ReportForm target={{ type: 'INSIGHT', slug: insight.slug }} subject={insight.title} />
      </div>
    </ReadingPage>
  );
}
