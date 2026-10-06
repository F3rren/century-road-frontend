import { describe, expect, it } from 'vitest';
import { parseAroundYear } from './aroundYear';

describe('parseAroundYear', () => {
  it('reads a year of the common era and one before it', () => {
    expect(parseAroundYear('1969')).toBe(1969);
    expect(parseAroundYear('-44')).toBe(-44);
    expect(parseAroundYear(' 1957 ')).toBe(1957);
  });

  it('is null while the field is empty or only partly a number', () => {
    expect(parseAroundYear('')).toBeNull();
    expect(parseAroundYear('-')).toBeNull();
    expect(parseAroundYear('19 69')).toBeNull();
  });

  it('is null for what is not a whole year', () => {
    expect(parseAroundYear('1969.5')).toBeNull();
    expect(parseAroundYear('anno')).toBeNull();
    expect(parseAroundYear('1e3')).toBeNull();
  });

  it('is null outside the years the backend accepts', () => {
    expect(parseAroundYear('10000')).toBeNull();
    expect(parseAroundYear('-10000')).toBeNull();
    expect(parseAroundYear('9999')).toBe(9999);
    expect(parseAroundYear('-9999')).toBe(-9999);
  });
});
