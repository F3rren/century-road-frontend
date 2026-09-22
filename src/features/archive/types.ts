import type { HistoryLanguage, HistorySectionKey } from '@/features/history';

export interface ArchiveFilters {
  month: number;
  day: number;
  // null means unbounded on that side. Negative for years before the common era.
  fromYear: number | null;
  toYear: number | null;
  types: readonly HistorySectionKey[];
  lang: HistoryLanguage;
  // Client-side text filter over the already-fetched entries; never sent to the API.
  query: string;
}
