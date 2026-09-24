import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  AppearanceSection,
  LanguageSection,
  MapSection,
  AccessibilitySection,
  ShortcutsSection,
  DataSection,
} from "@/features/settings";
import { usePageMeta } from "@/hooks/usePageMeta";

export function SettingsPage() {
  const { t } = useTranslation();
  usePageMeta(t("nav.settings"), t("meta.settings.description"));

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <PageHeader title={t("nav.settings")} description={t("settings.pageDescription")} />
        <AppearanceSection />
        <LanguageSection />
        <MapSection />
        <AccessibilitySection />
        <ShortcutsSection />
        <DataSection />
      </div>
    </div>
  );
}
