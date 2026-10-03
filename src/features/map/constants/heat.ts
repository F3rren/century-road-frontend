export type HeatLevelKey = "high" | "mid" | "low";

export interface HeatLevel {
  min: number;
  color: string;
  labelKey: HeatLevelKey;
}

// Single source of truth for the heatmap thresholds/colors: consumed by both
// the MapLibre paint expression (MapView) and the on-map legend (HeatLegend,
// which resolves labelKey to translated text via map.legend.level.*) so the
// two can never drift apart. A cyanotype exposure scale: the more events a
// country has, the deeper its blue, from a light wash to Prussian.
export const HEAT_LEVELS: readonly HeatLevel[] = [
  { min: 6, color: "#0E2A47", labelKey: "high" },
  { min: 3, color: "#3F79AE", labelKey: "mid" },
  { min: 1, color: "#9EC0DD", labelKey: "low" },
] as const;

export function heatColor(count: number): string {
  const level = HEAT_LEVELS.find((l) => count >= l.min);
  return level?.color ?? HEAT_LEVELS[HEAT_LEVELS.length - 1].color;
}
