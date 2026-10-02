import { Trans, useTranslation } from "react-i18next";
import { PageHeader } from "@/components/ui/PageHeader";
import { Kbd, ProseLink } from "@/features/info";
import { LegalSection } from "@/features/legal";
import { HEAT_LEVELS } from "@/features/map/data";
import { usePageMeta } from "@/hooks/usePageMeta";

// Every tag the answers below may use, so each <Trans> gets the same set.
const LINKS = {
  kbd: <Kbd />,
  archive: <ProseLink to="/archive" />,
  methodology: <ProseLink to="/methodology" />,
  settings: <ProseLink to="/settings" />,
  privacy: <ProseLink to="/privacy" />,
};

// Asked in this order: first what the map shows, then how to move around it,
// then the questions people hit once they're using it.
const QUESTIONS = ["country", "archive", "theme", "dashboard", "language", "stale", "shortcuts", "prefs"] as const;

export function GuidePage() {
  const { t } = useTranslation();
  usePageMeta(t("nav.guide"), t("meta.guide.description"));

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-prose space-y-8 pb-8">
        <PageHeader title={t("guide.title")} description={t("guide.description")} />

        <LegalSection title={t("guide.map.title")}>
          <p>{t("guide.map.p1")}</p>
          {/* Same thresholds, colors and labels as the map's own legend. */}
          <ul className="space-y-1">
            {[...HEAT_LEVELS].reverse().map(({ color, labelKey }) => (
              <li key={labelKey} className="flex items-center gap-2 text-sm tabular-nums">
                <span aria-hidden="true" className="h-3 w-3 shrink-0" style={{ backgroundColor: color }} />
                {t(`map.legend.level.${labelKey}`)}
              </li>
            ))}
          </ul>
          <p>
            <Trans i18nKey="guide.map.p2" components={LINKS} />
          </p>
        </LegalSection>

        {QUESTIONS.map((key) => (
          <LegalSection key={key} title={t(`guide.${key}.title`)}>
            <p>
              <Trans i18nKey={`guide.${key}.p1`} components={LINKS} />
            </p>
          </LegalSection>
        ))}
      </div>
    </div>
  );
}
