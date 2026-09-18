import { CATEGORY_LABELS } from '@/features/map/constants/categories';
import type { HistoricalEvent } from '@/features/map/types';
import type { StatCard } from '../types';

// Real facts about the events dataset, not placeholder business metrics —
// confirmed direction (PRODUCT.md, Product Principle 4). Synchronous: this
// derives from data already in memory, so there's no loading/error state to
// simulate — see useDashboard.ts.
export function computeStats(events: HistoricalEvent[]): StatCard[] {
  if (events.length === 0) return [];

  const countries = new Set(events.map((e) => e.countryCode));
  const years = events.map((e) => e.year);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);

  const categoryCounts = new Map<HistoricalEvent['category'], number>();
  for (const e of events) {
    categoryCounts.set(e.category, (categoryCounts.get(e.category) ?? 0) + 1);
  }
  const [topCategory, topCategoryCount] = [...categoryCounts.entries()].sort(
    (a, b) => b[1] - a[1],
  )[0];

  return [
    { id: 'events', label: 'Eventi archiviati', value: String(events.length) },
    { id: 'countries', label: 'Paesi rappresentati', value: String(countries.size) },
    { id: 'span', label: 'Arco temporale', value: `${minYear}–${maxYear}` },
    {
      id: 'top-category',
      label: 'Categoria più frequente',
      value: CATEGORY_LABELS[topCategory],
      detail: `${topCategoryCount} eventi`,
    },
  ];
}
