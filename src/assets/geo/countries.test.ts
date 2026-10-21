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
