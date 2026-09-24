import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/ui/PageHeader";
import { ArchiveFilters, ArchiveResults, useArchiveFilters } from "@/features/archive";
import { usePageTitle } from "@/hooks/usePageTitle";

export function ArchivePage() {
  const { t } = useTranslation();
  usePageTitle(t("nav.archive"));
  const { filters, update, reset } = useArchiveFilters();
  // Bumped on "Azzera i filtri" so the filter form's own free-text fields
  // (the year range, which hold local state while typing) remount with the
  // reset values instead of going stale — see YearRangeFields.
  const [resetToken, setResetToken] = useState(0);

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <PageHeader
          title={t("nav.archive")}
          description={t("archive.pageDescription")}
        />
        <ArchiveFilters
          key={resetToken}
          filters={filters}
          onChange={update}
          onReset={() => {
            reset();
            setResetToken((token) => token + 1);
          }}
        />
        <ArchiveResults filters={filters} />
      </div>
    </div>
  );
}
