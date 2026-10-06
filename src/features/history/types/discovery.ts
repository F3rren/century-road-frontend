// Mirrors GET /api/history/random ("Sorprendimi") and /same-period ("Nello stesso periodo").
// Both read the backend's country index, so both are only as complete as it is: events with a
// year that the map can place in a country, about half of what Wikipedia lists.

import type { Attribution, CountryTimelineEvent, HistoryLanguage } from './index';

export interface RandomEvent extends CountryTimelineEvent {
  // ISO 3166-1 alpha-2: enough to open that day and select that country.
  countryCode: string;
}

// `event` is absent when nothing matches the filters: a 200, not an error.
export interface RandomEventData {
  language: HistoryLanguage;
  event?: RandomEvent;
  attribution: Attribution;
}

export interface RandomEventParams {
  lang: HistoryLanguage;
  // Only events placed in this country.
  country?: string;
  // Inclusive; negative before the common era.
  fromYear?: number;
  toYear?: number;
}

// NONE: the index holds nothing for the window. SPARSE: under 5 events or under 3 countries -
// show it as "poco materiale", never as "nothing happened". OK is still a selection.
export type CoverageLevel = 'NONE' | 'SPARSE' | 'OK';

export interface SamePeriodCoverage {
  level: CoverageLevel;
  eventCount: number;
  countryCount: number;
  // Shown at every level, because even OK is a selection.
  note: string;
}

export interface SamePeriodCountry {
  countryCode: string;
  // How many events the country has in the window; `events` holds at most `perCountry` of them,
  // the closest to the year, oldest first.
  eventCount: number;
  events: CountryTimelineEvent[];
}

export interface SamePeriodData {
  language: HistoryLanguage;
  year: number;
  fromYear: number;
  toYear: number;
  // The country left out, when one was asked for.
  excludedCountry?: string;
  // The events were contemporary, not connected: always TEMPORAL, and `notice` says so.
  comparison: 'TEMPORAL';
  notice: string;
  coverage: SamePeriodCoverage;
  // Most events first.
  countries: SamePeriodCountry[];
  attribution: Attribution;
}

export interface SamePeriodParams {
  // The year at the centre of the window; negative before the common era.
  year: number;
  lang: HistoryLanguage;
  // Years either side of `year`, 0 to 25 (backend default 5).
  span?: number;
  // Usually the country being looked at.
  excludeCountry?: string;
  // 1 to 10 (backend default 3).
  perCountry?: number;
}
