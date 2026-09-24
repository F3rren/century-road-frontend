import { useEffect } from "react";
import { useTranslation } from "react-i18next";

// react-i18next never touches <html lang> itself; index.html hardcodes
// lang="it" for the pre-hydration flash. Keep the real attribute in step
// with the active UI language, for assistive tech and browser features
// (spellcheck, translation prompts) that read it.
export function useSyncHtmlLang() {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);
}
