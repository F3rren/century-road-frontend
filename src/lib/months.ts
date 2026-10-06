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

// A year for a sentence or a heading: "1969", or "44 a.C." before the common era, never the bare
// "-44" the API sends. The era is a translated string for the reason formatEventDate gives.
export function formatYear(year: number, language: string): string {
  return year < 0 ? `${-year} ${i18n.t('date.era.bc', { lng: language })}` : String(year);
}

// The years a century covers, for a column or a heading: "1900–1999", or
// "500–401 a.C." counting down before the common era. `start` is the year
// floored to the hundred, so -100 holds 100 to 1 BC.
export function centuryRange(start: number, language: string): string {
  if (start >= 0) return `${start}–${start + 99}`;
  return `${-start}–${-(start + 99)} ${i18n.t('date.era.bc', { lng: language })}`;
}

// Italy, Spain and Portugal moved to the Gregorian calendar in October 1582, so
// from 1583 the weekday Intl computes (it runs the Gregorian calendar backwards
// forever) is the one the sources use. Before that they count in the Julian
// calendar, and a computed weekday would be wrong, so none is shown.
// ponytail: one cut-off for every country; Britain switched in 1752 and Russia in
// 1918, so a weekday on their dates in between follows the Gregorian count. Use a
// per-country cut-off once an event's country is known for certain: the map's is a
// guess from a linked article, not enough to choose a calendar by.
const FIRST_GREGORIAN_YEAR = 1583;

// The full date of an event for its popup, plus how long ago it was: "domenica 3
// ottobre 1954" and "72 anni fa", both worded by Intl in `language`. A
// holiday (no year) has neither a weekday nor a distance in time.
export function describeEventDate(
  day: number,
  month: number,
  year: number | null | undefined,
  language: string,
  now: Date = new Date(),
): { date: string; ago: string | null } {
  if (year === null || year === undefined) return { date: formatEventDate(day, month, year, language), ago: null };

  const date = new Date(Date.UTC(2000, month - 1, day));
  date.setUTCFullYear(year);
  // A 29 February in a year that has none rolls over to March: no weekday then.
  const withWeekday = year >= FIRST_GREGORIAN_YEAR && date.getUTCMonth() === month - 1;
  const text = withWeekday
    ? new Intl.DateTimeFormat(language, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(date)
    : formatEventDate(day, month, year, language);

  // There is no year 0: from 44 BC to AD 2026 is 2069 years, not 2070.
  const elapsed = now.getUTCFullYear() - year - (year < 0 ? 1 : 0);
  const ago = new Intl.RelativeTimeFormat(language, { numeric: "auto" }).format(-elapsed, "year");
  return { date: text, ago };
}
