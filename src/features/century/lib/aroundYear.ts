// The backend's own limits for a year (OnThisDayQuery.MIN_YEAR / MAX_YEAR).
const MIN_YEAR = -9999;
const MAX_YEAR = 9999;

// A year typed in the "Nello stesso periodo" field, or null while it is empty, partial ("-"),
// not a whole number or out of range: nothing is asked of the backend until it is a year.
// Negative before the common era, like everywhere else in the app.
export function parseAroundYear(text: string): number | null {
  const trimmed = text.trim();
  if (!/^-?\d{1,4}$/.test(trimmed)) return null;
  const year = Number(trimmed);
  return year >= MIN_YEAR && year <= MAX_YEAR ? year : null;
}
