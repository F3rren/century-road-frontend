export type HeatLevelKey = "high" | "mid" | "low";

export interface HeatLevel {
  min: number;
  // The ink: a token hex.
  color: string;
  // How much of the ink is printed over the paper. Less than 1 so that the country's own line and
  // the geography under it stay in sight.
  opacity: number;
  // What `color` at `opacity` looks like on the paper, as one opaque hex, for the legend and the
  // guide: a swatch cannot show what is beneath it, and these sit on other grounds.
  swatch: string;
  labelKey: HeatLevelKey;
}

// The paper the map is printed on (DESIGN.md, The Paper Map Rule), as a fixed hex: MapLibre paint
// cannot read CSS custom properties.
export const PAPER = "#F4F6F3";

// What `ink` looks like at `opacity` over `ground`, as an opaque hex.
export function blendHex(ink: string, opacity: number, ground: string): string {
  const channels = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const [inkChannels, groundChannels] = [channels(ink), channels(ground)];
  return (
    "#" +
    inkChannels
      .map((c, i) => Math.round(opacity * c + (1 - opacity) * groundChannels[i]))
      .map((c) => c.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

const level = (min: number, color: string, opacity: number, labelKey: HeatLevelKey): HeatLevel => ({
  min,
  color,
  opacity,
  swatch: blendHex(color, opacity, PAPER),
  labelKey,
});

// Single source of truth for the heatmap thresholds/colors: consumed by both
// the MapLibre paint expression (MapView) and the on-map legend (HeatLegend,
// which resolves labelKey to translated text via map.legend.level.*) so the
// two can never drift apart. A cyanotype exposure scale: the more events a
// country has, the deeper its blue. It is printed translucent, so each step
// is lighter than its ink: 6.3:1, 3.0:1 and 1.6:1 against the paper once blended
// (the opaque inks were 13.4:1, 8.0:1 and 3.3:1), and still three steps apart
// (2.1:1 and 1.9:1 between neighbours). The lightest no longer clears 3:1 on its
// own (WCAG 1.4.11): the Prussian outline MapView draws around every one of
// today's countries (13.4:1) is what makes the shape readable, the fill what
// tells the steps apart.
export const HEAT_LEVELS: readonly HeatLevel[] = [
  level(6, "#0E2A47", 0.75, "high"),
  level(3, "#1F4E79", 0.6, "mid"),
  level(1, "#5F8BB8", 0.45, "low"),
];

// The step a country with this many events falls in. Fewer than one event is not a step; the
// lowest is returned for it as it always was.
function heatLevel(count: number): HeatLevel {
  return HEAT_LEVELS.find((l) => count >= l.min) ?? HEAT_LEVELS[HEAT_LEVELS.length - 1];
}

export function heatColor(count: number): string {
  return heatLevel(count).color;
}

export function heatOpacity(count: number): number {
  return heatLevel(count).opacity;
}
