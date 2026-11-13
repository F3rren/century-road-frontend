// The contract between this app and history-service, checked by the compiler.
//
// `schema.d.ts` is generated from the OpenAPI document the backend publishes and commits
// (docs/openapi/history-service.json in century-road-backend; see `npm run api:types`). The types the
// app really uses are written by hand, next to the code that reads them. Nothing used to keep the two
// in step: a field renamed on the server was a blank screen in the browser, found by a person.
//
// Each line below says "whatever the server may send for this schema is a valid <hand-written type>".
// It produces no code. When the backend changes, `npm run api:types` brings the new document in and
// this file stops compiling at the type that no longer matches, which `npm run build` (tsc) then fails on.
//
// Only that direction is checked, on purpose: a hand-written type may be stricter than the server (a
// union of the two languages, say) or more lenient (a field marked optional for an older backend), but it
// must never promise something the server does not send.
import type { components } from './schema';
import type {
  Attribution,
  Coordinates,
  CountryEventCount,
  CountryTimelineData,
  CountryTimelineEvent,
  CountryViewStat,
  DayViewStat,
  HistoryEntry,
  ImageRef,
  OnThisDayData,
  PageRef,
  SectionResult,
} from '@/features/history/types';
import type {
  EditorialDate,
  EditorialPlace,
  EditorialSource,
  InsightDetail,
  InsightMembership,
  InsightRelated,
  InsightSummary,
  PathCover,
  PathDetail,
  PathStop,
  PathSummary,
  Provenance,
  StartHereItem,
} from '@/features/history/types/editorial';
import type {
  RandomEvent,
  RandomEventData,
  SamePeriodCountry,
  SamePeriodCoverage,
  SamePeriodData,
} from '@/features/history/types/discovery';
import type {
  ContentLimit,
  DataSource,
  EditorialCoverage,
  IndexCoverage,
  SourcesData,
} from '@/features/history/types/transparency';

type Schemas = components['schemas'];

// A field the server leaves out (NON_NULL) and one it sends as null (a few nested records do) both mean
// "nothing" to the app, so the check looks past the difference.
type NoNull<T> = T extends null
  ? never
  : T extends readonly (infer Item)[]
    ? NoNull<Item>[]
    : T extends object
      ? { [Key in keyof T]: NoNull<T[Key]> }
      : T;

type Expect<T extends true> = T;
type Sends<Schema, Declared> = [NoNull<Schema>] extends [Declared] ? true : false;

// -- the day feed ---------------------------------------------------------------------------------
export type OnThisDay = Expect<Sends<Schemas['OnThisDayResponse'], OnThisDayData>>;
export type SectionResults = Expect<Sends<Schemas['SectionResult'], SectionResult>>;
export type Entries = Expect<Sends<Schemas['Entry'], HistoryEntry>>;
export type Pages = Expect<Sends<Schemas['PageRef'], PageRef>>;
export type Images = Expect<Sends<Schemas['ImageRef'], ImageRef>>;
export type Places = Expect<Sends<Schemas['Coordinates'], Coordinates>>;
export type Attributions = Expect<Sends<Schemas['Attribution'], Attribution>>;

// -- the country index ----------------------------------------------------------------------------
export type DayViews = Expect<Sends<Schemas['DayViewStat'], DayViewStat>>;
export type CountryViews = Expect<Sends<Schemas['CountryViewStat'], CountryViewStat>>;
export type CountryCounts = Expect<Sends<Schemas['CountryEventCount'], CountryEventCount>>;
export type Timelines = Expect<Sends<Schemas['TimelineResponse'], CountryTimelineData>>;
export type TimelineEvents = Expect<Sends<Schemas['TimelineEvent'], CountryTimelineEvent>>;

// -- the hand-written content ---------------------------------------------------------------------
export type EventDates = Expect<Sends<Schemas['EventDate'], EditorialDate>>;
export type EditorialPlaces = Expect<Sends<Schemas['Place'], EditorialPlace>>;
export type Covers = Expect<Sends<Schemas['Cover'], PathCover>>;
export type Sources = Expect<Sends<Schemas['Source'], EditorialSource>>;
export type Provenances = Expect<Sends<Schemas['Provenance'], Provenance>>;
export type InsightSummaries = Expect<Sends<Schemas['InsightSummary'], InsightSummary>>;
export type InsightRelations = Expect<Sends<Schemas['Related'], InsightRelated>>;
export type InsightMemberships = Expect<Sends<Schemas['Membership'], InsightMembership>>;
export type InsightDetails = Expect<Sends<Schemas['InsightDetail'], InsightDetail>>;
export type PathSummaries = Expect<Sends<Schemas['PathSummary'], PathSummary>>;
export type PathStops = Expect<Sends<Schemas['Stop'], PathStop>>;
export type PathDetails = Expect<Sends<Schemas['PathDetail'], PathDetail>>;
// The hand-written type is a union (a PATH has `path`, an INSIGHT has `insight`), which OpenAPI as
// published cannot say: it lists both as optional. So the two cards are checked on their own, and the
// fields they share with the item.
export type StartHerePaths = Expect<Sends<NonNullable<Schemas['StartHereItem']['path']>, PathSummary>>;
export type StartHereInsights = Expect<Sends<NonNullable<Schemas['StartHereItem']['insight']>, InsightSummary>>;
export type StartHereCommon = Expect<
  Sends<Pick<Schemas['StartHereItem'], 'slug' | 'title' | 'teaser'>, Pick<StartHereItem, 'slug' | 'title' | 'teaser'>>
>;
export type StartHereTypes = Expect<Sends<Schemas['StartHereItem']['type'], StartHereItem['type']>>;

// -- discovery ------------------------------------------------------------------------------------
export type RandomEvents = Expect<Sends<Schemas['RandomEvent'], RandomEvent>>;
export type RandomEventAnswers = Expect<Sends<Schemas['RandomEventResponse'], RandomEventData>>;
export type SamePeriodCoverages = Expect<Sends<Schemas['SamePeriodCoverage'], SamePeriodCoverage>>;
export type SamePeriodCountries = Expect<Sends<Schemas['CountryEvents'], SamePeriodCountry>>;
export type SamePeriodAnswers = Expect<Sends<Schemas['SamePeriodResponse'], SamePeriodData>>;

// -- sources and transparency ---------------------------------------------------------------------
export type DataSources = Expect<Sends<Schemas['DataSource'], DataSource>>;
export type IndexCoverages = Expect<Sends<Schemas['IndexCoverage'], IndexCoverage>>;
export type EditorialCoverages = Expect<Sends<Schemas['Editorial'], EditorialCoverage>>;
export type ContentLimits = Expect<Sends<Schemas['Limit'], ContentLimit>>;
export type SourcesAnswers = Expect<Sends<Schemas['SourcesResponse'], SourcesData>>;
