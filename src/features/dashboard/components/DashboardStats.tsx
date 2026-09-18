import type { StatCard } from "../types";

interface DashboardStatsProps {
  stats: StatCard[];
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  if (stats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 border border-dashed border-border py-12 text-center">
        <p className="text-sm font-medium">Nessuna statistica disponibile</p>
        <p className="text-xs text-muted-foreground">
          I dati compariranno qui non appena l'archivio conterrà eventi.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 divide-x divide-y divide-border border border-border sm:grid-cols-4 sm:divide-y-0">
      {stats.map((stat) => (
        <div key={stat.id} className="p-5">
          <p className="font-display text-eyebrow uppercase text-muted-foreground">
            {stat.label}
          </p>
          <p className="mt-2 font-display text-4xl font-semibold tabular-nums tracking-tight text-primary">
            {stat.value}
          </p>
          {stat.detail && (
            <p className="mt-1 text-xs text-muted-foreground">{stat.detail}</p>
          )}
        </div>
      ))}
    </div>
  );
}
