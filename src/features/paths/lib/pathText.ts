import type { TFunction } from 'i18next';
import type { PathSummary } from '@/features/history';
import { formatYearSpan } from '@/lib/months';

// The name of a topic in the interface's language. The backend sends its code and an Italian name;
// a code the frontend has no translation for yet shows that name, not the raw key.
export function topicName(t: TFunction, code: string, fallback?: string): string {
  return t(`paths.topic.${code}`, { defaultValue: fallback ?? code });
}

// "1789–1799, 8 tappe, 9 minuti di lettura": the years come from the backend (read from the stops'
// dates), the stop count and the reading time are counted by it, so none of it is written by hand.
// Without years (an older backend) it is the line it always was.
export function describePath(
  t: TFunction,
  language: string,
  path: Pick<PathSummary, 'stopCount' | 'readingMinutes' | 'startYear' | 'endYear'>,
): string {
  const stops = t('paths.stops', { count: path.stopCount });
  const minutes = t('paths.minutes', { count: path.readingMinutes });
  if (path.startYear === undefined || path.endYear === undefined) return t('paths.meta', { stops, minutes });
  return t('paths.metaWithYears', { years: formatYearSpan(path.startYear, path.endYear, language), stops, minutes });
}
