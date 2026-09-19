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

export interface ThumbnailRef {
  url: string;
  width: number;
  height: number;
  // Commons page naming the image's author and licence.
  filePageUrl: string;
}

export interface PageRef {
  title: string;
  description?: string;
  extract?: string;
  // CC BY-SA attribution link back to the Wikipedia article.
  url: string;
  thumbnail?: ThumbnailRef;
}

export interface HistoryEntry {
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
