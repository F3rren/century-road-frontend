import { Trans, useTranslation } from "react-i18next";
import { Alert } from "@/components/ui/Alert";
import { SECTION_LABEL_KEYS, type HistoryLanguage, type HistorySectionKey } from "@/features/history";
import { useTodayHistory } from "@/features/map/data";
import { formatEventDate } from "@/lib/months";
import { ProseLink } from "./Prose";

// The sections useTodayHistory asks for: the only two the map and the Dashboard read.
const SECTIONS: readonly HistorySectionKey[] = ["selected", "events"];

const LANGUAGE_LABEL_KEYS: Record<HistoryLanguage, string> = {
  it: "archive.filters.languageItalian",
  en: "archive.filters.languageEnglish",
};

// The backend's warning codes (OnThisDayResponse.warnings). A code added later is
// skipped rather than shown raw.
const WARNING_KEYS: Record<string, string> = {
  PRIMARY_UNAVAILABLE: "methodology.report.warningPrimaryUnavailable",
  FALLBACK_UNAVAILABLE: "methodology.report.warningFallbackUnavailable",
};

const CELL = "py-1.5 pr-4 last:pr-0";

// Today's real backend answer, as a receipt: what the methodology text describes,
// shown on the data it describes rather than asserted.
export function TodayReport() {
  const { t, i18n } = useTranslation();
  const { today, data, isLoading, error, geocodedEvents } = useTodayHistory();
  const date = formatEventDate(today.day, today.month, undefined, i18n.language);

  if (isLoading) return <p className="text-sm italic text-muted-foreground">{t("common.loading")}</p>;
  if (error) return <Alert variant="inline">{t("methodology.report.loadError", { error })}</Alert>;
  if (!data) return null;

  const countryCodes = geocodedEvents.flatMap(({ country }) => (country ? [country.code] : []));
  const warnings = data.warnings.flatMap((code) => (WARNING_KEYS[code] ? [WARNING_KEYS[code]] : []));

  return (
    <div className="space-y-4">
      <p>{t("methodology.report.intro", { date })}</p>

      <table className="w-full text-left text-sm tabular-nums">
        <caption className="sr-only">{t("methodology.report.caption", { date })}</caption>
        <thead>
          <tr className="border-b border-border text-xs uppercase text-muted-foreground">
            <th scope="col" className={`${CELL} font-medium`}>{t("methodology.report.colSection")}</th>
            <th scope="col" className={`${CELL} text-right font-medium`}>{t("methodology.report.colItems")}</th>
            <th scope="col" className={`${CELL} font-medium`}>{t("methodology.report.colLanguage")}</th>
            <th scope="col" className={`${CELL} font-medium`}>{t("methodology.report.colState")}</th>
          </tr>
        </thead>
        <tbody>
          {SECTIONS.map((key) => {
            const section = data.sections[key];
            if (!section) return null;
            const language = t(LANGUAGE_LABEL_KEYS[section.language]);
            return (
              <tr key={key} className="border-b border-border last:border-b-0">
                <th scope="row" className={`${CELL} font-normal`}>{t(SECTION_LABEL_KEYS[key])}</th>
                <td className={`${CELL} text-right`}>{section.items.length}</td>
                <td className={CELL}>
                  {section.fallback ? t("methodology.report.fallback", { language }) : language}
                </td>
                <td className={CELL}>
                  {section.stale ? t("methodology.report.stale") : t("methodology.report.fresh")}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Empty until the country shapes have loaded too: no partial count is shown. */}
      {geocodedEvents.length > 0 && (
        <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 border-t border-border pt-3 text-sm tabular-nums">
          <dt className="text-muted-foreground">{t("methodology.report.attributed")}</dt>
          <dd className="text-right">
            {t("methodology.report.attributedValue", {
              attributed: countryCodes.length,
              total: geocodedEvents.length,
            })}
          </dd>
          <dt className="text-muted-foreground">{t("methodology.report.countries")}</dt>
          <dd className="text-right">{new Set(countryCodes).size}</dd>
        </dl>
      )}

      {warnings.map((key) => (
        <p key={key} className="text-sm text-muted-foreground">
          {t(key)}
        </p>
      ))}

      <p className="text-sm text-muted-foreground">
        <Trans i18nKey="methodology.report.footnote" components={{ archive: <ProseLink to="/archive" /> }} />
      </p>
    </div>
  );
}
