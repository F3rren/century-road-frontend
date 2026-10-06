import { useState } from 'react';
import { ChevronRight, RotateCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/button';
import { buildExcerpt, InsightExcerpt, isEmptyExcerpt, useInsight } from '@/features/history';

// The body is its own component so that the insight is asked for only once the stop has been
// opened, not for every stop when the path loads.
function Body({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const { data, isLoading, error, retry } = useInsight(slug);

  if (isLoading) return <p className="text-sm text-muted-foreground">{t('common.loading')}</p>;
  if (error) {
    return (
      <div className="space-y-3">
        <Alert variant="inline">{t('insights.loadError', { error })}</Alert>
        <Button size="sm" variant="outline" onClick={retry}>
          <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
          {t('common.retry')}
        </Button>
      </div>
    );
  }
  const excerpt = data ? buildExcerpt(data) : null;
  if (!excerpt || isEmptyExcerpt(excerpt)) return null;
  return <InsightExcerpt excerpt={excerpt} />;
}

// "Perché conta" under a stop, closed until opened: before, the event, after and a few
// connections, from the insight the stop opens. Once opened it stays mounted, so closing and
// opening it again does not ask again. The page of the insight itself, with the caveats, the
// sources and who wrote it, stays one link away.
export function StopWhyItMatters({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const [hasOpened, setHasOpened] = useState(false);

  return (
    <details
      className="group"
      onToggle={(event) => {
        if (event.currentTarget.open) setHasOpened(true);
      }}
    >
      <summary className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm font-bold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <ChevronRight
          className="h-4 w-4 transition-transform group-open:rotate-90 motion-reduce:transition-none"
          aria-hidden="true"
        />
        {/* Fixer yellow as a fill under Prussian text (DESIGN.md, The Fixer Rule), never as text. */}
        <span className="bg-highlight px-2 py-0.5 text-highlight-foreground">{t('paths.readInsight')}</span>
      </summary>
      <div className="mt-2 max-w-[65ch] pb-2">{hasOpened && <Body slug={slug} />}</div>
    </details>
  );
}
