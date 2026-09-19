import { api } from '@/services/api';
import type { ApiResponse } from '@/types';
import type { OnThisDayData, OnThisDayParams } from '../types';

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
    throw new Error('Risposta del backend non nel formato atteso');
  }
  return envelope.data;
}
