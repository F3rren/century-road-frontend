import { cn } from "@/lib/utils";
import type { StatCard } from "../types";

interface DashboardStatsProps {
  stats: StatCard[];
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  if (stats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed py-12 text-center">
        <p className="text-sm font-medium">Nessuna statistica disponibile</p>
        <p className="text-xs text-muted-foreground">
          I dati compariranno qui non appena saranno disponibili.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <div key={stat.id} className="rounded-lg border bg-card p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">{stat.label}</p>
          <p className="mt-1 text-2xl font-bold">{stat.value}</p>
          {stat.change !== undefined && (
            <p
              className={cn(
                "mt-1 text-xs font-medium",
                stat.change >= 0 ? "text-success" : "text-destructive"
              )}
            >
              {stat.change >= 0 ? "+" : ""}
              {stat.change}% rispetto al mese scorso
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
