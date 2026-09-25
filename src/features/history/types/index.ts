// Mirrors the history-service response (OnThisDayResponse + its Section/Entry
// records). Optional fields are absent from the JSON, not null: the backend
// serialises with NON_NULL.

export type HistoryLanguage = 'it' | 'en';

export type HistorySectionKey =
  | 'selected'
  | 'events'
  | 'births'
  | 'deaths'
  | 'holidays';

// A picture hosted on Wikimedia Commons. Its licence is its own, not the
// article's: filePageUrl is the page naming the author and licence, and must
// be shown next to the image.
export interface ImageRef {
  url: string;
  width: number;
  height: number;
  filePageUrl: string;
}

// Decimal degrees: latitude north and longitude east are positive.
export interface Coordinates {
  lat: number;
  lon: number;
}

// An article linked from an entry's text: related reading, not the article
// about the event. Its description and extract describe the article itself.
export interface PageRef {
  title: string;
  description?: string;
  // The article's opening paragraph, plain text.
  extract?: string;
  // CC BY-SA attribution link back to the Wikipedia article.
  url: string;
  // The same picture at two sizes: thumbnail for lists, originalImage for a
  // detail view. Originals can be several megabytes and over 8,000px wide.
  thumbnail?: ImageRef;
  originalImage?: ImageRef;
  // Where the article's subject is, when it has a place.
  coordinates?: Coordinates;
  // Wikidata id (Q42): the same in every language.
  wikibaseItem?: string;
}

export interface HistoryEntry {
  // The event itself. Holidays can contain a line break.
  text: string;
  // Absent for holidays; negative before the common era.
  year?: number;
  pages: PageRef[];
}

export interface SectionResult {
  // The edition that really supplied the items: not always the one asked for.
  language: HistoryLanguage;
  // True when `language` differs from the requested one (the Italian feed has
  // no births or deaths, so those come back in English).
  fallback: boolean;
  // Copy older than six hours because Wikipedia could not be reached.
  stale: boolean;
  items: HistoryEntry[];
}

export interface Attribution {
  source: string;
  license: string;
  licenseUrl: string;
  notice: string;
}

export interface OnThisDayData {
  date: { month: number; day: number };
  language: HistoryLanguage;
  attribution: Attribution;
  sections: Partial<Record<HistorySectionKey, SectionResult>>;
  warnings: string[];
}

export interface OnThisDayParams {
  month: number;
  day: number;
  lang?: HistoryLanguage;
  types?: readonly HistorySectionKey[];
  // Negative for years before the common era.
  year?: number;
  // Inclusive range, either end optional. The backend rejects it combined
  // with `year`.
  fromYear?: number;
  toYear?: number;
}

// Anonymous, aggregate view counters (GET /api/history/stats/*) — how many times a calendar
// day's page or a country has been viewed, in total, most viewed first. No visitor identifier
// anywhere in this data; see TrackingController on the backend.
export interface DayViewStat {
  month: number;
  day: number;
  viewCount: number;
}

export interface CountryViewStat {
  countryCode: string;
  viewCount: number;
}
