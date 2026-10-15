import { useTranslation } from 'react-i18next';
import { ExternalAnchor } from '@/components/ui/ExternalAnchor';
import type { PathCover as PathCoverData } from '@/features/history';

// The path's cover: a photograph from Wikimedia Commons used as atmosphere, so it is toned as a
// cyanotype like the Welcome's (greyscale blended by luminosity over Prussian), with the page
// that names its author and licence next to it - the image's licence is its own.
export function PathCover({ cover }: { cover: PathCoverData }) {
  const { t } = useTranslation();
  return (
    <figure>
      <div className="aspect-[21/9] w-full bg-[#0E2A47] dark:bg-[#1F4E79]">
        <img
          src={cover.imageUrl}
          alt={cover.alt}
          lang="it"
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover mix-blend-luminosity grayscale contrast-125"
        />
      </div>
      {cover.filePageUrl && (
        <figcaption>
          <ExternalAnchor
            href={cover.filePageUrl}
            className="inline-flex min-h-11 items-center text-xs text-muted-foreground hover:text-foreground"
          >
            {t('paths.coverCredit')}
          </ExternalAnchor>
        </figcaption>
      )}
    </figure>
  );
}
