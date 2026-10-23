import { describe, expect, it } from 'vitest';
import { FIXER, SELECTED_GRAIN_OPACITY, SELECTED_OPACITY } from './selection';

describe('the selection colour', () => {
  it('is Fixer yellow, printed translucent so that the borders show through', () => {
    expect(FIXER).toBe('#E2B44A');
    expect(SELECTED_OPACITY).toBeGreaterThan(0);
    expect(SELECTED_OPACITY).toBeLessThan(0.75);
  });

  it('keeps the grain of a small country more opaque than the shape of a large one', () => {
    expect(SELECTED_GRAIN_OPACITY).toBeGreaterThan(SELECTED_OPACITY);
    expect(SELECTED_GRAIN_OPACITY).toBeLessThanOrEqual(1);
  });
});
