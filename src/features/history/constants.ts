import type { HistorySectionKey } from './types';

export const SECTION_LABELS: Record<HistorySectionKey, string> = {
  selected: 'In evidenza',
  events: 'Eventi',
  births: 'Nascite',
  deaths: 'Morti',
  holidays: 'Ricorrenze',
};

// The order sections are requested and shown in: the editors' picks first,
// then the full lists, roughly from the most to the least commonly wanted.
export const SECTION_ORDER: readonly HistorySectionKey[] = [
  'selected',
  'events',
  'births',
  'deaths',
  'holidays',
];
