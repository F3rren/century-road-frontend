import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { Provenance } from '../types';

// Who wrote an editorial text, and whether anybody checked it. Provenance, not a seal: a date
// shows only when a person really reviewed the text against its sources, and nothing here ever
// says "verified". Shared by the insight's own page and the "Perché conta" block, so that the
// block cannot read as more settled than the page it is taken from.
export function ProvenanceLine({ provenance, className }: { provenance: Provenance; className?: string }) {
  const { t, i18n } = useTranslation();
  const reviewedOn =
    provenance.reviewedAt &&
    new Intl.DateTimeFormat(i18n.language, { dateStyle: 'long', timeZone: 'UTC' }).format(
      new Date(provenance.reviewedAt),
    );

  return (
    <p className={cn('text-sm text-muted-foreground', className)}>
      {t('insights.writtenBy', { author: provenance.author })}{' '}
      {reviewedOn ? t('insights.reviewedOn', { date: reviewedOn }) : t('insights.notReviewed')}
    </p>
  );
}
