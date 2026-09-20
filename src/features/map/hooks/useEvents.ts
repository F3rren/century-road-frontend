import { useMemo } from 'react';
import { MOCK_EVENTS } from '../data/mockEvents';
import type { Country, HistoricalEvent } from '../types';

function todayMonthDay() {
  const d = new Date();
  return { month: d.getMonth() + 1, day: d.getDate() };
}

function compareDayMonth(
  event: HistoricalEvent,
  ref: { month: number; day: number },
): 'before' | 'same' | 'after' {
  if (event.month < ref.month) return 'before';
  if (event.month > ref.month) return 'after';
  if (event.day < ref.day) return 'before';
  if (event.day === ref.day) return 'same';
  return 'after';
}

export function useEvents(countryCode: string | null | undefined) {
  const today = useMemo(() => todayMonthDay(), []);

  // The global "on this day" list no longer lives here: it comes from the
  // history API (features/history). What remains still reads MOCK_EVENTS
  // because the API carries no country or coordinates to build it from.
  const countryFiltered = useMemo(() => {
    if (!countryCode) return null;
    const all = MOCK_EVENTS.filter((e) => e.countryCode === countryCode).sort(
      (a, b) => a.year - b.year,
    );
    const past = all.filter((e) => {
      const cmp = compareDayMonth(e, today);
      return cmp === 'before' || cmp === 'same';
    });
    const upcoming = all.filter((e) => compareDayMonth(e, today) === 'after');
    return { all, past, upcoming };
  }, [countryCode, today]);

  const countryHeatmap = useMemo(() => {
    const counts: Record<string, number> = {};
    MOCK_EVENTS.filter(
      (e) => e.month === today.month && e.day === today.day,
    ).forEach((e) => {
      counts[e.countryCode] = (counts[e.countryCode] ?? 0) + 1;
    });
    return counts;
  }, [today]);

  // Keyboard/screen-reader equivalent of clicking a country polygon on the
  // map: every country that actually has data, so "select a country" is
  // reachable without a pointer.
  const availableCountries = useMemo<Country[]>(() => {
    const byCode = new Map<string, Country>();
    MOCK_EVENTS.forEach((e) => {
      if (!byCode.has(e.countryCode)) {
        byCode.set(e.countryCode, { code: e.countryCode, name: e.countryName });
      }
    });
    return Array.from(byCode.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  return {
    countryFiltered,
    today,
    countryHeatmap,
    availableCountries,
  };
}
