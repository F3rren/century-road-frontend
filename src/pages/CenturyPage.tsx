import { useEffect } from "react";
import { Trans, useTranslation } from "react-i18next";
import { PageHeader } from "@/components/ui/PageHeader";
import { CenturyFilters, CenturyTimeline, CountrySuggestions, useCenturyParams } from "@/features/century";
import { trackCountryView } from "@/features/history";
import { ProseLink } from "@/features/info";
import { localizedCountryName } from "@/features/map/data";
import { usePageMeta } from "@/hooks/usePageMeta";
import { deriveContentLanguage } from "@/i18n/contentLanguage";

export function CenturyPage() {
  const { t, i18n } = useTranslation();
  const { params, update } = useCenturyParams();
  // Follows the UI language like the map: Italian or English texts, English for de/fr.
  const language = deriveContentLanguage(i18n.language);
  const countryName = params.country ? localizedCountryName(params.country, params.country, i18n.language) : null;
  // With a country, the title names it - and becomes the suggested file name of a saved PDF.
  const title = countryName ? t("century.titleFor", { country: countryName }) : t("nav.century");
  usePageMeta(title, t("meta.century.description"));

  // Picking a country here counts as a view of it, as picking one on the map does.
  useEffect(() => {
    if (params.country) trackCountryView(params.country);
  }, [params.country]);

  return (
    <div className="h-full overflow-y-auto p-6 print:h-auto print:overflow-visible print:p-0">
      <div className="mx-auto max-w-prose space-y-6 pb-8 print:max-w-none">
        <PageHeader title={title} description={t("century.pageDescription")} />
        <p className="text-sm text-muted-foreground print:hidden">
          <Trans i18nKey="century.methodNote" components={{ methodology: <ProseLink to="/methodology" /> }} />
        </p>
        <CenturyFilters params={params} language={language} onChange={update} />
        {params.country ? (
          <CenturyTimeline
            country={params.country}
            language={language}
            fromYear={params.fromYear}
            toYear={params.toYear}
          />
        ) : (
          <CountrySuggestions language={language} onPick={(country) => update({ country })} />
        )}
      </div>
    </div>
  );
}
