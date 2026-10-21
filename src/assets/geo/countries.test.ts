import { describe, expect, it } from 'vitest';
import raw from './countries.json?raw';
import { findCountryAt, isSmallCountry, listCountries, type CountryFeature } from '@/features/map/lib/countryGeometry';

// The country shapes the map draws and the geocoding looks points up in, as shipped. The lookups
// are the reason for the file: a point in a microstate has to find the microstate.
const collection = JSON.parse(raw) as { features: CountryFeature[] };

// The file is written largest first (so that a small shape is drawn over the one around it) and
// fetchCountryFeatures reverses it for the lookups, as this does.
const features = [...collection.features].reverse();
const lookup = (lon: number, lat: number) => findCountryAt(lon, lat, features, 'it')?.code ?? null;

describe('countries.json', () => {
  it('has a shape for every country once, each with its ISO code, name and bounding box', () => {
    const codes = collection.features.map((f) => f.properties.iso_a2);
    expect(new Set(codes).size).toBe(codes.length);
    expect(codes.length).toBeGreaterThanOrEqual(235);
    for (const f of collection.features) {
      expect(f.properties.iso_a2).toMatch(/^[A-Z]{2}$/);
      expect(f.properties.name).toBeTruthy();
      expect(f.bbox).toHaveLength(4);
    }
  });

  it('has the microstates and the states the 1:110m file left out', () => {
    const codes = new Set(collection.features.map((f) => f.properties.iso_a2));
    for (const code of ['VA', 'MC', 'SM', 'LI', 'AD', 'MT', 'SG', 'MV', 'BH', 'TV', 'GI', 'XK', 'HK', 'MO', 'SC', 'MU']) {
      expect(codes.has(code), code).toBe(true);
    }
  });

  it('keeps every country the 1:110m file had', () => {
    const codes = new Set(collection.features.map((f) => f.properties.iso_a2));
    for (const code of ['IT', 'FR', 'US', 'RU', 'CN', 'BR', 'AU', 'ZA', 'EG', 'JP', 'GL', 'AQ', 'TW', 'PS', 'EH', 'FK', 'NC', 'PR']) {
      expect(codes.has(code), code).toBe(true);
    }
  });

  it('has closed rings, wound as RFC 7946 asks: counter-clockwise outside, clockwise for holes', () => {
    const area = (ring: number[][]) =>
      ring.slice(0, -1).reduce((sum, [x, y], i) => sum + (x * ring[i + 1][1] - ring[i + 1][0] * y), 0) / 2;
    for (const f of collection.features) {
      const polygons = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
      for (const polygon of polygons) {
        polygon.forEach((ring, index) => {
          expect(ring[0], f.properties.iso_a2).toEqual(ring[ring.length - 1]);
          expect(ring.length).toBeGreaterThanOrEqual(4);
          expect(index === 0 ? area(ring) > 0 : area(ring) < 0, `${f.properties.iso_a2} ring ${index}`).toBe(true);
        });
      }
    }
  });

  it('has no ring that steps across the antimeridian, which a flat map draws as a line across the world', () => {
    const jumping: string[] = [];
    for (const f of collection.features) {
      const polygons = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
      for (const ring of polygons.flat()) {
        if (ring.some((point, i) => i > 0 && Math.abs(point[0] - ring[i - 1][0]) > 180)) jumping.push(f.properties.iso_a2);
      }
    }
    // Antarctica's ring runs along the south pole's edge on purpose: it closes round the pole.
    expect([...new Set(jumping)]).toEqual(['AQ']);
  });

  it('keeps every polygon within 180 degrees of longitude, and Russia in several, cut along the antimeridian', () => {
    for (const f of collection.features) {
      const polygons = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
      for (const polygon of polygons) {
        for (const [lon] of polygon[0]) expect(Math.abs(lon), f.properties.iso_a2).toBeLessThanOrEqual(180);
      }
    }
    const russia = collection.features.find((f) => f.properties.iso_a2 === 'RU')!;
    const widest = Math.max(
      ...(russia.geometry.type === 'MultiPolygon' ? russia.geometry.coordinates : [russia.geometry.coordinates]).map((polygon) => {
        const lons = polygon[0].map(([lon]) => lon);
        return Math.max(...lons) - Math.min(...lons);
      }),
    );
    // The mainland, from the Baltic to the edge of the map, and not the world.
    expect(widest).toBeLessThan(160);
  });

  it('finds both sides of the antimeridian: eastern Russia and Fiji', () => {
    expect(lookup(177.0, 65.2)).toBe('RU'); // inland from Anadyr, west of the antimeridian
    expect(lookup(-179.1, 66.3)).toBe('RU'); // Chukotka over the edge of the map
    expect(lookup(-172.0, 66.5)).toBe('RU');
    expect(lookup(131.9, 43.1)).toBe('RU'); // Vladivostok
    expect(lookup(177.97, -17.8)).toBe('FJ'); // Viti Levu
    expect(lookup(179.2, -16.6)).toBe('FJ'); // Vanua Levu
    expect(lookup(-179.95, -16.85)).toBe('FJ'); // Taveuni, east of the antimeridian
  });

  it('finds a microstate for a point in it, not the country around it', () => {
    expect(lookup(12.4539, 41.9022)).toBe('VA'); // St Peter's, inside Rome
    expect(lookup(12.4663, 41.9031)).toBe('IT'); // Castel Sant'Angelo, 1 km on, is Rome
    expect(lookup(12.4964, 41.9028)).toBe('IT');
    expect(lookup(12.4578, 43.9424)).toBe('SM');
    expect(lookup(9.5209, 47.141)).toBe('LI'); // Vaduz
    expect(lookup(1.5218, 42.5063)).toBe('AD');
    expect(lookup(103.8198, 1.3521)).toBe('SG');
    expect(lookup(14.5146, 35.8997)).toBe('MT'); // Valletta
    expect(lookup(73.5093, 4.1755)).toBe('MV'); // Malé
  });

  it('answers Gibraltar before the Spain whose outline it overlaps', () => {
    expect(lookup(-5.3536, 36.1408)).toBe('GI');
    expect(lookup(-5.6, 36.2)).toBe('ES'); // Algeciras, across the bay
  });

  it('finds Kosovo, and the parts of a country that have no ISO number of their own', () => {
    expect(lookup(21.1655, 42.6629)).toBe('XK'); // Pristina
    expect(lookup(33.3823, 35.1856)).toBe('CY'); // Nicosia, on either side of the line
    expect(lookup(33.0, 35.35)).toBe('CY'); // north Cyprus
    expect(lookup(44.065, 9.56)).toBe('SO'); // Hargeisa, "Somaliland"
  });

  it('still finds the big countries', () => {
    expect(lookup(12.4964, 41.9028)).toBe('IT'); // Rome
    expect(lookup(2.3522, 48.8566)).toBe('FR');
    expect(lookup(-77.0369, 38.9072)).toBe('US');
    expect(lookup(-70.027, 12.524)).toBe('AW'); // Oranjestad
    expect(lookup(0, 0)).toBeNull(); // the Gulf of Guinea
  });

  it('lists every country for the picker, once, by name', () => {
    const list = listCountries(features, 'it');
    expect(list.length).toBe(collection.features.length);
    expect(list.map((c) => c.name)).toEqual([...list.map((c) => c.name)].sort((a, b) => a.localeCompare(b, 'it')));
    expect(list.find((c) => c.code === 'VA')?.name).toBe('Città del Vaticano');
    expect(list.find((c) => c.code === 'XK')?.name).toBe('Kosovo');
  });

  it('counts the microstates among the small countries, and the big ones not', () => {
    const small = new Set(collection.features.filter(isSmallCountry).map((f) => f.properties.iso_a2));
    for (const code of ['VA', 'MC', 'SM', 'SG', 'MT', 'MV', 'LU', 'TV']) expect(small.has(code), code).toBe(true);
    for (const code of ['IT', 'FR', 'US', 'RU', 'CY', 'IL', 'BE']) expect(small.has(code), code).toBe(false);
  });
});
