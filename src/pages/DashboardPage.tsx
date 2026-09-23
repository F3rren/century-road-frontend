import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/ui/PageHeader";
import { DashboardStats, useDashboard } from "@/features/dashboard";
import { usePageTitle } from "@/hooks/usePageTitle";

export function DashboardPage() {
  const { stats, isLoading, error } = useDashboard();
  usePageTitle("Dashboard");

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <PageHeader
          title="Dashboard"
          description="Statistiche sugli eventi di oggi, con il paese dedotto dagli articoli collegati"
        />

        {isLoading && (
          <p className="px-0.5 py-2 text-sm italic text-muted-foreground">Caricamento…</p>
        )}
        {error && (
          <p role="alert" className="border border-destructive p-4 text-sm text-destructive">
            Impossibile caricare le statistiche ({error}).
          </p>
        )}
        {!isLoading && !error && <DashboardStats stats={stats} />}

        <div className="flex flex-wrap items-center justify-between gap-4 border border-border p-5">
          <div>
            <h2 className="font-display text-eyebrow uppercase text-muted-foreground">
              Archivio
            </h2>
            <p className="mt-1 max-w-prose text-sm text-muted-foreground">
              Queste statistiche sono sugli eventi di oggi. Per sfogliare ogni voce che
              Wikipedia registra per un giorno, di qualunque secolo, filtrando per anno e per
              tipo di voce, apri l'archivio completo.
            </p>
          </div>
          <Link
            to="/archive"
            className="inline-flex min-h-11 shrink-0 items-center gap-1.5 border border-input px-4 text-sm font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Apri l'archivio
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
