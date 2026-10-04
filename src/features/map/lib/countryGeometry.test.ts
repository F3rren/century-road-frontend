import { describe, expect, it } from 'vitest';
import { countryAnchor, facingCenter, type CountryFeature } from './countryGeometry';

function feature(geometry: CountryFeature['geometry']): CountryFeature {
  return { type: 'Feature', properties: { iso_a2: 'XX', name: 'X', admin: 'X' }, geometry };
}

const square = (lng: number, lat: number, size: number) => [
  [[lng, lat], [lng + size, lat], [lng + size, lat + size], [lng, lat + size], [lng, lat]],
];

describe('countryAnchor', () => {
  it('centres a single shape on its bounding box', () => {
    expect(countryAnchor(feature({ type: 'Polygon', coordinates: square(10, 40, 4) }))).toEqual([12, 42]);
  });

  it('centres a country of several shapes on its largest one', () => {
    const mainland = square(-120, 30, 40);
    const island = square(-170, 55, 10);
    expect(countryAnchor(feature({ type: 'MultiPolygon', coordinates: [island, mainland] }))).toEqual([-100, 50]);
  });
});

describe('facingCenter', () => {
  it('returns the one place when there is only one', () => {
    const [lng, lat] = facingCenter([{ lng: 12.5, lat: 41.9, weight: 3 }])!;
    expect(lng).toBeCloseTo(12.5);
    expect(lat).toBeCloseTo(41.9);
  });

  it('faces across the antimeridian rather than averaging longitudes to zero', () => {
    const [lng] = facingCenter([
      { lng: 170, lat: 0, weight: 1 },
      { lng: -170, lat: 0, weight: 1 },
    ])!;
    expect(Math.abs(lng)).toBeCloseTo(180);
  });

  it('leans toward the place with more events', () => {
    const [lng] = facingCenter([
      { lng: 0, lat: 0, weight: 3 },
      { lng: 90, lat: 0, weight: 1 },
    ])!;
    expect(lng).toBeGreaterThan(0);
    expect(lng).toBeLessThan(45);
  });

  it('has no answer for no places, or places that cancel out', () => {
    expect(facingCenter([])).toBeNull();
    expect(facingCenter([
      { lng: 0, lat: 0, weight: 1 },
      { lng: 180, lat: 0, weight: 1 },
    ])).toBeNull();
  });
});
