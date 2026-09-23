import { useTranslation } from "react-i18next";
import { SettingsSection } from "./SettingsSection";

// Documents the app's real bindings — AppLayout's useKeyboardShortcuts call
// (1/2/3/4) and EventsPanel's own ('/') — nothing invented here.
const SHORTCUTS: readonly { key: string; actionKey: string }[] = [
  { key: "1", actionKey: "nav.map" },
  { key: "2", actionKey: "nav.dashboard" },
  { key: "3", actionKey: "nav.archive" },
  { key: "4", actionKey: "nav.settings" },
  { key: "/", actionKey: "settings.shortcuts.focusCountryPicker" },
];

export function ShortcutsSection() {
  const { t } = useTranslation();

  return (
    <SettingsSection title={t("settings.shortcuts.title")}>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs uppercase text-muted-foreground">
            <th scope="col" className="w-16 py-1.5 font-medium">
              {t("settings.shortcuts.columnKey")}
            </th>
            <th scope="col" className="py-1.5 font-medium">
              {t("settings.shortcuts.columnAction")}
            </th>
          </tr>
        </thead>
        <tbody>
          {SHORTCUTS.map(({ key, actionKey }) => (
            <tr key={key} className="border-b border-border last:border-b-0">
              <td className="py-1.5 font-mono">{key}</td>
              <td className="py-1.5">{t(actionKey)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-muted-foreground">{t("settings.shortcuts.disabledNote")}</p>
    </SettingsSection>
  );
}
