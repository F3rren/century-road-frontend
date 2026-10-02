import { Trans, useTranslation } from "react-i18next";
import { ExternalAnchor } from "@/components/ui/ExternalAnchor";
import { PageHeader } from "@/components/ui/PageHeader";
import { ContactEmail, LegalSection, OPERATOR_NAME } from "@/features/legal";
import {
  BACKEND_REPO_URL,
  CC_BY_SA_URL,
  FRONTEND_REPO_URL,
  NATURAL_EARTH_TERMS_URL,
  OPENFREEMAP_URL,
  OSM_COPYRIGHT_URL,
  PHOTO_404_CREDIT_URL,
  WIKIMEDIA_COMMONS_URL,
  WIKIPEDIA_URL,
} from "@/features/terms";
import { usePageMeta } from "@/hooks/usePageMeta";

const LINKS = {
  wikipedia: <ExternalAnchor href={WIKIPEDIA_URL} className="text-primary" />,
  license: <ExternalAnchor href={CC_BY_SA_URL} className="text-primary" />,
  commons: <ExternalAnchor href={WIKIMEDIA_COMMONS_URL} className="text-primary" />,
  osm: <ExternalAnchor href={OSM_COPYRIGHT_URL} className="text-primary" />,
  openfreemap: <ExternalAnchor href={OPENFREEMAP_URL} className="text-primary" />,
  naturalearth: <ExternalAnchor href={NATURAL_EARTH_TERMS_URL} className="text-primary" />,
  photo: <ExternalAnchor href={PHOTO_404_CREDIT_URL} className="text-primary" />,
  frontend: <ExternalAnchor href={FRONTEND_REPO_URL} className="text-primary" />,
  backend: <ExternalAnchor href={BACKEND_REPO_URL} className="text-primary" />,
  github: <ExternalAnchor href={`${FRONTEND_REPO_URL}/issues`} className="text-primary" />,
  email: <ContactEmail />,
};

const DATA_SOURCES = ["wikipedia", "commons", "map", "borders", "photo"] as const;

export function CreditsPage() {
  const { t } = useTranslation();
  usePageMeta(t("nav.credits"), t("meta.credits.description"));

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-prose space-y-8 pb-8">
        <PageHeader title={t("credits.title")} description={t("credits.description")} />

        <LegalSection title={t("credits.data.title")}>
          <ul className="list-disc space-y-1.5 pl-5">
            {DATA_SOURCES.map((key) => (
              <li key={key}>
                <Trans i18nKey={`credits.data.${key}`} components={LINKS} />
              </li>
            ))}
          </ul>
        </LegalSection>

        <LegalSection title={t("credits.software.title")}>
          <p>
            <Trans i18nKey="credits.software.p1" components={LINKS} />
          </p>
          <p>{t("credits.software.p2")}</p>
        </LegalSection>

        <LegalSection title={t("credits.thanks.title")}>
          <p>{t("credits.thanks.p1")}</p>
        </LegalSection>

        <LegalSection title={t("credits.contact.title")}>
          <p>
            <Trans i18nKey="credits.contact.p1" values={{ name: OPERATOR_NAME }} components={LINKS} />
          </p>
          <p>{t("credits.contact.p2")}</p>
        </LegalSection>
      </div>
    </div>
  );
}
