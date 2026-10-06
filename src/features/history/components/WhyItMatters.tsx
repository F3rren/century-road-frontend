import { useId } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useInsight } from '../hooks/useEditorial';
import { insightRoute } from '../lib/editorial';
import { paragraphs } from '../lib/paragraphs';
import type { InsightSummary } from '../types';
import { YearMark } from './YearMark';

// How many "Collegamenti" to show: two or three to read on, not the whole list.
const MAX_CONNECTIONS = 3;

// "Perché conta" inside an event's dialog: before, the event, after, and a few events to read
// on. The text is asked for when the dialog opens, from the insight the day already matched.
// Anything missing is left out rather than shown empty (no loading line, no error: the link to
// the full page above stays), and the whole block is hidden when the insight cannot be read.
export function WhyItMatters({ insight }: { insight: InsightSummary }) {
  const { t } = useTranslation();
  const headingId = useId();
  const { data } = useInsight(insight.slug);
  if (!data) return null;

  const parts = [
    { key: 'before', text: data.before },
    { key: 'event', text: data.event },
    { key: 'after', text: data.after },
  ].filter((part) => paragraphs(part.text).length > 0);
  const connections = data.related.slice(0, MAX_CONNECTIONS);
  if (parts.length === 0 && connections.length === 0) return null;

  return (
    <section aria-labelledby={headingId} className="mt-8 border-t border-border pt-5">
      <h3 id={headingId} className="mb-4 font-display text-lg font-semibold">
        {t('history.dialog.insight')}
      </h3>
      <div className="space-y-4">
        {parts.map((part) => (
          <div key={part.key}>
            <h4 className="text-sm font-bold text-muted-foreground">
              {t(`insights.${part.key}`)}
            </h4>
            {/* The hand-written text is Italian only, whatever the interface language. */}
            <div lang="it" className="mt-1 space-y-2">
              {paragraphs(part.text).map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
      {connections.length > 0 && (
        <div className="mt-5">
          <h4 className="text-sm font-bold text-muted-foreground">{t('history.dialog.connections')}</h4>
          <ul className="mt-1 divide-y divide-border border-y border-border">
            {connections.map((related) => (
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
        </div>
      )}
    </section>
  );
}
