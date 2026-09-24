import type { UiLanguage } from './index';

// Endonyms — each language's own name for itself. Never translated: like the
// "Century Road" brand name, these read identically no matter which UI
// language is currently active.
export const LANGUAGE_OPTIONS: readonly { code: UiLanguage; nativeName: string }[] = [
  { code: 'it', nativeName: 'Italiano' },
  { code: 'en', nativeName: 'English' },
  { code: 'de', nativeName: 'Deutsch' },
  { code: 'fr', nativeName: 'Français' },
];
