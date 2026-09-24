import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  buildImageSources,
  cleanText,
  useOnThisDay,
  type HistorySectionKey,
  type ImageSources,
} from '@/features/history';
import { deriveContentLanguage } from '@/i18n/contentLanguage';
import { formatEventDate, randomMonthDay } from '@/lib/months';

// Matches useTodayHistory's own section choice, and for the same reason:
// births/deaths alone can run into the hundreds of entries for a single day
// (measured: a 4-type request ran ~460KB/3.7s versus ~120KB/0.2s for these
// two), which is real weight for a background decoration that has nothing
// to do with the actual dateline sequence above it. selected+events already
// supplies image-bearing entries generously (measured 36 of 37 on a sample
// day).
const TYPES: readonly HistorySectionKey[] = ['selected', 'events'];
// Split three ways across the filmstrip's three rows (see PhotoCarousel),
// each row doubling its slice for the seamless loop — 24 keeps every row
// (8 unique frames, 16 once doubled) wide enough to cover a very wide
// monitor before the loop repeats, without visible thin patches. A real
// day's pool of image-bearing entries runs 35-55+ (measured directly
// against the backend across several random days), so this is nowhere
// near the actual ceiling.
const MAX_PHOTOS = 24;

export interface HistoryPhoto {
  id: string;
  image: ImageSources;
  caption: string;
  dateline: string;
  // Absent for holidays. Shown as a compact plate on each filmstrip frame —
  // the full dateline/caption already carry the complete date + text.
  year?: number;
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Wikimedia rasterises an SVG's thumbnail on request rather than serving a
// pre-generated one — measured taking 20s+ on a cold cache, well past a
// single filmstrip loop, which is what was showing as blank frames. SVGs on
// Commons are also mostly heraldry/flags/maps, not "real historical
// photographs" per the brief, so skipping them is a fidelity win too, not
// just a loading-speed one.
function isSvg(url: string): boolean {
  return /\.svg$/i.test(url);
}

// Real historical photography for the Welcome page's carousel — never a
// fixed "today", on purpose: today's own events already anchor the dateline
// sequence above it, so the carousel instead mixes in a genuinely different
// day (picked once per visit), spanning whatever centuries that day's real
// events happen to span. Same on-this-day endpoint every other page in the
// app already uses; no new API surface.
export function useHistoryPhotoCarousel() {
  const { i18n } = useTranslation();
  const [{ month, day }] = useState(randomMonthDay);
  const { data, isLoading, error } = useOnThisDay({
    month,
    day,
    lang: deriveContentLanguage(i18n.language),
    types: TYPES,
  });

  const photos = useMemo<HistoryPhoto[]>(() => {
    if (!data) return [];
    const seenFiles = new Set<string>();
    const found: HistoryPhoto[] = [];
    for (const key of TYPES) {
      const section = data.sections[key];
      if (!section) continue;
      for (const entry of section.items) {
        // One photo per entry: a single richly-illustrated event shouldn't
        // crowd out every other era in the rotation.
        const page = entry.pages.find((candidate) => {
          const candidateImage = buildImageSources(candidate);
          return candidateImage && !isSvg(candidateImage.src);
        });
        const image = page && buildImageSources(page);
        if (!image || seenFiles.has(image.filePageUrl)) continue;
        seenFiles.add(image.filePageUrl);
        found.push({
          id: image.filePageUrl,
          image,
          caption: cleanText(entry.text),
          dateline: formatEventDate(day, month, entry.year, i18n.language),
          year: entry.year,
        });
      }
    }
    return shuffle(found).slice(0, MAX_PHOTOS);
  }, [data, day, month, i18n.language]);

  return { photos, isLoading, error };
}
