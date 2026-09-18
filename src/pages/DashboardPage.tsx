import { PageHeader } from "@/components/ui/PageHeader";
import { DashboardStats, useDashboard } from "@/features/dashboard";
import { usePageTitle } from "@/hooks/usePageTitle";

export function DashboardPage() {
  const { stats } = useDashboard();
  usePageTitle("Dashboard");

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <PageHeader
          title="Dashboard"
          description="Statistiche sull'archivio storico di Century Road"
        />
        <DashboardStats stats={stats} />
      </div>
    </div>
  );
}
