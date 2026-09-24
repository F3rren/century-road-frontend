import { useState } from 'react';
import { cn } from '@/lib/utils';
import { getReducedMotionOverride } from '@/hooks/useReducedMotion';
import type { HistoryPhoto } from '../hooks/useHistoryPhotoCarousel';

interface PhotoCarouselProps {
  photos: readonly HistoryPhoto[];
}

interface Row {
  photos: readonly HistoryPhoto[];
  // The base keyframe (see tailwind.config.ts) reads right-to-left;
  // animation-direction: reverse flips it to left-to-right. Alternating per
  // row (L→R, R→L, L→R) is the user-requested "each opposite its neighbor"
  // herringbone read.
  reverseDirection: boolean;
  durationS: number;
}

// Full-bleed background layer for the Welcome page: three seamless,
// infinitely scrolling filmstrips of real historical photos (Wikimedia
// Commons, already linked from real events — see useHistoryPhotoCarousel),
// stacked in horizontal bands, alternating direction — user-referenced
// against the well-known "infinite logo carousel" pattern, then extended to
// three rows on request. Desaturated rather than shown at full color
// (DESIGN.md's One Voice Rule reserves saturated color for wire-red alone);
// frames separated by hairline seams (a `gap-px` track over a `bg-border`
// field, not individual borders — this app's HSL color tokens aren't set up
// for Tailwind's alpha-modifier syntax, so this gets the same visual result
// without fighting them); a solid scrim on top, never a gradient or blur,
// both refused by the committed material system.
export function PhotoCarousel({ photos }: PhotoCarouselProps) {
  // Read once per visit — this is a one-time threshold page, not a control
  // whose motion should live-update mid-visit.
  const [reduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches || getReducedMotionOverride(),
  );

  if (photos.length === 0) return null;

  // Three distinct, non-overlapping slices of the same pool — not the same
  // photos reordered — so the three rows actually show different frames.
  // Durations tuned to be obviously in motion within a couple of seconds,
  // not just technically animating — the first cut (55/70/45s, full loops
  // over city-block-sized distances) read as "not moving" at a glance.
  const third = Math.max(1, Math.ceil(photos.length / 3));
  const rows: Row[] = [
    { photos: photos.slice(0, third), reverseDirection: true, durationS: 22 },
    { photos: photos.slice(third, third * 2), reverseDirection: false, durationS: 28 },
    { photos: photos.slice(third * 2), reverseDirection: true, durationS: 18 },
  ];

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-background">
      {/* -webkit-mask-image alongside the standard property: Safari has
          never shipped the unprefixed one. */}
      <div className="absolute inset-0 flex flex-col [-webkit-mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        {rows.map((row, rowIndex) => {
          // Never duplicated (and never animated) under reduced motion,
          // where every row is simply a single static strip.
          const track = reduced ? row.photos : [...row.photos, ...row.photos];
          return (
            <div key={rowIndex} className="h-1/3 min-h-0">
              <div
                aria-hidden="true"
                className={cn('flex h-full w-max gap-px bg-border', !reduced && 'animate-filmstrip-scroll')}
                style={
                  reduced
                    ? undefined
                    : {
                        animationDuration: `${row.durationS}s`,
                        animationDirection: row.reverseDirection ? 'reverse' : 'normal',
                      }
                }
              >
                {track.map((photo, i) => (
                  // bg-muted, not bg-background: a still-loading tile needs to read as
                  // a frame waiting to develop, not as a hole matching the page behind
                  // it — a real Wikimedia thumbnail can take 20s+ on a cold cache (see
                  // isSvg's comment in the hook), so some tiles will sit in this state
                  // for a while on any given visit.
                  <div key={`${photo.id}-${i}`} className="relative h-full w-40 shrink-0 bg-muted sm:w-56">
                    <img
                      src={photo.image.src}
                      srcSet={photo.image.srcSet}
                      alt=""
                      // `loading="lazy"` was tried here for the duplicate half of the
                      // track (see the class comment above `track`) and reverted: this
                      // strip never stops scrolling, so "off screen right now" is a few
                      // seconds' wait, not "maybe never" — deferring the request left
                      // visible gaps once the loop reached a tile whose fetch had never
                      // been triggered. `fetchPriority` was tried next as a non-blocking
                      // "second copy isn't urgent" hint and also reverted: react-dom
                      // 18.3's runtime doesn't recognize the prop yet (only its types
                      // do), so it silently never reached the DOM — every tile just
                      // loads eagerly now, which is what was actually being tested and
                      // verified working all along.
                      decoding="async"
                      onLoad={(event) => event.currentTarget.classList.remove('opacity-0')}
                      className="h-full w-full object-cover opacity-0 grayscale contrast-125 transition-opacity duration-700"
                    />
                    {photo.year !== undefined && (
                      <span className="absolute bottom-2 left-2 font-mono text-[9px] uppercase tracking-wider text-white/70">
                        {photo.year}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="absolute inset-0 bg-background/85" />
    </div>
  );
}
