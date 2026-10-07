// Mirrors the history-service's hand-written content: GET /api/history/start-here, /paths,
// /paths/{slug} and /insights. Optional fields are absent from the JSON, not null (NON_NULL).
// Everything here is written in Italian only, whatever language the app is in.

// The date of the event, not of today: a year (negative before the common era), a month, a day.
export interface EditorialDate {
  year: number;
  month: number;
  day: number;
}

// Where the map should move to. `approximate` means the pin is a stand-in (a launch site for
// something that happened on the Moon): `note` then says so and must be shown, not dropped.
export interface EditorialPlace {
  name: string;
  lat: number;
  lon: number;
  // ISO 3166-1 alpha-2.
  countryCode?: string;
  approximate: boolean;
  note?: string;
}

// An image hosted on Wikimedia Commons; `filePageUrl` names its author and licence and must be
// shown next to it.
export interface PathCover {
  imageUrl: string;
  filePageUrl?: string;
  alt: string;
}

// A link where a claim can be checked.
export interface EditorialSource {
  title: string;
  url: string;
  publisher: string;
  license?: string;
}

export interface Provenance {
  author: string;
  // The day a person really checked the text against its sources (YYYY-MM-DD). Absent when
  // nobody did: show no date then, and never call such a text "verified".
  reviewedAt?: string;
}

// An event as a card in a list (GET /insights, and inside "Inizia da qui").
export interface InsightSummary {
  slug: string;
  title: string;
  summary: string;
  date: EditorialDate;
  place: EditorialPlace;
}

// "Continua a esplorare": another insight to read next, and why.
export interface InsightRelated {
  slug: string;
  title: string;
  date: EditorialDate;
  reason: string;
}

// A path that has a stop on this insight. `position` counts from 1.
export interface InsightMembership {
  path: string;
  title: string;
  position: number;
  stopCount: number;
}

// "Perché conta" (GET /insights/{slug}): before, the event, after.
export interface InsightDetail {
  slug: string;
  language: 'it';
  title: string;
  summary: string;
  date: EditorialDate;
  place: EditorialPlace;
  before: string;
  event: string;
  after: string;
  related: InsightRelated[];
  inPaths: InsightMembership[];
  sources: EditorialSource[];
  // Caveats on dates and places. Show them when there are any.
  notes: string[];
  provenance: Provenance;
}

// A path as a card (GET /paths).
export interface PathSummary {
  slug: string;
  title: string;
  tagline: string;
  // What the path is about: a code from a closed list on the backend's side (ROMA_IMPERIALE...),
  // with its Italian name. Optional because an older backend does not send them.
  topic?: string;
  topicLabel?: string;
  // The years the path's stops span, read from their dates by the backend. Negative before the
  // common era.
  startYear?: number;
  endYear?: number;
  cover?: PathCover;
  // Counted from the words at 200 a minute, never written by hand.
  readingMinutes: number;
  stopCount: number;
}

export interface PathStop {
  // Counts from 1.
  position: number;
  // The slug of the insight this stop opens (GET /insights/{slug}): a stop's full text is a
  // second request, asked for when the stop is opened.
  slug: string;
  title: string;
  summary: string;
  date: EditorialDate;
  place: EditorialPlace;
  // The line that ties this stop to the one before.
  narrative: string;
}

// One path (GET /paths/{slug}), stops in order.
export interface PathDetail {
  slug: string;
  language: 'it';
  title: string;
  tagline: string;
  intro: string;
  topic?: string;
  topicLabel?: string;
  startYear?: number;
  endYear?: number;
  cover?: PathCover;
  readingMinutes: number;
  stops: PathStop[];
}

// "Inizia da qui" (GET /start-here): a path or an event picked by hand, with a sentence on why
// to open it. Exactly one of `path` and `insight` is set, the one `type` names.
export type StartHereItem =
  | {
      type: 'PATH';
      slug: string;
      title: string;
      teaser: string;
      path: PathSummary;
    }
  | {
      type: 'INSIGHT';
      slug: string;
      title: string;
      teaser: string;
      insight: InsightSummary;
    };

// A day, to ask for the insights of that day of the year (whatever the year).
export interface InsightsDayParams {
  month: number;
  day: number;
}
