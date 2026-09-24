import { Globe, Map as MapFlat } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SegmentedGroup } from "@/components/ui/SegmentedGroup";
import { useMapProjection } from "@/hooks/useMapProjection";
import { SettingsSection } from "./SettingsSection";

export function MapSection() {
  const { t } = useTranslation();
  const { defaultProjection, setDefaultProjection } = useMapProjection();

  return (
    <SettingsSection title={t("settings.map.title")}>
      <div>
        <p className="mb-1.5 text-sm font-medium">{t("settings.map.defaultProjectionLabel")}</p>
        <SegmentedGroup
          value={defaultProjection}
          onChange={setDefaultProjection}
          ariaLabel={t("settings.map.defaultProjectionLabel")}
          options={[
            { value: "mercator", label: t("map.projection.mercator"), Icon: MapFlat },
            { value: "globe", label: t("map.projection.globe"), Icon: Globe },
          ]}
        />
      </div>
    </SettingsSection>
  );
}
