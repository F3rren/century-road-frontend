import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ArchiveFilters, ArchiveResults, useArchiveFilters } from "@/features/archive";
import { usePageTitle } from "@/hooks/usePageTitle";

export function ArchivePage() {
  usePageTitle("Archivio");
  const { filters, update, reset } = useArchiveFilters();
  // Bumped on "Azzera i filtri" so the filter form's own free-text fields
  // (the year range, which hold local state while typing) remount with the
  // reset values instead of going stale — see YearRangeFields.
  const [resetToken, setResetToken] = useState(0);

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <PageHeader
          title="Archivio"
          description="Ogni voce che Wikipedia registra per un giorno, con anni e tipo a scelta"
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
