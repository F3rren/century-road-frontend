// Builds src/assets/geo/countries.json (a GeoJSON FeatureCollection; named .json so that every
// server types and compresses it as JSON), the country shapes the map draws, picks from and
// geocodes against.
//
// Source: Natural Earth (public domain) through the `world-atlas` package, at 1:10m, the finest
// it has, simplified on the topology (so that a border two countries share stays one border) until
// a vertex that moves a line by less than SIMPLIFY square degrees of triangle is dropped. Raw, the
// 1:10m file is 9 MB (2.5 MB gzipped); simplified it is about a fifth of the points and still finer
// than the 1:50m file it replaces, which had 238 shapes at 100,000 points and drew a coast to
// within a kilometre or two. Before that came 1:110m, 177 shapes and no microstate.
//
// Not a project dependency: install the four packages without saving them, then run
//   npm install --no-save world-atlas@2.0.2 topojson-client@3 topojson-simplify@3 i18n-iso-countries@7
//   node scripts/build-countries.mjs
//
// What the script decides, so that it is not decided twice:
// - every shape carries `iso_a2`, `name` and `admin`, the three properties the app reads;
// - a shape with no ISO 3166-1 number joins the country it lies in, or belongs to by ISO
//   (Somaliland to Somalia, Northern Cyprus, Akrotiri, Dhekelia and the UN buffer zone to Cyprus,
//   the Guantanamo base to Cuba, Baikonur to Kazakhstan, the Indian Ocean and Coral Sea islands
//   to Australia, Clipperton to France), so the map has no hole there, and several shapes of one
//   country become a single MultiPolygon, so that a country has one shape and one anchor; Kosovo
//   has no ISO code and takes the one the EU, the IMF and CLDR use (XK); the Spratly Islands and
//   three disputed reefs and banks, and the Siachen Glacier, are left out;
// - the Vatican is a 450 m circle round St Peter's: Natural Earth draws it as a line at 1:10m (and
//   1.4 km west of where it is at 1:50m), and a shape in the wrong place would pull the Roman
//   places beside it into the Vatican; the capitals of 119 countries, the small ones among them,
//   are in countries.test.ts: 109 fall inside their country's shape, the other 10 within 2 km of
//   it (an island state's coast, Jerusalem);
// - a polygon that crosses the antimeridian is cut along it (Russia's Chukotka and Wrangel Island,
//   Fiji's Taveuni): world-atlas writes such a ring with a step from 179.8 to -180, which a flat
//   map draws as a line across the whole world and the point-in-polygon lookup reads as a ring
//   that encloses the world; each side becomes a polygon of its own, in [-180, 180];
// - coordinates are rounded to 3 decimals (about 110 m);
// - every polygon is wound the way RFC 7946 asks, and every shape has its `bbox`, which the
//   point-in-polygon lookup uses to skip most shapes;
// - the shapes are written largest first, so a small one (Gibraltar, Monaco) is drawn on top of
//   the one around it, and a lookup reads them the other way round, smallest first.

import { readFileSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const topo = require('topojson-client');
const { presimplify, simplify } = require('topojson-simplify');
const iso = require('i18n-iso-countries');

const OUT = new URL('../src/assets/geo/countries.json', import.meta.url);
const PRECISION = 3;
// Triangle area, in square degrees, under which a vertex is dropped. SIMPLIFY=... to try another.
const SIMPLIFY = Number(process.env.SIMPLIFY ?? 0.0003);
// The share of a country's area that simplification may take away before it is not applied to it.
const MAX_AREA_CHANGE = 0.02;
// A shape with no ISO number: the code it takes, or null to leave it out.
const BY_NAME = {
  Somaliland: 'SO',
  'N. Cyprus': 'CY',
  Akrotiri: 'CY',
  Dhekelia: 'CY',
  'Cyprus U.N. Buffer Zone': 'CY',
  'USNB Guantanamo Bay': 'CU',
  Baikonur: 'KZ',
  'Indian Ocean Ter.': 'AU',
  'Coral Sea Is.': 'AU',
  'Clipperton I.': 'FR',
  Kosovo: 'XK',
  'Siachen Glacier': null,
  'Spratly Is.': null,
  'Bajo Nuevo Bank': null,
  'Serranilla Bank': null,
  'Scarborough Reef': null,
};
const ENGLISH_NAME = { XK: 'Kosovo', VA: 'Vatican City' };
// A shape drawn here instead of taken from Natural Earth: [longitude, latitude, radius in metres].
const CIRCLES = { VA: [12.4531, 41.9028, 450] };

// The 1:10m countries, simplified under `weight` square degrees (not at all when it is 0).
const atlas = (weight) => {
  const topology = JSON.parse(readFileSync(require.resolve('world-atlas/countries-10m.json'), 'utf8'));
  const used = weight ? simplify(presimplify(topology), weight) : topology;
  return topo.feature(used, used.objects.countries).features;
};

const codeOf = (feature) => {
  if (feature.id) return iso.numericToAlpha2(feature.id) ?? null;
  const name = feature.properties.name;
  if (!(name in BY_NAME)) throw new Error(`No ISO code for "${name}": decide it in BY_NAME`);
  return BY_NAME[name];
};

const polygonsOf = (geometry) => (geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates);

// ── antimeridian ─────────────────────────────────────────────────────────────

// The ring with every longitude shifted by whole turns so that no step is wider than 180 degrees.
// Null when it does not close again, which is a ring round a pole (Antarctica's): it is not cut.
const unwrapRing = (ring) => {
  const out = [[...ring[0]]];
  let shift = 0;
  for (let i = 1; i < ring.length; i++) {
    let lon = ring[i][0] + shift;
    const previous = out[i - 1][0];
    while (lon - previous > 180) {
      lon -= 360;
      shift -= 360;
    }
    while (lon - previous < -180) {
      lon += 360;
      shift += 360;
    }
    out.push([lon, ring[i][1]]);
  }
  return Math.abs(out[out.length - 1][0] - out[0][0]) < 1e-9 ? out : null;
};

// The part of a closed ring on one side of the meridian `edge` (Sutherland-Hodgman), closed again.
const clipRing = (ring, edge, keepEast) => {
  const points = ring.slice(0, -1);
  const inside = (p) => (keepEast ? p[0] >= edge : p[0] <= edge);
  const crossing = (a, b) => [edge, a[1] + ((edge - a[0]) / (b[0] - a[0])) * (b[1] - a[1])];
  const out = [];
  points.forEach((current, i) => {
    const previous = points[(i + points.length - 1) % points.length];
    if (inside(current)) {
      if (!inside(previous)) out.push(crossing(previous, current));
      out.push(current);
    } else if (inside(previous)) {
      out.push(crossing(previous, current));
    }
  });
  return out.length ? [...out, [...out[0]]] : [];
};

const ringArea = (ring) => Math.abs(signedArea(ring));

// The polygon, or the polygons it is cut into where it crosses the antimeridian, each with its
// longitudes in [-180, 180].
const splitAtAntimeridian = (polygon) => {
  const rings = polygon.map(unwrapRing);
  if (rings.includes(null)) return [polygon];
  const lons = rings[0].map(([lon]) => lon);
  const [min, max] = [Math.min(...lons), Math.max(...lons)];
  if (min >= -180 && max <= 180) return [polygon];

  // Across 180 going east, or across -180 going west: the piece that is over the edge comes back
  // by a turn.
  const [edge, turn] = max > 180 ? [180, -360] : [-180, 360];
  const across = (ring) => clipRing(ring, edge, max > 180).map(([lon, lat]) => [lon + turn, lat]);
  const stays = (ring) => clipRing(ring, edge, max <= 180);
  const piece = (cut) => {
    const [outer, ...holes] = rings.map(cut);
    return outer.length ? [outer, ...holes.filter((hole) => hole.length)] : null;
  };
  const pieces = [piece(stays), piece(across)].filter(Boolean);

  const before = ringArea(rings[0]) - rings.slice(1).reduce((sum, hole) => sum + ringArea(hole), 0);
  const after = pieces.reduce((sum, [outer, ...holes]) => sum + ringArea(outer) - holes.reduce((s, h) => s + ringArea(h), 0), 0);
  if (Math.abs(before - after) > before * 1e-6) throw new Error(`Cutting at the antimeridian changed an area: ${before} to ${after}`);
  return pieces;
};

// A counter-clockwise circle of 24 points, closed.
const circle = ([lon, lat, metres]) => {
  const dLat = metres / 111_320;
  const dLon = metres / (111_320 * Math.cos((lat * Math.PI) / 180));
  const ring = Array.from({ length: 24 }, (_, i) => {
    const angle = (2 * Math.PI * i) / 24;
    return [lon + dLon * Math.cos(angle), lat + dLat * Math.sin(angle)];
  });
  return [[...ring, ring[0]]];
};

// ── geometry ─────────────────────────────────────────────────────────────────

const signedArea = (ring) => {
  let sum = 0;
  for (let i = 0; i < ring.length - 1; i++) sum += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  return sum / 2;
};

const roundRing = (ring, digits) => {
  const k = 10 ** digits;
  const out = [];
  for (const [x, y] of ring) {
    const p = [Math.round(x * k) / k, Math.round(y * k) / k];
    const last = out[out.length - 1];
    if (!last || last[0] !== p[0] || last[1] !== p[1]) out.push(p);
  }
  // Closed again, in case rounding merged the last point into the first.
  const first = out[0];
  const end = out[out.length - 1];
  if (out.length && (first[0] !== end[0] || first[1] !== end[1])) out.push([...first]);
  return out;
};

// RFC 7946: the exterior ring counter-clockwise, holes clockwise. A ring that rounding collapsed
// (fewer than 4 positions, or no area) is dropped; a polygon with no exterior goes with it.
const cleanPolygon = (polygon, digits) => {
  const rings = polygon.map((ring) => roundRing(ring, digits)).filter((ring) => ring.length >= 4 && signedArea(ring) !== 0);
  if (!rings.length || signedArea(roundRing(polygon[0], digits)) === 0) return null;
  return rings.map((ring, index) => {
    const area = signedArea(ring);
    return (index === 0 ? area < 0 : area > 0) ? [...ring].reverse() : ring;
  });
};

const bboxOf = (polygons) => {
  let [w, s, e, n] = [Infinity, Infinity, -Infinity, -Infinity];
  for (const polygon of polygons) {
    for (const [x, y] of polygon[0]) {
      w = Math.min(w, x);
      e = Math.max(e, x);
      s = Math.min(s, y);
      n = Math.max(n, y);
    }
  }
  return [w, s, e, n];
};

// ── build ────────────────────────────────────────────────────────────────────

// The shapes of every country, simplified under `weight` or not: code -> { name, polygons }, each
// polygon already cut at the antimeridian.
const shapes = (weight) => {
  const byCode = new Map();
  const add = (geometry, code, name) => {
    const entry = byCode.get(code) ?? { code, name: ENGLISH_NAME[code] ?? iso.getName(code, 'en') ?? name, polygons: [] };
    entry.polygons.push(...polygonsOf(geometry).flatMap(splitAtAntimeridian));
    byCode.set(code, entry);
  };
  for (const feature of atlas(weight)) {
    const code = codeOf(feature);
    if (code && !(code in CIRCLES)) add(feature.geometry, code, feature.properties.name);
  }
  for (const [code, spec] of Object.entries(CIRCLES)) add({ type: 'Polygon', coordinates: circle(spec) }, code);
  return byCode;
};

const areaOf = (polygons) =>
  polygons.reduce((sum, [outer, ...holes]) => sum + ringArea(outer) - holes.reduce((s, hole) => s + ringArea(hole), 0), 0);

const byCode = shapes(SIMPLIFY);
const unsimplified = shapes(0);
// An atoll or an islet that simplification leaves with no ring, or a good part of its area less, is
// kept as it is. They are the smallest shapes, so they cost nothing; the border they share with a
// simplified neighbour differs by less than the simplification.
const kept = [];
for (const [code, entry] of byCode) {
  const full = unsimplified.get(code);
  if (Math.abs(areaOf(full.polygons) - areaOf(entry.polygons)) > areaOf(full.polygons) * MAX_AREA_CHANGE) {
    byCode.set(code, full);
    kept.push(code);
  }
}

const features = [...byCode.values()].map(({ code, name, polygons }) => {
  let cleaned;
  for (const digits of [PRECISION, PRECISION + 1, PRECISION + 2]) {
    cleaned = polygons.map((polygon) => cleanPolygon(polygon, digits)).filter(Boolean);
    if (cleaned.length) break;
  }
  if (!cleaned.length) throw new Error(`${code} has no shape left`);
  const bbox = bboxOf(cleaned);
  return {
    type: 'Feature',
    properties: { iso_a2: code, name, admin: name },
    bbox,
    geometry: cleaned.length === 1 ? { type: 'Polygon', coordinates: cleaned[0] } : { type: 'MultiPolygon', coordinates: cleaned },
    area: (bbox[2] - bbox[0]) * (bbox[3] - bbox[1]),
  };
});

// Largest first; ties by code so that the output does not move between runs.
features.sort((a, b) => b.area - a.area || a.properties.iso_a2.localeCompare(b.properties.iso_a2));
for (const feature of features) delete feature.area;

const json = JSON.stringify({ type: 'FeatureCollection', features });
writeFileSync(OUT, json + '\n');
console.log(`${features.length} countries, ${(json.length / 1e6).toFixed(2)} MB, ${(gzipSync(json).length / 1e6).toFixed(2)} MB gzipped`);
console.log(`left unsimplified (${kept.length}): ${kept.join(' ')}`);
