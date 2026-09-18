import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardStats, useDashboard } from "@/features/dashboard";
import { usePageTitle } from "@/hooks/usePageTitle";

export function DashboardPage() {
  const { stats, loading, error, refetch } = useDashboard();
  usePageTitle("Dashboard");

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Panoramica generale</p>
        </div>
        {loading ? (
          <div
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            aria-busy="true"
            aria-label="Caricamento statistiche"
          >
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg border bg-card" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-12 text-center">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            <p className="text-sm font-medium">{error}</p>
            <Button size="sm" onClick={refetch}>
              Riprova
            </Button>
          </div>
        ) : (
          <DashboardStats stats={stats} />
        )}
      </div>
    </div>
  );
}
