import { api } from '@/services/api';
import type { ApiResponse } from '@/types';
import type {
  CountryEventCount,
  CountryTimelineData,
  CountryTimelineParams,
  CountryViewStat,
  DayViewStat,
  ErrorReport,
  HistoryLanguage,
  InsightDetail,
  InsightsDayParams,
  InsightSummary,
  OnThisDayData,
  OnThisDayParams,
  PathDetail,
  PathSummary,
  RandomEventData,
  RandomEventParams,
  ReportReceipt,
  SamePeriodData,
  SamePeriodParams,
  SourcesData,
  StartHereItem,
} from '../types';

// Prefers the backend envelope's own message (already real, whatever language the
// backend sends) over a hardcoded client-side string, consistent with api.ts's own
// un-localized error convention.
function extractErrorMessage(envelope: ApiResponse<unknown>): string {
  return envelope.message ?? 'Unexpected response shape from server';
}

// Relative to api.ts's BASE_URL, which defaults to "/api" (Vite proxies that
// to the gateway). Keep VITE_API_BASE_URL unset, or ending in "/api".
export function buildOnThisDayPath({
  month,
  day,
  lang,
  types,
  year,
  fromYear,
  toYear,
}: OnThisDayParams): string {
  const query = new URLSearchParams();
  if (lang) query.set('lang', lang);
  if (types && types.length > 0) query.set('types', types.join(','));
  if (year !== undefined) query.set('year', String(year));
  if (fromYear !== undefined) query.set('fromYear', String(fromYear));
  if (toYear !== undefined) query.set('toYear', String(toYear));

  const qs = query.toString();
  return `/history/on-this-day/${month}/${day}${qs ? `?${qs}` : ''}`;
}

function isOnThisDayData(value: unknown): value is OnThisDayData {
  if (typeof value !== 'object' || value === null) return false;
  const { date, sections, warnings } = value as Record<string, unknown>;
  return (
    typeof date === 'object' &&
    date !== null &&
    typeof sections === 'object' &&
    sections !== null &&
    Array.isArray(warnings)
  );
}

export async function fetchOnThisDay(path: string): Promise<OnThisDayData> {
  const envelope = await api.get<ApiResponse<unknown>>(path);

  if (!envelope.success || !isOnThisDayData(envelope.data)) {
    throw new Error(extractErrorMessage(envelope));
  }
  return envelope.data;
}

// Anonymous, aggregate view tracking: increments that country's counter by one, nothing
// else. Fire-and-forget by design - callers don't await this for the UI to proceed, and a
// failure here (network hiccup, ad blocker) is silently ignored rather than surfaced, since
// missing one count is inconsequential and this must never block or error out map browsing.
export function trackCountryView(countryCode: string): void {
  api.post(`/history/track/country/${countryCode}`, undefined).catch(() => {
    // Intentionally ignored - see the function comment.
  });
}

export async function fetchTopDays(limit: number): Promise<DayViewStat[]> {
  const envelope = await api.get<ApiResponse<unknown>>(`/history/stats/days?limit=${limit}`);
  if (!envelope.success || !Array.isArray(envelope.data)) {
    throw new Error(extractErrorMessage(envelope));
  }
  return envelope.data as DayViewStat[];
}

export async function fetchTopCountries(limit: number): Promise<CountryViewStat[]> {
  const envelope = await api.get<ApiResponse<unknown>>(`/history/stats/countries?limit=${limit}`);
  if (!envelope.success || !Array.isArray(envelope.data)) {
    throw new Error(extractErrorMessage(envelope));
  }
  return envelope.data as CountryViewStat[];
}

// The countries the country index has events for, with how many: empty until the backend's
// first pass over the year has run.
export async function fetchTimelineCountries(lang: HistoryLanguage): Promise<CountryEventCount[]> {
  const envelope = await api.get<ApiResponse<unknown>>(`/history/countries?lang=${lang}`);
  if (!envelope.success || !Array.isArray(envelope.data)) {
    throw new Error(extractErrorMessage(envelope));
  }
  return envelope.data as CountryEventCount[];
}

export function buildCountryTimelinePath({ code, lang, fromYear, toYear }: CountryTimelineParams): string {
  const query = new URLSearchParams({ lang });
  if (fromYear !== null) query.set('fromYear', String(fromYear));
  if (toYear !== null) query.set('toYear', String(toYear));
  return `/history/countries/${encodeURIComponent(code)}/timeline?${query}`;
}

function isCountryTimelineData(value: unknown): value is CountryTimelineData {
  if (typeof value !== 'object' || value === null) return false;
  const { countryCode, events, attribution } = value as Record<string, unknown>;
  return (
    typeof countryCode === 'string' &&
    Array.isArray(events) &&
    typeof attribution === 'object' &&
    attribution !== null
  );
}

export async function fetchCountryTimeline(path: string): Promise<CountryTimelineData> {
  const envelope = await api.get<ApiResponse<unknown>>(path);
  if (!envelope.success || !isCountryTimelineData(envelope.data)) {
    throw new Error(extractErrorMessage(envelope));
  }
  return envelope.data;
}

// --- The content layer: hand-written paths and insights, discovery, sources, reports ---------
// Every endpoint below answers with the same envelope as the rest of history-service. These
// checks are as shallow as the ones above (the fields a reader would trip on, not a schema):
// they turn a backend that answers with something else into an Error instead of a blank screen.

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

