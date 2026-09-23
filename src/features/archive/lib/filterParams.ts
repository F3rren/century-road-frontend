import { SECTION_ORDER, type HistorySectionKey } from '@/features/history';
import { daysInMonth, todayMonthDay } from '@/lib/months';
import type { ArchiveFilters } from '../types';

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

// The default view: today's date, the plain event list, Italian, no year or
// text filter — the same day the "Accadde oggi" panel highlights on the map,
// just not narrowed to the 20th century.
export function defaultFilters(): ArchiveFilters {
  const { month, day } = todayMonthDay();
  return { month, day, fromYear: null, toYear: null, types: ['events'], lang: 'it', query: '' };
}

function parseYear(raw: string | null): number | null {
  if (raw === null || raw === '') return null;
  const value = Number(raw);
  return Number.isInteger(value) ? value : null;
}

function parseTypes(raw: string | null): readonly HistorySectionKey[] {
  if (!raw) return [];
  const known = new Set(SECTION_ORDER);
  const requested = new Set(raw.split(',').filter((key): key is HistorySectionKey => known.has(key as HistorySectionKey)));
  return SECTION_ORDER.filter((key) => requested.has(key));
}

// Reads filters out of the page's own URL, so the archive is bookmarkable and
// the back button steps through filter changes like it does everywhere else
// on the web. Anything missing or malformed (a hand-edited URL, an old link
// after this page's params changed shape) falls back to today's default
// rather than erroring.
export function parseFilters(params: URLSearchParams): ArchiveFilters {
  const fallback = defaultFilters();
  const month = clamp(Number(params.get('month')) || fallback.month, 1, 12);
  const day = clamp(Number(params.get('day')) || fallback.day, 1, daysInMonth(month));
  const types = parseTypes(params.get('types'));

  return {
    month,
    day,
    fromYear: parseYear(params.get('from')),
    toYear: parseYear(params.get('to')),
    types: types.length > 0 ? types : fallback.types,
    lang: params.get('lang') === 'en' ? 'en' : 'it',
    query: params.get('q') ?? '',
  };
}

export function toSearchParams(filters: ArchiveFilters): URLSearchParams {
  const params = new URLSearchParams();
  params.set('month', String(filters.month));
  params.set('day', String(filters.day));
  if (filters.fromYear !== null) params.set('from', String(filters.fromYear));
  if (filters.toYear !== null) params.set('to', String(filters.toYear));
  if (filters.types.length > 0) params.set('types', filters.types.join(','));
  if (filters.lang !== 'it') params.set('lang', filters.lang);
  if (filters.query) params.set('q', filters.query);
  return params;
}
