import type { HistoricalEvent } from '../types';

export const CATEGORY_LABELS: Record<HistoricalEvent['category'], string> = {
  war:      'Guerra',
  politics: 'Politica',
  science:  'Scienza',
  culture:  'Cultura',
  disaster: 'Disastro',
  economy:  'Economia',
};
