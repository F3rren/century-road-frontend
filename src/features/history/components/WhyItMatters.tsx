import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { useInsight } from '../hooks/useEditorial';
import { buildExcerpt, isEmptyExcerpt } from '../lib/excerpt';
import type { InsightSummary } from '../types';
import { InsightExcerpt } from './InsightExcerpt';

// "Perché conta" inside an event's dialog: before, the event, after, and a few events to read
// on. The text is asked for when the dialog opens, from the insight the day already matched.
// Anything missing is left out rather than shown empty (no loading line, no error: the link to
// the full page above stays), and the whole block is hidden when the insight cannot be read.
export function WhyItMatters({ insight }: { insight: InsightSummary }) {
  const { t } = useTranslation();
  const headingId = useId();
  const { data } = useInsight(insight.slug);
  if (!data) return null;

  const excerpt = buildExcerpt(data);
  if (isEmptyExcerpt(excerpt)) return null;

  return (
    <section aria-labelledby={headingId} className="mt-8 border-t border-border pt-5">
      {/* Fixer yellow as a fill under Prussian text (DESIGN.md, The Fixer Rule), never as text. */}
      <h3 id={headingId} className="mb-4 font-display text-lg font-semibold">
        <span className="bg-highlight px-2 py-0.5 text-highlight-foreground">{t('history.dialog.insight')}</span>
      </h3>
      <InsightExcerpt excerpt={excerpt} />
    </section>
  );
}
