import { describe, expect, it } from 'vitest';
import { paragraphs } from './paragraphs';

describe('paragraphs', () => {
  it('splits on blank lines and trims each part', () => {
    expect(paragraphs('Uno.\n\n  Due.  \n\n\nTre.')).toEqual(['Uno.', 'Due.', 'Tre.']);
  });

  it('keeps a single line break inside its paragraph', () => {
    expect(paragraphs('Uno\ncontinua.')).toEqual(['Uno\ncontinua.']);
  });

  it('returns nothing for an empty text', () => {
    expect(paragraphs('  \n\n ')).toEqual([]);
  });
});
