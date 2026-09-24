import { useTranslation } from "react-i18next";
import { SegmentedGroup } from "@/components/ui/SegmentedGroup";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { SettingsSection } from "./SettingsSection";

export function AccessibilitySection() {
  const { t } = useTranslation();
  const { enabled, setOverride } = useReducedMotion();

  return (
    <SettingsSection title={t("settings.accessibility.title")}>
      <div>
        <p className="mb-1.5 text-sm font-medium">{t("settings.accessibility.reducedMotionLabel")}</p>
        <SegmentedGroup
          value={enabled ? "on" : "off"}
          onChange={(next) => setOverride(next === "on")}
          ariaLabel={t("settings.accessibility.reducedMotionLabel")}
          options={[
            { value: "off", label: t("settings.accessibility.reducedMotionOff") },
            { value: "on", label: t("settings.accessibility.reducedMotionOn") },
          ]}
        />
      </div>
    </SettingsSection>
  );
}
