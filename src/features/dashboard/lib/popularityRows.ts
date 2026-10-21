import { formatEventDate } from '@/lib/months';
// The light entry: the main map barrel would pull MapLibre into the dashboard.
import { localizedCountryName } from '@/features/map/data';
import type { CountryViewStat, DayViewStat } from '@/features/history';

export interface RankedRow {
  id: string;
  name: string;
  viewCount: number;
  // Where the row leads, when it leads anywhere.
  href?: string;
}

// The backend already sends them most viewed first, so the order is kept as it comes.
// With `linked`, a day opens in the Archive and a country in Il mio secolo.
export function dayRows(stats: DayViewStat[], language: string, linked = false): RankedRow[] {
  return stats.map((stat) => ({
    id: `${stat.month}-${stat.day}`,
    name: formatEventDate(stat.day, stat.month, undefined, language),
    viewCount: stat.viewCount,
    ...(linked ? { href: `/archive?${new URLSearchParams({ month: String(stat.month), day: String(stat.day) })}` } : {}),
  }));
}

export function countryRows(stats: CountryViewStat[], language: string, linked = false): RankedRow[] {
  return stats.map((stat) => ({
    id: stat.countryCode,
    name: localizedCountryName(stat.countryCode, stat.countryCode, language),
    viewCount: stat.viewCount,
    ...(linked ? { href: `/century?country=${encodeURIComponent(stat.countryCode)}` } : {}),
  }));
}
