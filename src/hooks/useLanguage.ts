import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES, type UiLanguage } from "@/i18n";

// Thin wrapper over react-i18next's own state: persistence to localStorage
// already happens once, centrally, via the 'languageChanged' listener
// registered in src/i18n/index.ts — this hook just narrows i18n.language to
// the app's known language set for callers that need a typed value.
export function useLanguage() {
  const { i18n } = useTranslation();
  const isKnown = (SUPPORTED_LANGUAGES as readonly string[]).includes(i18n.language);
  const language: UiLanguage = isKnown ? (i18n.language as UiLanguage) : "it";

  const setLanguage = (next: UiLanguage) => {
    void i18n.changeLanguage(next);
  };

  return { language, setLanguage };
}
