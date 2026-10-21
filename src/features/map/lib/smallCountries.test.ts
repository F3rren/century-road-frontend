import { describe, expect, it } from 'vitest';
import { smallCountryPoints, type SmallCountry } from './smallCountries';

const small: SmallCountry[] = [
  { code: 'VA', name: 'Vatican City', anchor: [12.43, 41.9] },
  { code: 'MC', name: 'Monaco', anchor: [7.41, 43.74] },
  { code: 'SG', name: 'Singapore', anchor: [103.82, 1.35] },
];

describe('smallCountryPoints', () => {
  it('marks only the small countries that have an event today', () => {
    const { features } = smallCountryPoints(small, { VA: 2, IT: 9 }, null, '#E2B44A');
    expect(features.map((f) => f.properties.iso_a2)).toEqual(['VA']);
    expect(features[0].geometry.coordinates).toEqual([12.43, 41.9]);
  });

  it('prints each in the ink and the opacity its polygon would have had', () => {
    const { features } = smallCountryPoints(small, { VA: 1, MC: 4, SG: 12 }, null, '#E2B44A');
    expect(features.map((f) => [f.properties.color, f.properties.opacity])).toEqual([
      ['#5F8BB8', 0.45],
      ['#1F4E79', 0.6],
      ['#0E2A47', 0.75],
    ]);
  });

  it('marks the selected one in the selection colour, opaque, even with no event today', () => {
    const { features } = smallCountryPoints(small, {}, 'MC', '#E2B44A');
    expect(features).toHaveLength(1);
    expect(features[0].properties).toMatchObject({ iso_a2: 'MC', color: '#E2B44A', opacity: 1 });
  });

  it('marks a selected small country once, over its heat', () => {
    const { features } = smallCountryPoints(small, { MC: 5 }, 'MC', '#E2B44A');
    expect(features).toHaveLength(1);
    expect(features[0].properties.color).toBe('#E2B44A');
  });

  it('has nothing to mark when there is nothing', () => {
    expect(smallCountryPoints(small, {}, null, '#E2B44A').features).toEqual([]);
    expect(smallCountryPoints([], { VA: 3 }, 'VA', '#E2B44A').features).toEqual([]);
  });

  it('does not mark a selected code that is not a small country', () => {
    expect(smallCountryPoints(small, {}, 'IT', '#E2B44A').features).toEqual([]);
  });
});
