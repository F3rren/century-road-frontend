import i18n from '@/i18n';

// Ignores leap years on purpose: the history API treats 29 February as always
// valid and 30 February as always a 400, regardless of which year is asked
// for alongside it (a specific year narrows results, it doesn't change which
// dates exist). 1-indexed; index 0 is unused padding.
const DAYS_IN_MONTH = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

export function daysInMonth(month: number): number {
  return DAYS_IN_MONTH[month] ?? 31;
}

// The local calendar day, in the on-this-day API's month/day shape.
export function todayMonthDay(): { month: number; day: number } {
  const now = new Date();
  return { month: now.getMonth() + 1, day: now.getDate() };
}

// Any real calendar day, picked uniformly at random — a different day than
// today's, so a caller sourcing "history in general" (the Welcome page's
// photo carousel) isn't stuck re-showing the same handful of events/images
// every visitor gets on a given date. Goes through daysInMonth so it can
// never land on a day that doesn't exist (no 30 February).
export function randomMonthDay(): { month: number; day: number } {
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * daysInMonth(month)) + 1;
  return { month, day };
}

const monthNamesCache = new Map<string, readonly string[]>();

// Full month names for `language`, 1-indexed with a blank [0] padding entry
// so a month number can index straight in (matches the on-this-day API's
// month values). Built via Intl once per language and cached — this can run
// once per rendered month <option>, so a fresh Intl.DateTimeFormat per call
// would be wasteful. 2000 is used as the reference year purely because any
// year works for a month-name-only format; it carries no other meaning.
export function monthNames(language: string): readonly string[] {
  const cached = monthNamesCache.get(language);
  if (cached) return cached;
  const formatter = new Intl.DateTimeFormat(language, { month: 'long', timeZone: 'UTC' });
  const names = ['', ...Array.from({ length: 12 }, (_, i) => formatter.format(Date.UTC(2000, i, 1)))];
  monthNamesCache.set(language, names);
  return names;
}

const dayMonthFormatterCache = new Map<string, Intl.DateTimeFormat>();

function dayMonthFormatter(language: string): Intl.DateTimeFormat {
  let formatter = dayMonthFormatterCache.get(language);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(language, { day: 'numeric', month: 'long', timeZone: 'UTC' });
    dayMonthFormatterCache.set(language, formatter);
  }
  return formatter;
}

// "22 settembre 1236", or "44 a.C." spelled out rather than shown as the bare
// "-44" the API sends — both the month name and the BC-era suffix follow
// `language`. Holidays have no year (`year` omitted or null) and read as
// just "22 settembre". JS/Intl era support for arbitrary ancient proleptic
// years is unreliable across browsers, so the BC suffix is a translated
// string (date.era.bc), not derived from Intl. 2000 is a leap year, so day
// 29 of February stays valid, matching daysInMonth's own unconditional
// Feb=29 rule; timeZone:'UTC' keeps the formatted day from shifting by one
// in a negative-UTC-offset browser near local midnight.
export function formatEventDate(
  day: number,
  month: number,
  year: number | null | undefined,
  language: string,
): string {
  const dayMonth = dayMonthFormatter(language).format(Date.UTC(2000, month - 1, day));
  if (year === null || year === undefined) return dayMonth;
  if (year < 0) {
    const era = i18n.t('date.era.bc', { lng: language });
    return `${dayMonth} ${-year} ${era}`;
  }
  return `${dayMonth} ${year}`;
}
