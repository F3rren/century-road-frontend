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
// ~240 country shapes, and the file is ~3.8MB uncompressed (~1.2MB over the
// wire) — worth sharing a single in-flight/resolved promise across all of them
// rather than each doing its own fetch.
let cachedFeatures: Promise<CountryFeature[]> | null = null;

export function fetchCountryFeatures(): Promise<CountryFeature[]> {
  cachedFeatures ??= fetch(COUNTRIES_GEOJSON_URL)
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json() as Promise<CountryFeatureCollection>;
    })
    .then((collection) =>
      // MapView's own click handler requires a code before it will select a country, so
      // an entry without one would be an unselectable country: leave it out. The file is
      // written largest shape first, which is how MapLibre draws it (a small shape lands
      // on top of the one around it); a lookup wants the opposite, the smallest first,
      // so that Gibraltar's few streets answer before the Spain they overlap.
      collection.features.filter((f) => f.properties.iso_a2 && f.properties.iso_a2 !== '-99').reverse(),
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
// America"). The rest of this app follows the active UI language, so the
// ISO A2 code is looked up through the browser's own locale data instead of
// a hand-maintained translation table — one fewer dataset to keep in sync,
// and it is already exactly right for all 174 codes this file's country list
// uses. One Intl.DisplayNames instance per language (construction isn't
// free, and this runs once per country per render). Exported so MapView's
// own click handler (reading the same iso_a2/name/admin properties straight
// off the rendered GeoJSON, not through this module) names a clicked country
// the same way as everything else here.
const regionNamesCache = new Map<string, Intl.DisplayNames>();

function regionNames(language: string): Intl.DisplayNames {
  let formatter = regionNamesCache.get(language);
  if (!formatter) {
    formatter = new Intl.DisplayNames([language], { type: 'region' });
    regionNamesCache.set(language, formatter);
  }
  return formatter;
}

export function localizedCountryName(code: string, englishFallback: string, language: string): string {
  try {
    return regionNames(language).of(code) ?? englishFallback;
  } catch {
    return englishFallback;
  }
}

function toCountry(feature: CountryFeature, language: string): Country {
  const code = feature.properties.iso_a2;
  return {
    code,
    name: localizedCountryName(code, feature.properties.admin || feature.properties.name, language),
  };
}

// Which of these country shapes, if any, contains the given point. Natural
// Earth's 1:10m, simplified, is drawn for a map, not surveyed for geocoding:
// a coordinate right at a border (a capital a few km from a frontier) or on a
// coast can land in the neighbouring country or in the sea, and a very small
// island's shape can still be missing — both true of real coordinates
// Wikipedia supplies, not edge cases invented here. Where shapes overlap, the first one in `features` wins:
// fetchCountryFeatures hands them over smallest first.
export function findCountryAt(
  lon: number,
  lat: number,
  features: readonly CountryFeature[],
  language: string,
): Country | null {
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
  return hit ? toCountry(hit, language) : null;
}

// Every real country this dataset has a shape for, sorted by name — the
// full list the "vai a un paese" picker and the map's click targets share,
// independent of which of them (if any) have an event attributed today.
export function listCountries(features: readonly CountryFeature[], language: string): Country[] {
  const byCode = new Map<string, Country>();
  for (const feature of features) {
    const country = toCountry(feature, language);
    if (!byCode.has(country.code)) byCode.set(country.code, country);
  }
  return Array.from(byCode.values()).sort((a, b) => a.name.localeCompare(b.name, language));
}

// Countries whose shapes add up to less than this many square degrees of bounding box (about
// 1.5 by 1, or 165 by 110 km at the equator) are a few pixels at world scale: Luxembourg, Qatar,
// Malta, every microstate, and archipelagos of tiny atolls such as the Maldives. The map gives
// each of them a marker when it has events today, since the polygon alone cannot be seen or hit.
export const SMALL_COUNTRY_DEG2 = 1.5;

export function isSmallCountry(feature: CountryFeature): boolean {
  const polygons = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates;
  let area = 0;
  for (const polygon of polygons) {
    let [minLng, minLat, maxLng, maxLat] = [Infinity, Infinity, -Infinity, -Infinity];
    for (const [lng, lat] of polygon[0] ?? []) {
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
    }
    if (maxLng >= minLng) area += (maxLng - minLng) * (maxLat - minLat);
  }
  return area < SMALL_COUNTRY_DEG2;
}

// Where the camera should look to show a country: the middle of its largest
// shape's bounding box. The largest one, not the whole country's box, so the
// United States centres on its mainland rather than halfway to Alaska, and a
// country whose islands straddle the antimeridian is not centred on the far
// side of the world.
export function countryAnchor(feature: CountryFeature): [number, number] {
  const polygons = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates;
  let best: [number, number] = [0, 0];
  let bestArea = -1;
  for (const polygon of polygons) {
    const ring = polygon[0] ?? [];
    let [minLng, minLat, maxLng, maxLat] = [Infinity, Infinity, -Infinity, -Infinity];
    for (const [lng, lat] of ring) {
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
    }
    const area = (maxLng - minLng) * (maxLat - minLat);
    if (ring.length && area > bestArea) {
      bestArea = area;
      best = [(minLng + maxLng) / 2, (minLat + maxLat) / 2];
    }
  }
  return best;
}

// The point a globe should face to show a set of weighted places at once: their
// mean on the sphere, not the mean of their longitudes, which would put Japan and
// the US (139° and -98°) on the opposite side of the world from both. Null when
// the places cancel out (or there are none) and no side is better than another.
export function facingCenter(points: readonly { lng: number; lat: number; weight: number }[]): [number, number] | null {
  const rad = Math.PI / 180;
  let x = 0;
  let y = 0;
  let z = 0;
  for (const { lng, lat, weight } of points) {
    x += weight * Math.cos(lat * rad) * Math.cos(lng * rad);
    y += weight * Math.cos(lat * rad) * Math.sin(lng * rad);
    z += weight * Math.sin(lat * rad);
  }
  if (Math.hypot(x, y, z) < 1e-9) return null;
  return [Math.atan2(y, x) / rad, Math.atan2(z, Math.hypot(x, y)) / rad];
}
