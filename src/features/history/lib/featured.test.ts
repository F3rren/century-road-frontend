import { describe, expect, it } from 'vitest';
import type { HistoryEntry } from '../types';
import { splitFeatured } from './featured';

const page = (slug: string) => ({ title: slug, url: `https://it.wikipedia.org/wiki/${slug}` });
const entry = (year: number | undefined, text: string, ...slugs: string[]): HistoryEntry => ({ text, year, pages: slugs.map(page) });

describe('splitFeatured', () => {
  const sputnik = entry(1957, "Viene lanciato lo Sputnik 1", 'Sputnik_1', 'Unione_Sovietica');
  const morse = entry(1837, 'Samuel Morse brevetta il suo codice', 'Samuel_Morse', 'Codice_Morse');
  const events = [morse, sputnik];

  it('marks the event a pick repeats, matched on year and a shared article', () => {
    const pick = entry(1957, "L'URSS lancia lo Sputnik 1, il primo satellite artificiale", 'Sputnik_1');
    const { featured, onlySelected } = splitFeatured([pick], events);
    expect([...featured]).toEqual([sputnik]);
    expect(onlySelected).toEqual([]);
  });

  it('keeps a pick that has no event behind it', () => {
    const pick = entry(1965, 'Papa Paolo VI visita gli Stati Uniti', 'Papa_Paolo_VI');
    const { featured, onlySelected } = splitFeatured([pick], events);
    expect(featured.size).toBe(0);
    expect(onlySelected).toEqual([pick]);
  });

  it('does not match a shared article in a different year, or a pick without a year', () => {
    const otherYear = entry(1958, 'Lo Sputnik 1 rientra in atmosfera', 'Sputnik_1');
    const noYear = entry(undefined, 'Festa', 'Sputnik_1');
    const { featured, onlySelected } = splitFeatured([otherYear, noYear], events);
    expect(featured.size).toBe(0);
    expect(onlySelected).toEqual([otherYear, noYear]);
  });
});
