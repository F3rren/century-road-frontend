import type { Feature, FeatureCollection, Point } from 'geojson';
import { heatColor, heatOpacity } from '../constants/heat';
import { FIXER, SELECTED_GRAIN_OPACITY } from '../constants/selection';

// A country too small to be seen or hit as a shape at world scale (isSmallCountry), where the
// camera looks to show it.
export interface SmallCountry {
  code: string;
  name: string;
  anchor: [number, number];
}

export interface SmallCountryProperties {
  iso_a2: string;
  name: string;
  // The ink and how much of it, the same as the polygon of a larger country gets.
  color: string;
  opacity: number;
}

// The markers the map prints for small countries: one grain for each that has an event today, in
// the colour its shape would have, and one for the selected country, in the selection's colour
// and nearly opaque. Every other small country has none: an empty ring on the print would say
// nothing the picker does not.
export function smallCountryPoints(
  small: readonly SmallCountry[],
  heatmap: Record<string, number>,
  selectedCode: string | null,
): FeatureCollection<Point, SmallCountryProperties> {
  const features = small.flatMap(({ code, name, anchor }): Feature<Point, SmallCountryProperties>[] => {
    const selected = code === selectedCode;
    const count = heatmap[code] ?? 0;
    if (!selected && count < 1) return [];
    return [
      {
        type: 'Feature',
        properties: {
          iso_a2: code,
          name,
          color: selected ? FIXER : heatColor(count),
          opacity: selected ? SELECTED_GRAIN_OPACITY : heatOpacity(count),
        },
        geometry: { type: 'Point', coordinates: anchor },
      },
    ];
  });
  return { type: 'FeatureCollection', features };
}
