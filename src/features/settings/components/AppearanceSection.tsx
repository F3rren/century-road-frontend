import { Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SegmentedGroup } from "@/components/ui/SegmentedGroup";
import { useTheme } from "@/hooks/useTheme";
import { SettingsSection } from "./SettingsSection";

export function AppearanceSection() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();

  return (
    <SettingsSection title={t("settings.appearance.title")}>
      <SegmentedGroup
        value={theme}
        onChange={setTheme}
        ariaLabel={t("settings.appearance.title")}
        options={[
          { value: "light", label: t("settings.appearance.light"), Icon: Sun },
          { value: "dark", label: t("settings.appearance.dark"), Icon: Moon },
        ]}
      />
    </SettingsSection>
  );
}
