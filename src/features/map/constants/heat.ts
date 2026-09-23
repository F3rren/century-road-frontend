export type HeatLevelKey = "high" | "mid" | "low";

export interface HeatLevel {
  min: number;
  color: string;
  labelKey: HeatLevelKey;
}

// Single source of truth for the heatmap thresholds/colors: consumed by both
// the MapLibre paint expression (MapView) and the on-map legend (HeatLegend,
// which resolves labelKey to translated text via map.legend.level.*) so the
// two can never drift apart.
export const HEAT_LEVELS: readonly HeatLevel[] = [
  { min: 6, color: "#ef4444", labelKey: "high" },
  { min: 3, color: "#eab308", labelKey: "mid" },
  { min: 1, color: "#22c55e", labelKey: "low" },
] as const;

export function heatColor(count: number): string {
  const level = HEAT_LEVELS.find((l) => count >= l.min);
  return level?.color ?? HEAT_LEVELS[HEAT_LEVELS.length - 1].color;
}
