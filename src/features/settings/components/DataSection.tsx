import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { THEME_STORAGE_KEY } from "@/hooks/useTheme";
import { LANGUAGE_STORAGE_KEY } from "@/i18n";
import { MAP_PROJECTION_STORAGE_KEY } from "@/hooks/useMapProjection";
import { REDUCED_MOTION_STORAGE_KEY } from "@/hooks/useReducedMotion";
import { WELCOME_SEEN_STORAGE_KEY } from "@/lib/welcomeSeen";
import { SettingsSection } from "./SettingsSection";

const STORAGE_KEYS = [
  THEME_STORAGE_KEY,
  LANGUAGE_STORAGE_KEY,
  MAP_PROJECTION_STORAGE_KEY,
  REDUCED_MOTION_STORAGE_KEY,
  WELCOME_SEEN_STORAGE_KEY,
];

export function DataSection() {
  const { t } = useTranslation();

  function handleClear() {
    if (!window.confirm(t("settings.data.clearConfirm"))) return;
    // Named keys only, not a blanket localStorage.clear() — an unrelated
    // key a future feature adds should never be silently swept up here.
    for (const key of STORAGE_KEYS) {
      try {
        localStorage.removeItem(key);
      } catch {
        // Private-browsing/storage-blocked: nothing was persisted anyway.
      }
    }
    window.location.reload();
  }

  return (
    <SettingsSection title={t("settings.data.title")}>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="outline" size="sm" onClick={handleClear}>
          {t("settings.data.clearButton")}
        </Button>
        <Link to="/privacy" className="text-sm text-primary hover:underline">
          {t("settings.data.privacyLink")}
        </Link>
      </div>
      <p className="text-xs text-muted-foreground">{t("settings.data.legalNote")}</p>
    </SettingsSection>
  );
}
