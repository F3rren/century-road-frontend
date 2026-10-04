import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { buildImageSources } from '../lib/images';
import type { PageRef } from '../types';
import { ExternalAnchor } from '@/components/ui/ExternalAnchor';

// Matches the thumbnail column below: 7rem from the sm breakpoint up, 5rem on a phone.
const IMAGE_SIZES = '(min-width: 640px) 7rem, 5rem';

interface RelatedArticleProps {
  page: PageRef;
}

// One article linked from the event's text: further reading, so it stays
// smaller than the event above it. Its description and extract describe the
// article, not the event, so they sit under the article's own title link. The
// picture is a square thumbnail, the same size for every article, so a map or
// a coat of arms never outweighs the text; the full image and its author are
// one click away, through the credit link under the text.
export function RelatedArticle({ page }: RelatedArticleProps) {
  const { t } = useTranslation();
  const image = buildImageSources(page);

  return (
    <li
      className={cn(
        'grid gap-x-4 border-t border-border py-4 first:border-t-0 first:pt-0',
        image && 'grid-cols-[5rem_minmax(0,1fr)] sm:grid-cols-[7rem_minmax(0,1fr)]',
      )}
    >
      {image && (
        <img
          src={image.src}
          srcSet={image.srcSet}
          sizes={IMAGE_SIZES}
          alt={page.title}
          width={image.width}
          height={image.height}
          loading="lazy"
          decoding="async"
          className="aspect-square w-full border border-border bg-muted object-cover"
        />
      )}
      <div className="min-w-0">
        <h4 className="font-display text-base font-semibold leading-snug">
          <ExternalAnchor href={page.url} className="-my-3 inline-block py-3 text-primary underline-offset-4 hover:underline">
            {page.title}
          </ExternalAnchor>
        </h4>
        {page.description && <p className="mt-0.5 text-sm text-muted-foreground">{page.description}</p>}
        {page.extract && <p className="mt-2 font-serif text-sm leading-relaxed">{page.extract}</p>}
        {image && (
          <ExternalAnchor
            href={image.filePageUrl}
            className="mt-1 inline-flex min-h-11 items-center text-xs text-muted-foreground hover:text-foreground"
          >
            {t('history.relatedArticle.imageCredit')}
          </ExternalAnchor>
        )}
      </div>
    </li>
  );
}
