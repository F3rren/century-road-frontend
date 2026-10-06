import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { PathStop } from '@/features/history';
import { PathStops } from './PathStops';

const stop = (position: number, slug: string, title: string, year: number, extra: Partial<PathStop['place']> = {}): PathStop => ({
  position,
  slug,
  title,
  summary: `Riassunto di ${title}.`,
  date: { year, month: 10, day: 4 },
  place: { name: `Luogo di ${title}`, lat: 1, lon: 2, approximate: false, ...extra },
  narrative: `Racconto di ${title}.`,
});

describe('PathStops', () => {
  const stops = [
    stop(1, 'sputnik-1', 'Sputnik 1', 1957),
    stop(2, 'apollo-11', 'Apollo 11', 1969, { approximate: true, note: 'Il sito di lancio, non la Luna.' }),
  ];

  it('lists the stops in order, each year leading', () => {
    render(<MemoryRouter><PathStops stops={stops} /></MemoryRouter>);
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(within(items[0]).getByText('1957')).toBeInTheDocument();
    expect(within(items[1]).getByText('1969')).toBeInTheDocument();
    expect(within(items[0]).getByText('Racconto di Sputnik 1.')).toBeInTheDocument();
  });

  it("opens a stop's insight and its place on the map", () => {
    render(<MemoryRouter><PathStops stops={stops} /></MemoryRouter>);
    const first = screen.getAllByRole('listitem')[0];
    const hrefs = within(first).getAllByRole('link').map((link) => link.getAttribute('href'));
    expect(hrefs).toContain('/insights/sputnik-1');
    expect(hrefs).toContain('/?insight=sputnik-1');
  });

  it('says an approximate pin is one, and an exact one needs no note', () => {
    render(<MemoryRouter><PathStops stops={stops} /></MemoryRouter>);
    expect(screen.getByText('Posizione indicativa: Il sito di lancio, non la Luna.')).toBeInTheDocument();
    expect(screen.getAllByText(/Posizione indicativa/)).toHaveLength(1);
  });
});