async function fetchList<T>(path: string): Promise<T[]> {
  const envelope = await api.get<ApiResponse<unknown>>(path);
  if (!envelope.success || !Array.isArray(envelope.data)) {
    throw new Error(extractErrorMessage(envelope));
  }
  return envelope.data as T[];
}

async function fetchObject<T>(path: string, isValid: (value: unknown) => boolean): Promise<T> {
  const envelope = await api.get<ApiResponse<unknown>>(path);
  if (!envelope.success || !isValid(envelope.data)) {
    throw new Error(extractErrorMessage(envelope));
  }
  return envelope.data as T;
}

// "Inizia da qui": a few paths and events picked by hand, in the order to show them.
export function fetchStartHere(): Promise<StartHereItem[]> {
  return fetchList<StartHereItem>('/history/start-here');
}

export function fetchPaths(): Promise<PathSummary[]> {
  return fetchList<PathSummary>('/history/paths');
}

function isPathDetail(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.slug === 'string' &&
    typeof value.title === 'string' &&
    Array.isArray(value.stops)
  );
}

// 404 (PATH_NOT_FOUND) arrives as a thrown "HTTP 404", like any non-ok answer.
export function fetchPath(slug: string): Promise<PathDetail> {
  return fetchObject<PathDetail>(`/history/paths/${encodeURIComponent(slug)}`, isPathDetail);
}

// Without a day, every insight; with one, those of that day of the year whatever the year - the
// way to mark "Approfondimento disponibile" on a day's events, matched on `date.year`.
export function buildInsightsPath(day?: InsightsDayParams): string {
  if (!day) return '/history/insights';
  return `/history/insights?month=${day.month}&day=${day.day}`;
}

export function fetchInsights(path: string): Promise<InsightSummary[]> {
  return fetchList<InsightSummary>(path);
}

function isInsightDetail(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.slug === 'string' &&
    typeof value.title === 'string' &&
    typeof value.before === 'string' &&
    typeof value.event === 'string' &&
    typeof value.after === 'string' &&
    Array.isArray(value.related)
  );
}

// 404 (INSIGHT_NOT_FOUND) arrives as a thrown "HTTP 404", like any non-ok answer.
export function fetchInsight(slug: string): Promise<InsightDetail> {
  return fetchObject<InsightDetail>(`/history/insights/${encodeURIComponent(slug)}`, isInsightDetail);
}

// "Sorprendimi": one event picked at random from the country index, among those that match the
// filters in force. Never cached by the backend, so every call can answer differently.
export function buildRandomEventPath({ lang, country, fromYear, toYear }: RandomEventParams): string {
  const query = new URLSearchParams({ lang });
  if (country) query.set('country', country);
  if (fromYear !== undefined) query.set('fromYear', String(fromYear));
  if (toYear !== undefined) query.set('toYear', String(toYear));
  return `/history/random?${query}`;
}

function isRandomEventData(value: unknown): boolean {
  if (!isRecord(value) || !isRecord(value.attribution)) return false;
  // `event` is absent, not null, when nothing matches the filters.
  const { event } = value;
  return (
    event === undefined ||
    (isRecord(event) && typeof event.year === 'number' && typeof event.countryCode === 'string')
  );
}

export function fetchRandomEvent(path: string): Promise<RandomEventData> {
  return fetchObject<RandomEventData>(path, isRandomEventData);
}

// "Nello stesso periodo": what the index has for the years around `year`, by country.
export function buildSamePeriodPath({
  year,
  lang,
  span,
  excludeCountry,
  perCountry,
}: SamePeriodParams): string {
  const query = new URLSearchParams({ year: String(year), lang });
  if (span !== undefined) query.set('span', String(span));
  if (excludeCountry) query.set('excludeCountry', excludeCountry);
  if (perCountry !== undefined) query.set('perCountry', String(perCountry));
  return `/history/same-period?${query}`;
}

function isSamePeriodData(value: unknown): boolean {
  return (
    isRecord(value) &&
    isRecord(value.coverage) &&
    typeof value.coverage.level === 'string' &&
    Array.isArray(value.countries)
  );
}

export function fetchSamePeriod(path: string): Promise<SamePeriodData> {
  return fetchObject<SamePeriodData>(path, isSamePeriodData);
}

function isSourcesData(value: unknown): boolean {
  return (
    isRecord(value) &&
    Array.isArray(value.sources) &&
    Array.isArray(value.limits) &&
    isRecord(value.coverage) &&
    Array.isArray(value.coverage.index) &&
    isRecord(value.coverage.editorial)
  );
}

// Where the content comes from, under what terms, how much of it there is and what it leaves out.
export function fetchSources(): Promise<SourcesData> {
  return fetchObject<SourcesData>('/history/sources', isSourcesData);
}

// "Segnala un errore". The one endpoint that writes, so the backend limits it per caller: a
// refused or over-limit report arrives as a thrown "HTTP 400" / "HTTP 429", for the form to tell
// apart (describeFetchError reads such a status the same way).
export async function submitErrorReport(report: ErrorReport): Promise<ReportReceipt> {
  const envelope = await api.post<ApiResponse<unknown>>('/history/reports', report);
  if (!envelope.success || !isRecord(envelope.data) || typeof envelope.data.id !== 'number') {
    throw new Error(extractErrorMessage(envelope));
  }
  return envelope.data as unknown as ReportReceipt;
}
