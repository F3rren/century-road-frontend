import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import it from './locales/it.json';
import en from './locales/en.json';
import de from './locales/de.json';
import fr from './locales/fr.json';

export const SUPPORTED_LANGUAGES = ['it', 'en', 'de', 'fr'] as const;
export type UiLanguage = (typeof SUPPORTED_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: UiLanguage = 'it';
export const LANGUAGE_STORAGE_KEY = 'century-road-language';

function isUiLanguage(value: string | null): value is UiLanguage {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(value ?? '');
}

// Mirrors useTheme's getInitialTheme: read the persisted choice, fall back
// silently (private browsing / storage blocked) rather than erroring.
function getInitialLanguage(): UiLanguage {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return isUiLanguage(stored) ? stored : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

// No HTTP backend: resources below are already in memory, so t() works
// immediately after this call resolves synchronously — no async loading
// window, no language flash to guard against the way the theme's FOUC
// script does.
void i18next.use(initReactI18next).init({
  resources: {
    it: { translation: it },
    en: { translation: en },
    de: { translation: de },
    fr: { translation: fr },
  },
  lng: getInitialLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

// Persist every change, including ones made outside <LanguageSection> (there
// are none today, but this keeps the storage write in one place rather than
// duplicated at each call site that can trigger a language change).
i18next.on('languageChanged', (lng) => {
  try {
    if (isUiLanguage(lng)) localStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
  } catch {
    // Private-browsing/storage-blocked: language still applies for this
    // session, it just won't persist across reloads.
  }
});

export default i18next;
