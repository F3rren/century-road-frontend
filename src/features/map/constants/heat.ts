export interface HeatLevel {
  min: number;
  color: string;
  label: string;
}

// Single source of truth for the heatmap thresholds/colors: consumed by both
// the MapLibre paint expression (MapView) and the on-map legend (HeatLegend)
// so the two can never drift apart.
export const HEAT_LEVELS: readonly HeatLevel[] = [
  { min: 6, color: "#ef4444", label: "≥ 6 eventi" },
  { min: 3, color: "#eab308", label: "3–5 eventi" },
  { min: 1, color: "#22c55e", label: "1–2 eventi" },
] as const;

export function heatColor(count: number): string {
  const level = HEAT_LEVELS.find((l) => count >= l.min);
  return level?.color ?? HEAT_LEVELS[HEAT_LEVELS.length - 1].color;
}
