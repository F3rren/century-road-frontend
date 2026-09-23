import type { HistoryEntry } from '@/features/history';
import type { Country } from '../types';
import { findCountryAt, type CountryFeature } from './countryGeometry';

export interface GeocodedEntry {
  entry: HistoryEntry;
  // null when none of the entry's linked articles carry coordinates, or none
  // of those coordinates land inside a country shape this dataset has.
  country: Country | null;
}

// A history-API entry has no place of its own — only its linked *articles*
// sometimes do (an article about the city, the country, or the person the
// event concerns). Using the first one that has coordinates as a stand-in
// for "where this event happened" is a heuristic, not a fact the API
// states: two entries about the same event can point at different articles,
// and an article's coordinates describe the article's subject, not
// necessarily the event itself.
export function geocodeEntries(
  entries: readonly HistoryEntry[],
  features: readonly CountryFeature[],
): GeocodedEntry[] {
  return entries.map((entry) => {
    const located = entry.pages.find((page) => page.coordinates);
    const country = located?.coordinates
      ? findCountryAt(located.coordinates.lon, located.coordinates.lat, features)
      : null;
    return { entry, country };
  });
}

export function countByCountry(geocoded: readonly GeocodedEntry[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const { country } of geocoded) {
    if (country) counts[country.code] = (counts[country.code] ?? 0) + 1;
  }
  return counts;
}
