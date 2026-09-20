import { cn } from '@/lib/utils';
import { buildImageSources } from '../lib/images';
import type { PageRef } from '../types';
import { ExternalAnchor } from './ExternalAnchor';

// Matches the image column below: 12rem from the sm breakpoint up, 6rem on a
// phone, where a full-width portrait would push the text off the screen.
const IMAGE_SIZES = '(min-width: 640px) 12rem, 6rem';

interface RelatedArticleProps {
  page: PageRef;
}

// One article linked from the event's text, shown in full. Its description and
// extract describe the article, not the event, so they sit under the
// article's own title link, and the image (with its own credit) beside it.
export function RelatedArticle({ page }: RelatedArticleProps) {
  const image = buildImageSources(page);

  return (
    <li
      className={cn(
        'grid gap-x-4 gap-y-2 border-t border-border py-4 first:border-t-0 first:pt-0',
        // From sm up the figure spans both rows; sizing row 1 to its content
        // keeps the extract right under the description instead of floating
        // down to share the figure's height.
        image && 'grid-cols-[6rem_1fr] sm:grid-cols-[12rem_1fr] sm:grid-rows-[auto_1fr]',
      )}
    >
      {image && (
        <figure className="space-y-1 self-start sm:row-span-2">
          <img
            src={image.src}
            srcSet={image.srcSet}
            sizes={IMAGE_SIZES}
            alt={page.title}
            width={image.width}
            height={image.height}
            loading="lazy"
            decoding="async"
            className="h-auto w-full border border-border"
          />
          <figcaption>
            <ExternalAnchor
              href={image.filePageUrl}
              className="inline-flex min-h-11 items-center text-[11px] text-muted-foreground"
            >
              Autore e licenza dell'immagine
            </ExternalAnchor>
          </figcaption>
        </figure>
      )}
      <div className="min-w-0">
        <h4 className="font-display text-base font-semibold tracking-tight">
          <ExternalAnchor
            href={page.url}
            className="inline-flex min-h-11 min-w-11 items-center text-primary"
          >
            {page.title}
          </ExternalAnchor>
        </h4>
        {page.description && (
          <p className="-mt-2 text-sm text-muted-foreground">{page.description}</p>
        )}
      </div>
      {page.extract && (
        <p
          className={cn(
            'font-serif text-sm leading-relaxed text-muted-foreground',
            image && 'col-span-2 sm:col-span-1 sm:col-start-2',
          )}
        >
          {page.extract}
        </p>
      )}
    </li>
  );
}
