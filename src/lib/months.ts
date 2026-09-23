// Full Italian month names, 1-indexed (index 0 is unused padding so a month
// number can index straight in, matching the on-this-day API's month values).
export const MONTH_NAMES = [
  '', 'gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno',
  'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre',
] as const;

// Ignores leap years on purpose: the history API treats 29 February as always
// valid and 30 February as always a 400, regardless of which year is asked
// for alongside it (a specific year narrows results, it doesn't change which
// dates exist). 1-indexed, matching MONTH_NAMES; index 0 is unused padding.
const DAYS_IN_MONTH = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

export function daysInMonth(month: number): number {
  return DAYS_IN_MONTH[month] ?? 31;
}

// The local calendar day, in the on-this-day API's month/day shape.
export function todayMonthDay(): { month: number; day: number } {
  const now = new Date();
  return { month: now.getMonth() + 1, day: now.getDate() };
}

// "22 settembre 1236", or "44 a.C." spelled out rather than shown as the bare
// "-44" the API sends. Holidays have no year (`year` omitted or null) and
// read as just "22 settembre".
export function formatEventDate(day: number, month: number, year?: number | null): string {
  const dayMonth = `${day} ${MONTH_NAMES[month] ?? ''}`.trim();
  if (year === null || year === undefined) return dayMonth;
  return year < 0 ? `${dayMonth} ${-year} a.C.` : `${dayMonth} ${year}`;
}
