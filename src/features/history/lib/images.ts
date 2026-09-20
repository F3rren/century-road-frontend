import type { ImageRef, PageRef } from '../types';

// The original can be several megabytes and the feed has some over 8,000px
// wide, so it is only offered when it is a reasonable size.
const MAX_ORIGINAL_SIDE = 1600;

export interface ImageSources {
  src: string;
  srcSet?: string;
  width: number;
  height: number;
  // Commons page naming the author and licence; shown next to the image.
  filePageUrl: string;
}

function isReasonableSize(image: ImageRef): boolean {
  return Math.max(image.width, image.height) <= MAX_ORIGINAL_SIDE;
}

// The thumbnail is the default. A reasonably sized original joins it as a
// second srcset candidate, so the browser fetches it only where the display
// needs the extra pixels (a dense screen) instead of for everyone.
export function buildImageSources(page: PageRef): ImageSources | undefined {
  const { thumbnail, originalImage } = page;
  const original =
    originalImage && isReasonableSize(originalImage) ? originalImage : undefined;
  const base = thumbnail ?? original;
  if (!base) return undefined;

  const candidates = [thumbnail, original].filter(
    (image): image is ImageRef => image !== undefined,
  );

  return {
    src: base.url,
    srcSet:
      candidates.length > 1
        ? candidates.map((image) => `${image.url} ${image.width}w`).join(', ')
        : undefined,
    width: base.width,
    height: base.height,
    filePageUrl: base.filePageUrl,
  };
}
