import { useTranslation } from "react-i18next";
import { LANGUAGE_OPTIONS } from "@/i18n/languages";
import type { UiLanguage } from "@/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { formatEventDate, todayMonthDay } from "@/lib/months";
import { SettingsSection } from "./SettingsSection";

const FIELD_CLASS =
  "min-h-11 w-full max-w-xs border border-input bg-background px-2 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function LanguageSection() {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();

  const today = todayMonthDay();
  const todayExample = formatEventDate(today.day, today.month, new Date().getFullYear(), language);
  // A real BC date (Caesar's assassination) to make the era-suffix change
  // (a.C./BC/v. Chr./av. J.-C.) visible, not just described.
  const bcExample = formatEventDate(15, 3, -44, language);

  return (
    <SettingsSection title={t("settings.language.title")}>
      <div>
        <label htmlFor="settings-language" className="mb-1.5 block text-sm font-medium">
          {t("settings.language.uiLabel")}
        </label>
        <select
          id="settings-language"
          value={language}
          onChange={(e) => setLanguage(e.target.value as UiLanguage)}
          className={FIELD_CLASS}
        >
          {LANGUAGE_OPTIONS.map(({ code, nativeName }) => (
            <option key={code} value={code}>
              {nativeName}
            </option>
          ))}
        </select>
      </div>
      <p className="text-sm text-muted-foreground">{t("settings.language.contentNote")}</p>
      <div>
        <p className="mb-1 font-display text-eyebrow uppercase text-muted-foreground">
          {t("settings.language.exampleLabel")}
        </p>
        <p className="text-sm tabular-nums">
          {todayExample} · {bcExample}
        </p>
      </div>
    </SettingsSection>
  );
}
