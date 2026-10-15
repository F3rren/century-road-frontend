import { describe, expect, it } from 'vitest';
import de from './locales/de.json';
import en from './locales/en.json';
import fr from './locales/fr.json';
import itLocale from './locales/it.json';

function keysOf(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null) return [prefix];
  return Object.entries(value).flatMap(([key, child]) => keysOf(child, prefix ? `${prefix}.${key}` : key));
}

// Italian is the source language: every other locale must carry exactly its keys, or a screen
// shows a raw key (or, through the English fallback, the wrong language) for the missing one.
describe('locales', () => {
  const reference = keysOf(itLocale).sort();

  it.each([
    ['en', en],
    ['de', de],
    ['fr', fr],
  ])('%s has exactly the keys Italian has', (_name, locale) => {
    expect(keysOf(locale).sort()).toEqual(reference);
  });

  it('has no empty string anywhere', () => {
    for (const locale of [itLocale, en, de, fr]) {
      const empty = keysOf(locale).filter((key) => {
        const value = key.split('.').reduce<unknown>((node, part) => (node as Record<string, unknown>)[part], locale);
        return value === '';
      });
      expect(empty).toEqual([]);
    }
  });
});
