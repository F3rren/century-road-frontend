import type { HistoryLanguage } from '@/features/history';
import type { UiLanguage } from './index';

// The history API only ever serves Wikipedia content in Italian or English —
// there is no German or French edition to request. A UI language with no
// matching content language falls back to English, the broader-coverage
// edition, rather than Italian.
const CONTENT_LANGUAGE_BY_UI_LANGUAGE: Record<UiLanguage, HistoryLanguage> = {
  it: 'it',
  en: 'en',
  de: 'en',
  fr: 'en',
};

export function deriveContentLanguage(uiLanguage: string): HistoryLanguage {
  return CONTENT_LANGUAGE_BY_UI_LANGUAGE[uiLanguage as UiLanguage] ?? 'en';
}
