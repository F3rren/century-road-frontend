// Mirrors GET /api/history/sources ("Il progetto e le fonti").

// One source of content. It is provenance, not a seal of reliability: nothing here says "verified".
// The backend writes these four as an explicit `null`, not as an absent key (only the top-level
// records of a response are serialised without nulls), so they are `string | null`.
export interface DataSource {
  id: string;
  name: string;
  provides: string;
  url: string | null;
  // null for the project's own editorial content: no licence has been chosen for it.
  license: string | null;
  licenseUrl: string | null;
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
  // YYYY-MM-DD; null when no insight has been reviewed yet.
  lastReviewedAt: string | null;
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
