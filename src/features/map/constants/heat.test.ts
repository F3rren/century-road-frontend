import { describe, expect, it } from 'vitest';
import { blendHex, HEAT_LEVELS, heatColor, heatOpacity, PAPER } from './heat';

const channels = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const luminance = (hex: string) => {
  const [r, g, b] = channels(hex).map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string) => {
  const [hi, lo] = [Math.max(luminance(a), luminance(b)), Math.min(luminance(a), luminance(b))];
  return (hi + 0.05) / (lo + 0.05);
};

describe('blendHex', () => {
  it('is the ink at full opacity and the ground at none', () => {
    expect(blendHex('#0E2A47', 1, PAPER)).toBe('#0E2A47');
    expect(blendHex('#0E2A47', 0, PAPER)).toBe(PAPER);
  });

  it('mixes the two by the opacity', () => {
    expect(blendHex('#000000', 0.5, '#FFFFFF')).toBe('#808080');
  });
});

describe('the heat scale', () => {
  it('prints every step translucent, so the country line beneath it stays in sight', () => {
    for (const { opacity } of HEAT_LEVELS) {
      expect(opacity).toBeGreaterThan(0);
      expect(opacity).toBeLessThan(1);
    }
  });

  it('goes from the highest threshold to the lowest, the deeper step more opaque and darker', () => {
    const mins = HEAT_LEVELS.map((l) => l.min);
    expect(mins).toEqual([...mins].sort((a, b) => b - a));
    const opacities = HEAT_LEVELS.map((l) => l.opacity);
    expect(opacities).toEqual([...opacities].sort((a, b) => b - a));
    const swatches = HEAT_LEVELS.map((l) => luminance(l.swatch));
    expect(swatches).toEqual([...swatches].sort((a, b) => a - b));
  });

  it('keeps neighbouring steps at least 1.8:1 apart once printed on the paper', () => {
    for (let i = 0; i < HEAT_LEVELS.length - 1; i++) {
      expect(contrast(HEAT_LEVELS[i].swatch, HEAT_LEVELS[i + 1].swatch)).toBeGreaterThan(1.8);
    }
  });

  it('keeps the two deeper steps at 3:1 against the paper on their own', () => {
    for (const { swatch } of HEAT_LEVELS.slice(0, 2)) expect(contrast(swatch, PAPER)).toBeGreaterThanOrEqual(3);
  });

  it('gives the swatch the colour the ink really has on the paper', () => {
    for (const { color, opacity, swatch } of HEAT_LEVELS) expect(swatch).toBe(blendHex(color, opacity, PAPER));
  });

  it('picks the step by the count, and the lowest for a count under one', () => {
    expect(heatColor(1)).toBe('#5F8BB8');
    expect(heatColor(3)).toBe('#1F4E79');
    expect(heatColor(6)).toBe('#0E2A47');
    expect(heatColor(40)).toBe('#0E2A47');
    expect(heatColor(0)).toBe('#5F8BB8');
    expect(heatOpacity(2)).toBe(0.45);
    expect(heatOpacity(5)).toBe(0.6);
    expect(heatOpacity(9)).toBe(0.75);
  });
});
