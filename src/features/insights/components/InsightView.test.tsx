import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import i18n from '@/i18n';
import { api } from '@/services/api';
import type { InsightDetail } from '@/features/history';
import { InsightView } from './InsightView';

vi.mock('@/services/api', () => ({ api: { get: vi.fn(), post: vi.fn() } }));

const attribution = { source: 'Wikipedia', license: 'CC BY-SA 4.0', licenseUrl: 'https://example.org', notice: 'n' };
const t = (key: string, options?: Record<string, unknown>) => i18n.t(key, options);

const insight: InsightDetail = {
  slug: 'sputnik-1',
  language: 'it',
  title: 'Lo Sputnik 1 entra in orbita',
  summary: 'Il primo satellite artificiale.',
  date: { year: 1957, month: 10, day: 4 },
  place: { name: 'Cosmodromo di Baikonur, Kazakistan', lat: 45.92, lon: 63.34, countryCode: 'KZ', approximate: false },
  before: 'Prima uno.\n\nPrima due.',
  event: "L'evento.",
  after: 'Dopo.',
  related: [{ slug: 'apollo-11', title: 'Apollo 11', date: { year: 1969, month: 7, day: 20 }, reason: 'Lo sbarco sulla Luna.' }],
  inPaths: [{ path: 'conquista-dello-spazio', title: 'La conquista dello spazio', position: 1, stopCount: 9 }],
  sources: [
    { title: 'Sputnik 1 - Wikipedia', url: 'https://en.wikipedia.org/wiki/Sputnik_1', publisher: 'Wikipedia', license: 'CC BY-SA 4.0' },
    { title: 'NASA History', url: 'https://history.nasa.gov/sputnik/', publisher: 'NASA' },
  ],
  notes: [],
  provenance: { author: 'Century Road' },
};

function renderView(value: InsightDetail = insight) {
  return render(
    <MemoryRouter>
      <InsightView insight={value} />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.mocked(api.get).mockReset();
  // The "Nello stesso periodo" section asks for its own data: an empty window is enough here.
  vi.mocked(api.get).mockResolvedValue({
    success: true,
    data: {
      language: 'it', year: 1957, fromYear: 1952, toYear: 1962, comparison: 'TEMPORAL', notice: 'n',
      coverage: { level: 'NONE', eventCount: 0, countryCount: 0, note: 'n' }, countries: [], attribution,
    },
  });
});

describe('InsightView', () => {
  it('tells the event as before, the event, after, and splits paragraphs on blank lines', () => {
    renderView();
    expect(screen.getByRole('heading', { level: 1, name: insight.title })).toBeInTheDocument();
    for (const key of ['insights.before', 'insights.event', 'insights.after']) {
      expect(screen.getByRole('heading', { level: 2, name: t(key) })).toBeInTheDocument();
    }
    expect(screen.getByText('Prima uno.')).toBeInTheDocument();
    expect(screen.getByText('Prima due.')).toBeInTheDocument();
  });

  it('links to the place on the map, to the path it is a stop of, and to what to read next', () => {
    renderView();
    expect(screen.getByRole('link', { name: t('insights.showOnMap') })).toHaveAttribute('href', '/?insight=sputnik-1');
    expect(
      screen.getByRole('link', { name: t('insights.stopOf', { position: 1, count: 9, title: 'La conquista dello spazio' }) }),
    ).toHaveAttribute('href', '/paths/conquista-dello-spazio');
    expect(screen.getByRole('link', { name: /Apollo 11/ })).toHaveAttribute('href', '/insights/apollo-11');
  });

  it('says a text was never reviewed, with no review date and never the word "verified"', () => {
    renderView();
    expect(screen.getByText(new RegExp(t('insights.notReviewed')))).toBeInTheDocument();
    expect(screen.queryByText(/controllato da una persona/i)).not.toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/verificat/i);
  });

  it('shows the day somebody reviewed it, when somebody did', () => {
    renderView({ ...insight, provenance: { author: 'Century Road', reviewedAt: '2026-10-05' } });
    expect(screen.getByText(/Controllato da una persona sulle sue fonti il 5 ottobre 2026/)).toBeInTheDocument();
    expect(screen.queryByText(new RegExp(t('insights.notReviewed')))).not.toBeInTheDocument();
  });

  it('shows an approximate pin as one, with the backend note, and an exact one as it is', () => {
    const { unmount } = renderView({
      ...insight,
      place: { ...insight.place, approximate: true, note: 'Il sito di lancio, non la Luna.' },
    });
    expect(screen.getByText('Posizione indicativa: Il sito di lancio, non la Luna.')).toBeInTheDocument();
    unmount();

    renderView();
    expect(screen.queryByText(/Posizione indicativa/)).not.toBeInTheDocument();
  });

  it('lists the caveats on dates and places only when there are any', () => {
    const { unmount } = renderView();
    expect(screen.queryByRole('heading', { name: t('insights.notes') })).not.toBeInTheDocument();
    unmount();

    renderView({ ...insight, notes: ['A Baikonur era già il 5 ottobre.'] });
    expect(screen.getByRole('heading', { level: 2, name: t('insights.notes') })).toBeInTheDocument();
    expect(screen.getByText('A Baikonur era già il 5 ottobre.')).toBeInTheDocument();
  });

  it('asks for the same years in other countries, leaving out the event\'s own', () => {
    renderView();
    expect(api.get).toHaveBeenCalledWith(expect.stringMatching(/^\/history\/same-period\?year=1957&lang=it&excludeCountry=KZ/));
  });
});
