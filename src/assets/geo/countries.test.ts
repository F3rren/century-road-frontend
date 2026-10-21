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

// The capital of 119 countries, the small and island ones among them, as [code, longitude, latitude].
const CAPITALS: [string, number, number][] = [
  ['VA', 12.4539, 41.9022],
  ['GI', -5.3536, 36.1408],
  ['MC', 7.4246, 43.7384],
  ['NR', 166.92, -0.547],
  ['MO', 113.54, 22.19],
  ['BL', -62.85, 17.896],
  ['MF', -63.08, 18.07],
  ['PN', -130.1, -25.066],
  ['SX', -63.05, 18.026],
  ['TV', 179.194, -8.521],
  ['CK', -159.775, -21.207],
  ['NF', 167.96, -29.056],
  ['MV', 73.51, 4.175],
  ['MS', -62.216, 16.79],
  ['GG', -2.536, 49.455],
  ['SM', 12.446, 43.936],
  ['AI', -63.058, 18.22],
  ['VG', -64.62, 18.43],
  ['WF', -176.18, -13.28],
  ['JE', -2.105, 49.186],
  ['SH', -5.717, -15.93],
  ['BM', -64.78, 32.295],
  ['AS', -170.7, -14.275],
  ['NU', -169.92, -19.055],
  ['LI', 9.521, 47.141],
  ['IO', 72.41, -7.31],
  ['AW', -70.027, 12.524],
  ['SC', 55.45, -4.62],
  ['GD', -61.75, 12.05],
  ['VC', -61.22, 13.157],
  ['MT', 14.51, 35.9],
  ['PM', -56.17, 46.78],
  ['KN', -62.72, 17.3],
  ['VI', -64.93, 18.34],
  ['KY', -81.38, 19.29],
  ['AG', -61.85, 17.12],
  ['BB', -59.62, 13.1],
  ['PW', 134.48, 7.34],
  ['TC', -71.14, 21.46],
  ['SG', 103.8198, 1.3521],
  ['MP', 145.75, 15.18],
  ['AD', 1.52, 42.51],
  ['LC', -60.99, 14.01],
  ['BH', 50.58, 26.23],
  ['FM', 158.16, 6.92],
  ['TO', -175.2, -21.14],
  ['MH', 171.38, 7.09],
  ['DM', -61.39, 15.3],
  ['GU', 144.75, 13.47],
  ['ST', 6.73, 0.34],
  ['CW', -68.93, 12.11],
  ['HK', 114.17, 22.32],
  ['IM', -4.48, 54.15],
  ['AX', 19.94, 60.1],
  ['MU', 57.5, -20.16],
  ['KM', 43.26, -11.7],
  ['KI', 173.0, 1.33],
  ['WS', -171.76, -13.83],
  ['FO', -6.77, 62.01],
  ['CV', -23.51, 14.93],
  ['PF', -149.57, -17.54],
  ['LU', 6.13, 49.61],
  ['TT', -61.51, 10.66],
  ['PS', 35.2, 31.9],
  ['PR', -66.1, 18.47],
  ['BN', 114.94, 4.89],
  ['QA', 51.53, 25.29],
  ['XK', 21.1655, 42.6629],
  ['IT', 12.4964, 41.9028],
  ['FR', 2.3522, 48.8566],
  ['DE', 13.405, 52.52],
  ['ES', -3.7038, 40.4168],
  ['GB', -0.1276, 51.5072],
  ['US', -77.0369, 38.9072],
  ['JP', 139.6917, 35.6895],
  ['CN', 116.4074, 39.9042],
  ['RU', 37.6173, 55.7558],
  ['BR', -47.8825, -15.7942],
  ['IN', 77.209, 28.6139],
  ['AU', 149.13, -35.2809],
  ['EG', 31.2357, 30.0444],
  ['ZA', 28.0473, -26.2041],
  ['MX', -99.1332, 19.4326],
  ['AR', -58.3816, -34.6037],
  ['TR', 32.8597, 39.9334],
  ['GR', 23.7275, 37.9838],
  ['NO', 10.7522, 59.9139],
  ['SE', 18.0686, 59.3293],
  ['NL', 4.9041, 52.3676],
  ['BE', 4.3517, 50.8503],
  ['CH', 7.4474, 46.948],
  ['AT', 16.3738, 48.2082],
  ['PL', 21.0122, 52.2297],
  ['PT', -9.1393, 38.7223],
  ['IE', -6.2603, 53.3498],
  ['DK', 12.5683, 55.6761],
  ['FI', 24.9384, 60.1699],
  ['IS', -21.8174, 64.1265],
  ['NZ', 174.7762, -41.2865],
  ['CY', 33.3823, 35.1856],
  ['IL', 35.2137, 31.7683],
  ['LB', 35.5018, 33.8938],
  ['SA', 46.6753, 24.7136],
  ['AE', 54.3773, 24.4539],
  ['TH', 100.5018, 13.7563],
  ['VN', 105.8342, 21.0278],
  ['ID', 106.8456, -6.2088],
  ['PH', 120.9842, 14.5995],
  ['KR', 126.978, 37.5665],
  ['KZ', 71.4304, 51.1694],
  ['NG', 3.3792, 6.5244],
  ['KE', 36.8219, -1.2921],
  ['ET', 38.7578, 9.0054],
  ['MA', -6.8498, 33.9716],
  ['CL', -70.6693, -33.4489],
  ['CO', -74.0721, 4.711],
  ['PE', -77.0428, -12.0464],
  ['CU', -82.3666, 23.1136],
  ['FJ', 178.0, -17.8],
];

// Capitals that 1:10m, simplified, still draws just outside their own country, all within 2 km: an
// island state's coast (Puerto Rico, Jersey, Montserrat, Palau, Dominica, Tuvalu, the Marshalls,
// Kiribati, Tonga) and Jerusalem, on the line the shapes draw as Israel and Palestine.
const OUTSIDE = new Set(['PR', 'JE', 'MS', 'IL', 'PW', 'DM', 'TV', 'MH', 'KI', 'TO']);

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

  it('holds the capital of every country it has, bar the few that are within 2 km of its edge', () => {
    for (const [code, lon, lat] of CAPITALS) {
      if (!OUTSIDE.has(code)) expect(lookup(lon, lat), `the capital of ${code}`).toBe(code);
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
    expect(lookup(-177.0, 67.0)).toBe('RU'); // Chukotka over the edge of the map
    expect(lookup(-171.02, 65.58)).toBe('RU'); // Lavrentiya
    expect(lookup(135.08, 48.48)).toBe('RU'); // Khabarovsk
    expect(lookup(178.44, -18.14)).toBe('FJ'); // Suva
    expect(lookup(179.34, -16.78)).toBe('FJ'); // Savusavu
    expect(lookup(-179.95, -16.85)).toBe('FJ'); // Taveuni, east of the antimeridian
  });

  it('finds a microstate for a point in it, not the country around it', () => {
    expect(lookup(12.4539, 41.9022)).toBe('VA'); // St Peter's, inside Rome
    expect(lookup(12.4663, 41.9031)).toBe('IT'); // Castel Sant'Angelo, 1 km on, is Rome
    expect(lookup(12.4964, 41.9028)).toBe('IT');
    expect(lookup(12.4578, 43.9424)).toBe('SM');
    expect(lookup(7.4246, 43.7384)).toBe('MC');
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
