import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import type { Feature, MultiPolygon, Polygon } from 'geojson';
import { COUNTRIES_GEOJSON_URL } from '../constants/countries';
import type { Country } from '../types';

// The handful of properties this module actually reads, out of Natural
// Earth's several dozen. Matches the fields MapView's own click handler
// already keys on (iso_a2, name, admin), so a point-in-polygon lookup and a
// map click resolve the exact same country the exact same way.
interface CountryProperties {
  iso_a2: string;
  name: string;
  admin: string;
}

export type CountryFeature = Feature<Polygon | MultiPolygon, CountryProperties>;

interface CountryFeatureCollection {
  type: 'FeatureCollection';
  features: CountryFeature[];
}

// Fetched once per page load and reused: every caller (the map's heatmap,
// the "vai a un paese" picker, the dashboard's stats) needs the exact same
// ~175 country shapes, and the file is ~600KB uncompressed — worth sharing
// a single in-flight/resolved promise across all of them rather than each
// doing its own fetch.
let cachedFeatures: Promise<CountryFeature[]> | null = null;

export function fetchCountryFeatures(): Promise<CountryFeature[]> {
  cachedFeatures ??= fetch(COUNTRIES_GEOJSON_URL)
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json() as Promise<CountryFeatureCollection>;
    })
    .then((collection) =>
      // A few disputed territories (Kosovo, Somaliland, Northern Cyprus) carry
      // no ISO A2 code in this dataset. MapView's own click handler already
      // requires one before it will select a country, so entries without one
      // are dropped here too rather than surfacing as an unselectable country.
      collection.features.filter((f) => f.properties.iso_a2 && f.properties.iso_a2 !== '-99'),
    )
    .catch((error: unknown) => {
      // Don't cache a rejection: a transient network failure shouldn't
      // permanently block every later attempt for the rest of the session.
      cachedFeatures = null;
      throw error;
    });
  return cachedFeatures;
}

// Natural Earth's own name/admin fields are English ("United States of
// America"). The rest of this app is Italian, so the ISO A2 code is looked
// up through the browser's own locale data instead of a hand-maintained
// translation table — one fewer dataset to keep in sync, and it is already
// exactly right for all 174 codes this file's country list uses. Exported so
// MapView's own click handler (reading the same iso_a2/name/admin properties
// straight off the rendered GeoJSON, not through this module) names a
// clicked country the same way as everything else here.
const REGION_NAMES = new Intl.DisplayNames(['it'], { type: 'region' });

export function localizedCountryName(code: string, englishFallback: string): string {
  try {
    return REGION_NAMES.of(code) ?? englishFallback;
  } catch {
    return englishFallback;
  }
}

function toCountry(feature: CountryFeature): Country {
  const code = feature.properties.iso_a2;
  return { code, name: localizedCountryName(code, feature.properties.admin || feature.properties.name) };
}

// Which of these country shapes, if any, contains the given point. Natural
// Earth's 110m resolution is simplified for map rendering, not surveyed for
// geocoding: a coordinate right at a border (a capital a few km from a
// frontier) can land in the neighbouring country, and a small enough island
// nation's shape can be missing from this resolution entirely — both true of
// real coordinates Wikipedia supplies, not edge cases invented here.
export function findCountryAt(lon: number, lat: number, features: readonly CountryFeature[]): Country | null {
  const point: [number, number] = [lon, lat];
  const hit = features.find((feature) => {
    try {
      return booleanPointInPolygon(point, feature);
    } catch {
      // A degenerate ring in the source data shouldn't take down the whole
      // lookup — treat that one shape as a non-match and keep going.
      return false;
    }
  });
  return hit ? toCountry(hit) : null;
}

// Every real country this dataset has a shape for, sorted by name — the
// full list the "vai a un paese" picker and the map's click targets share,
// independent of which of them (if any) have an event attributed today.
export function listCountries(features: readonly CountryFeature[]): Country[] {
  const byCode = new Map<string, Country>();
  for (const feature of features) {
    const country = toCountry(feature);
    if (!byCode.has(country.code)) byCode.set(country.code, country);
  }
  return Array.from(byCode.values()).sort((a, b) => a.name.localeCompare(b.name));
}
