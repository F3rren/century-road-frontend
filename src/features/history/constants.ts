import type { HistorySectionKey } from './types';

// Translation keys, not text — callers pass these to t(). Kept in one place
// so the mapping from section key to its label can't drift between the
// Archive filters checkboxes, the Archive results headings, and anywhere
// else a section list is rendered.
export const SECTION_LABEL_KEYS: Record<HistorySectionKey, string> = {
  selected: 'history.section.selected',
  events: 'history.section.events',
  births: 'history.section.births',
  deaths: 'history.section.deaths',
  holidays: 'history.section.holidays',
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
