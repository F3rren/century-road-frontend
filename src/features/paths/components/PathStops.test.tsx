import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import i18n from '@/i18n';
import { api } from '@/services/api';
import type { InsightDetail, PathStop } from '@/features/history';
import { PathStops } from './PathStops';

vi.mock('@/services/api', () => ({ api: { get: vi.fn(), post: vi.fn() } }));

const t = (key: string, options?: Record<string, unknown>) => i18n.t(key, options);

const stop = (position: number, slug: string, title: string, year: number, extra: Partial<PathStop['place']> = {}): PathStop => ({
  position,
  slug,
  title,
  summary: `Riassunto di ${title}.`,
  date: { year, month: 10, day: 4 },
  place: { name: `Luogo di ${title}`, lat: 1, lon: 2, approximate: false, ...extra },
  narrative: `Racconto di ${title}.`,
});

const detail = (slug: string): InsightDetail => ({
  slug,
  language: 'it',
  title: slug,
  summary: 's',
  date: { year: 1957, month: 10, day: 4 },
  place: { name: 'Baikonur', lat: 1, lon: 2, approximate: false },
  before: `Prima di ${slug}.`,
  event: `L'evento ${slug}.`,
  after: `Dopo ${slug}.`,
  related: [{ slug: 'apollo-11', title: 'Apollo 11', date: { year: 1969, month: 7, day: 20 }, reason: 'Lo sbarco.' }],
  inPaths: [],
  sources: [],
  notes: [],
  provenance: { author: 'Century Road' },
});

const stops = [
  stop(1, 'sputnik-1', 'Sputnik 1', 1957),
  stop(2, 'apollo-11', 'Apollo 11', 1969, { approximate: true, note: 'Il sito di lancio, non la Luna.' }),
];

function renderStops() {
  return render(
    <MemoryRouter>
      <PathStops stops={stops} />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.mocked(api.get).mockReset();
  vi.mocked(api.get).mockImplementation(async (path: string) => ({
    success: true,
    data: detail(path.split('/').pop() ?? ''),
  }));
});

describe('PathStops', () => {
  it('lists the stops in order, each year leading', () => {
    renderStops();
    const items = screen.getAllByRole('listitem').filter((li) => li.matches('ol > li'));
    expect(items).toHaveLength(2);
    expect(within(items[0]).getByText('1957')).toBeInTheDocument();
    expect(within(items[1]).getByText('1969')).toBeInTheDocument();
    expect(within(items[0]).getByText('Racconto di Sputnik 1.')).toBeInTheDocument();
  });

  it("keeps the insight's own page and the map one link away from each stop", () => {
    renderStops();
    const first = screen.getAllByRole('listitem').filter((li) => li.matches('ol > li'))[0];
    const hrefs = within(first).getAllByRole('link').map((link) => link.getAttribute('href'));
    expect(hrefs).toContain('/insights/sputnik-1');
    expect(hrefs).toContain('/?insight=sputnik-1');
    expect(within(first).getByRole('link', { name: t('paths.fullInsight') })).toHaveAttribute('href', '/insights/sputnik-1');
  });

  it('says an approximate pin is one, and an exact one needs no note', () => {
    renderStops();
    expect(screen.getByText('Posizione indicativa: Il sito di lancio, non la Luna.')).toBeInTheDocument();
    expect(screen.getAllByText(/Posizione indicativa/)).toHaveLength(1);
  });
});

describe('a stop\'s "Perché conta"', () => {
  it('asks for nothing until a stop is opened', () => {
    renderStops();
    expect(api.get).not.toHaveBeenCalled();
  });

  it('opens before, the event, after and a connection, asking only for that stop', async () => {
    const user = userEvent.setup();
    renderStops();
    const [first, second] = screen.getAllByText(t('paths.readInsight'), { selector: 'summary span' });
    await user.click(first);

    expect(await screen.findByText('Prima di sputnik-1.')).toBeInTheDocument();
    expect(screen.getByText("L'evento sputnik-1.")).toBeInTheDocument();
    expect(screen.getByText('Dopo sputnik-1.')).toBeInTheDocument();
    // The connection is read under the stop that was opened (the other stop is itself Apollo 11).
    const firstStop = first.closest('ol > li') as HTMLElement;
    expect(within(firstStop).getByRole('link', { name: /Apollo 11/ })).toHaveAttribute('href', '/insights/apollo-11');
    expect(api.get).toHaveBeenCalledTimes(1);
    expect(api.get).toHaveBeenCalledWith('/history/insights/sputnik-1');
    // The other stop stays closed and has not been read.
    expect(second.closest('details')).not.toHaveAttribute('open');
    expect(screen.queryByText('Prima di apollo-11.')).not.toBeInTheDocument();
  });

  it('does not ask again when the same stop is closed and opened', async () => {
    const user = userEvent.setup();
    renderStops();
    const [summary] = screen.getAllByText(t('paths.readInsight'), { selector: 'summary span' });
    await user.click(summary);
    await screen.findByText('Prima di sputnik-1.');
    await user.click(summary);
    await user.click(summary);
    expect(api.get).toHaveBeenCalledTimes(1);
  });

  it('explains a failure in plain words and offers to try again', async () => {
    vi.mocked(api.get).mockImplementationOnce(() => Promise.reject(new Error('HTTP 503: Service Unavailable')));
    const user = userEvent.setup();
    renderStops();
    const [summary] = screen.getAllByText(t('paths.readInsight'), { selector: 'summary span' });
    await user.click(summary);

    expect(await screen.findByRole('alert')).toHaveTextContent(t('errors.server'));
    await user.click(screen.getByRole('button', { name: t('common.retry') }));
    await waitFor(() => expect(screen.getByText('Prima di sputnik-1.')).toBeInTheDocument());
  });
});
