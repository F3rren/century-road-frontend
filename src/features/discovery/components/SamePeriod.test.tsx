import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import i18n from '@/i18n';
import { api } from '@/services/api';
import type { SamePeriodData } from '@/features/history';
import { SamePeriod } from './SamePeriod';

vi.mock('@/services/api', () => ({ api: { get: vi.fn(), post: vi.fn() } }));

const attribution = { source: 'Wikipedia', license: 'CC BY-SA 4.0', licenseUrl: 'https://example.org', notice: 'n' };
const t = (key: string, options?: Record<string, unknown>) => i18n.t(key, options);

function answer(partial: Partial<SamePeriodData>): SamePeriodData {
  return {
    language: 'it', year: 1969, fromYear: 1964, toYear: 1974, comparison: 'TEMPORAL',
    notice: 'Un confronto nel tempo, non una catena di cause ed effetti.',
    coverage: { level: 'NONE', eventCount: 0, countryCount: 0, note: "Nell'indice non ci sono eventi per questo periodo." },
    countries: [], attribution, ...partial,
  };
}

function renderWith(data: SamePeriodData) {
  vi.mocked(api.get).mockResolvedValue({ success: true, data });
  return render(
    <MemoryRouter>
      <SamePeriod year={1969} excludeCountry="US" />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.mocked(api.get).mockReset();
});

describe('SamePeriod', () => {
  it('says a window with nothing in it is a gap in the index, and lists no country', async () => {
    renderWith(answer({}));
    expect(await screen.findByText(t('samePeriod.level.NONE'))).toBeInTheDocument();
    // The backend's own notice and note are shown, at every level.
    expect(screen.getByText(/non una catena di cause ed effetti/)).toBeInTheDocument();
    expect(screen.getByText(/Nell'indice non ci sono eventi/)).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('shows a sparse window as little material, not as nothing having happened', async () => {
    renderWith(
      answer({
        coverage: { level: 'SPARSE', eventCount: 2, countryCount: 1, note: 'Pochi eventi per questo periodo.' },
        countries: [{ countryCode: 'FR', eventCount: 2, events: [{ year: 1968, month: 5, day: 3, text: 'Maggio francese.' }] }],
      }),
    );
    expect(await screen.findByText(t('samePeriod.level.SPARSE'))).toBeInTheDocument();
    expect(screen.getByText('Pochi eventi per questo periodo.')).toBeInTheDocument();
  });

  it('lists each country with its events, each opening its day in the archive, and its years in the century view', async () => {
    renderWith(
      answer({
        coverage: { level: 'OK', eventCount: 6, countryCount: 3, note: 'È una selezione.' },
        countries: [
          { countryCode: 'FR', eventCount: 4, events: [{ year: 1968, month: 5, day: 3, text: 'Maggio francese.' }] },
          { countryCode: 'JP', eventCount: 2, events: [{ year: 1970, month: 3, day: 14, text: 'Expo di Osaka.' }] },
        ],
      }),
    );
    expect(await screen.findByText(t('samePeriod.level.OK', { events: 6, countries: 3 }))).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Maggio francese/ })).toHaveAttribute(
      'href',
      '/archive?month=5&day=3&from=1968&to=1968&types=events&lang=it',
    );
    const [firstYears] = screen.getAllByRole('link', { name: /tutti gli eventi dal 1964 al 1974/i });
    expect(firstYears).toHaveAttribute('href', '/century?country=FR&from=1964&to=1974');
  });

  it('asks nothing while there is no year, and still shows what the page put under the heading', () => {
    render(
      <MemoryRouter>
        <SamePeriod year={null} controls={<p>campo dell'anno</p>} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: t('samePeriod.title') })).toBeInTheDocument();
    expect(screen.getByText("campo dell'anno")).toBeInTheDocument();
    expect(api.get).not.toHaveBeenCalled();
  });

  it('asks without the excluded country when there is none', async () => {
    vi.mocked(api.get).mockResolvedValue({ success: true, data: answer({}) });
    render(
      <MemoryRouter>
        <SamePeriod year={-44} />
      </MemoryRouter>,
    );
    await screen.findByText(t('samePeriod.level.NONE'));
    expect(api.get).toHaveBeenCalledWith('/history/same-period?year=-44&lang=it');
  });

  it('explains a failure in plain words and offers to try again', async () => {
    vi.mocked(api.get).mockImplementation(() => Promise.reject(new Error('HTTP 503: Service Unavailable')));
    render(
      <MemoryRouter>
        <SamePeriod year={1969} />
      </MemoryRouter>,
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(t('errors.server'));
    expect(screen.getByRole('button', { name: t('common.retry') })).toBeInTheDocument();
  });
});
