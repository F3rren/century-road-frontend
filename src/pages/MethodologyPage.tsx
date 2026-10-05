import { Trans, useTranslation } from "react-i18next";
import { ReadingPage } from "@/components/layout/ReadingPage";
import { ProseLink, TodayReport } from "@/features/info";
import { LegalSection } from "@/features/legal";
import { usePageMeta } from "@/hooks/usePageMeta";

const GEOCODING_LIMITS = ["limitSubject", "limitNone", "limitBorder", "limitIslands"] as const;

export function MethodologyPage() {
  const { t } = useTranslation();
  usePageMeta(t("nav.methodology"), t("meta.methodology.description"));

  return (
    <ReadingPage title={t("methodology.title")} description={t("methodology.description")}>
        <LegalSection title={t("methodology.source.title")}>
          <p>{t("methodology.source.p1")}</p>
          <p>
            <Trans i18nKey="methodology.source.p2" components={{ strong: <strong /> }} />
          </p>
        </LegalSection>

        <LegalSection title={t("methodology.report.title")}>
          <TodayReport />
        </LegalSection>

        <LegalSection title={t("methodology.languages.title")}>
          <p>{t("methodology.languages.p1")}</p>
          <p>
            <Trans i18nKey="methodology.languages.p2" components={{ archive: <ProseLink to="/archive" /> }} />
          </p>
        </LegalSection>

        <LegalSection title={t("methodology.freshness.title")}>
          <p>{t("methodology.freshness.p1")}</p>
        </LegalSection>

        <LegalSection title={t("methodology.geocoding.title")}>
          <p>{t("methodology.geocoding.p1")}</p>
          <p>{t("methodology.geocoding.p2")}</p>
          <ul className="list-disc space-y-1.5 pl-5">
            {GEOCODING_LIMITS.map((key) => (
              <li key={key}>{t(`methodology.geocoding.${key}`)}</li>
            ))}
          </ul>
          <p>{t("methodology.geocoding.p3")}</p>
        </LegalSection>

        <LegalSection title={t("methodology.index.title")}>
          <p>
            <Trans i18nKey="methodology.index.p1" components={{ century: <ProseLink to="/century" /> }} />
          </p>
        </LegalSection>

        <LegalSection title={t("methodology.errors.title")}>
          <p>{t("methodology.errors.p1")}</p>
          <p>
            <Trans i18nKey="methodology.errors.p2" components={{ credits: <ProseLink to="/credits" /> }} />
          </p>
        </LegalSection>

        <LegalSection title={t("methodology.limits.title")}>
          <p>{t("methodology.limits.p1")}</p>
        </LegalSection>

        <LegalSection title={t("methodology.views.title")}>
          <p>
            <Trans i18nKey="methodology.views.p1" components={{ privacy: <ProseLink to="/privacy" /> }} />
          </p>
        </LegalSection>
    </ReadingPage>
  );
}
