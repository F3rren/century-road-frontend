// Mirrors GET /api/history/sources ("Il progetto e le fonti") and POST /api/history/reports
// ("Segnala un errore").

import type { HistoryLanguage } from './index';

// One source of content. It is provenance, not a seal of reliability: nothing here says "verified".
export interface DataSource {
  id: string;
  name: string;
  provides: string;
  url?: string;
  // Absent for the project's own editorial content: no licence has been chosen for it.
  license?: string;
  licenseUrl?: string;
  attributionRequired: boolean;
}

// What the country index holds for one Wikipedia edition.
export interface IndexCoverage {
  language: string;
  eventCount: number;
  countryCount: number;
  oldestYear: number;
  newestYear: number;
  // ISO date-time: how far behind Wikipedia the index can be.
  indexedAt: string;
}

export interface EditorialCoverage {
  paths: number;
  insights: number;
  reviewedInsights: number;
  // YYYY-MM-DD; absent when no insight has been reviewed yet.
  lastReviewedAt?: string;
}

// What the content is not, in Italian. `code` is stable, `message` is the text to show.
export interface ContentLimit {
  code: string;
  message: string;
}

export interface SourcesData {
  sources: DataSource[];
  coverage: {
    index: IndexCoverage[];
    editorial: EditorialCoverage;
  };
  limits: ContentLimit[];
}

export type ReportCategory = 'WRONG_DATE' | 'WRONG_PLACE' | 'WRONG_TEXT' | 'BROKEN_LINK' | 'OTHER';

// What a report is about. An event has no identifier of its own, so it is named by its date, its
// edition and the text the visitor saw; an insight or a path by its slug. The frontend fills this
// in from the card the visitor is on, so the visitor only says what is wrong.
export type ReportTarget =
  | {
      type: 'EVENT';
      year: number;
      month: number;
      day: number;
      language: HistoryLanguage;
      text?: string;
    }
  | { type: 'INSIGHT'; slug: string }
  | { type: 'PATH'; slug: string };

export interface ErrorReport {
  target: ReportTarget;
  category: ReportCategory;
  // 10 to 1000 characters.
  message: string;
  // The backend also accepts an optional `contact` (an email, for a reply). It is left out of
  // this type on purpose: the app collects no personal data, so it can never be sent.
}

export interface ReportReceipt {
  id: number;
  // ISO date-time.
  receivedAt: string;
}
