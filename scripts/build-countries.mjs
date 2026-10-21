// Builds src/assets/geo/countries.json (a GeoJSON FeatureCollection; named .json so that every
// server types and compresses it as JSON), the country shapes the map draws, picks from and
// geocodes against.
//
// Source: Natural Earth (public domain) through the `world-atlas` package, at 1:50m, where the
// previous file (Natural Earth 110m) had 177 shapes and no microstate. 1:50m adds the Vatican,
// Monaco, San Marino, Liechtenstein, Andorra, Malta, Singapore, the Maldives and the rest of the
// small states and territories. Two are still missing at that scale, so they are taken from the
// 1:10m file: Tuvalu and Gibraltar.
//
// Not a project dependency: install the three packages without saving them, then run
//   npm install --no-save world-atlas@2.0.2 topojson-client@3 i18n-iso-countries@7
//   node scripts/build-countries.mjs
//
// What the script decides, so that it is not decided twice:
// - every shape carries `iso_a2`, `name` and `admin`, the three properties the app reads;
// - a shape with no ISO 3166-1 number joins the country it belongs to by ISO (Somaliland to
//   Somalia, Northern Cyprus to Cyprus, the Indian Ocean Territories to Australia), so the map has
//   no hole there, and several shapes of one country become a single MultiPolygon, so that a
//   country has one shape and one anchor; Kosovo has no ISO code and takes the one the EU, the
//   IMF and CLDR use (XK); Siachen Glacier, disputed and uninhabited, is left out;
// - the Vatican is a 450 m circle round St Peter's: Natural Earth draws it about 1.4 km west of
//   where it is at 1:50m (St Peter's falls outside it, in Italy) and as a line at 1:10m, and a
//   shape in the wrong place would pull the Roman places beside it into the Vatican; every other
//   microstate was checked against the coordinates of its capital and kept as Natural Earth has
//   it: 50 of the 68 small countries hold their capital; 15 miss it by under 3 km (the
//   simplified coast of an island state: Bridgetown, Hong Kong, San Juan..., and Monaco, whose
//   outline Natural Earth enlarges); Palau, the Turks and Caicos and Pitcairn draw their capital's
//   island 7, 63 and 193 km away, or not at all;
// - coordinates are rounded to 3 decimals (about 110 m), finer than the 1:50m scale itself;
// - every polygon is wound the way RFC 7946 asks, and every shape has its `bbox`, which the
//   point-in-polygon lookup uses to skip most shapes;
// - the shapes are written largest first, so a small one (Gibraltar inside Spain's 1:50m outline)
//   is drawn on top of the one around it.

import { readFileSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const topo = require('topojson-client');
const iso = require('i18n-iso-countries');

const OUT = new URL('../src/assets/geo/countries.json', import.meta.url);
const PRECISION = 3;
const FROM_10M = ['TV', 'GI'];
// A shape with no ISO number: the code it takes, or null to leave it out.
const BY_NAME = {
  Somaliland: 'SO',
  'N. Cyprus': 'CY',
  'Indian Ocean Ter.': 'AU',
  Kosovo: 'XK',
  'Siachen Glacier': null,
};
const ENGLISH_NAME = { XK: 'Kosovo', VA: 'Vatican City' };
// A shape drawn here instead of taken from Natural Earth: [longitude, latitude, radius in metres].
const CIRCLES = { VA: [12.4531, 41.9028, 450] };

const atlas = (resolution) => {
  const topology = JSON.parse(readFileSync(require.resolve(`world-atlas/countries-${resolution}.json`), 'utf8'));
  return topo.feature(topology, topology.objects.countries).features;
};

const codeOf = (feature) => {
  if (feature.id) return iso.numericToAlpha2(feature.id) ?? null;
  const name = feature.properties.name;
  if (!(name in BY_NAME)) throw new Error(`No ISO code for "${name}": decide it in BY_NAME`);
  return BY_NAME[name];
};

const polygonsOf = (geometry) => (geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates);

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

const byCode = new Map();
const add = (feature, code) => {
  const entry = byCode.get(code) ?? { code, name: ENGLISH_NAME[code] ?? iso.getName(code, 'en') ?? feature.properties.name, polygons: [] };
  entry.polygons.push(...polygonsOf(feature.geometry));
  byCode.set(code, entry);
};

for (const feature of atlas('50m')) {
  const code = codeOf(feature);
  if (code && !(code in CIRCLES)) add(feature, code);
}
for (const [code, spec] of Object.entries(CIRCLES)) add({ geometry: { type: 'Polygon', coordinates: circle(spec) } }, code);
for (const feature of atlas('10m')) {
  const code = feature.id && iso.numericToAlpha2(feature.id);
  if (code && FROM_10M.includes(code)) add(feature, code);
}
for (const code of FROM_10M) if (!byCode.has(code)) throw new Error(`${code} is not in the 1:10m file`);

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
