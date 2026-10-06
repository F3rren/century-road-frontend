import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import i18n from '@/i18n';
import { api } from '@/services/api';
import { Surprise } from './Surprise';

vi.mock('@/services/api', () => ({ api: { get: vi.fn(), post: vi.fn() } }));

const attribution = { source: 'Wikipedia', license: 'CC BY-SA 4.0', licenseUrl: 'https://example.org', notice: 'Testi tratti da Wikipedia.' };
const t = (key: string, options?: Record<string, unknown>) => i18n.t(key, options);
const SPUTNIK = { language: 'it', event: { year: 1957, month: 10, day: 4, countryCode: 'KZ', text: 'Viene lanciato lo Sputnik 1.' }, attribution };

function renderSurprise(filters: Parameters<typeof Surprise>[0] = { lang: 'it' }) {
  return render(
    <MemoryRouter>
      <Surprise {...filters} />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.mocked(api.get).mockReset();
});

describe('Surprise', () => {
  it('shows the event with its date and country, and leads on from each of them', async () => {
    vi.mocked(api.get).mockResolvedValue({ success: true, data: SPUTNIK });
    const user = userEvent.setup();
    renderSurprise();
    await user.click(screen.getByRole('button', { name: t('discovery.surprise.button') }));

    expect(await screen.findByText('Viene lanciato lo Sputnik 1.')).toBeInTheDocument();
    expect(screen.getByText(/4 ottobre.*Kazakistan/)).toBeInTheDocument();
    // The country is not dropped: its year and the map both lead on from the answer.
    expect(screen.getByRole('link', { name: t('history.dialog.archiveDay') })).toHaveAttribute(
      'href',
      '/archive?month=10&day=4&from=1957&to=1957&types=events&lang=it',
    );
    expect(screen.getByRole('link', { name: /Kazakistan: tutto l/ })).toHaveAttribute('href', '/century?country=KZ&from=&to=');
    expect(screen.getByRole('link', { name: /Kazakistan sulla mappa/ })).toHaveAttribute('href', '/?country=KZ');
    // Wikipedia's text is shown, so its attribution is too.
    expect(screen.getByText('Testi tratti da Wikipedia.')).toBeInTheDocument();
  });

  it('offers another one once there is one on screen', async () => {
    vi.mocked(api.get).mockResolvedValue({ success: true, data: SPUTNIK });
    const user = userEvent.setup();
    renderSurprise();
    await user.click(screen.getByRole('button', { name: t('discovery.surprise.button') }));
    await screen.findByText('Viene lanciato lo Sputnik 1.');
    expect(screen.getByRole('button', { name: t('discovery.surprise.another') })).toBeEnabled();
    expect(screen.queryByRole('button', { name: t('discovery.surprise.button') })).not.toBeInTheDocument();
  });

  it('honours the country and years in force', async () => {
    vi.mocked(api.get).mockResolvedValue({ success: true, data: { language: 'it', attribution } });
    const user = userEvent.setup();
    renderSurprise({ lang: 'it', country: 'IT', fromYear: 1901, toYear: null });
    await user.click(screen.getByRole('button', { name: t('discovery.surprise.button') }));
    await screen.findByText(t('discovery.surprise.none'));
    expect(api.get).toHaveBeenCalledWith('/history/random?lang=it&country=IT&fromYear=1901');
  });

  it('says so when nothing matches, as an answer and not as a failure', async () => {
    vi.mocked(api.get).mockResolvedValue({ success: true, data: { language: 'it', attribution } });
    const user = userEvent.setup();
    renderSurprise();
    await user.click(screen.getByRole('button', { name: t('discovery.surprise.button') }));
    expect(await screen.findByText(t('discovery.surprise.none'))).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('explains a failure in plain words', async () => {
    vi.mocked(api.get).mockImplementation(() => Promise.reject(new TypeError('Failed to fetch')));
    const user = userEvent.setup();
    renderSurprise();
    await user.click(screen.getByRole('button', { name: t('discovery.surprise.button') }));
    expect(await screen.findByRole('alert')).toHaveTextContent(t('errors.network'));
  });

  it('forgets an answer when the filters it was drawn with change', async () => {
    vi.mocked(api.get).mockResolvedValue({ success: true, data: SPUTNIK });
    const user = userEvent.setup();
    const { rerender } = renderSurprise({ lang: 'it', country: 'KZ' });
    await user.click(screen.getByRole('button', { name: t('discovery.surprise.button') }));
    await screen.findByText('Viene lanciato lo Sputnik 1.');

    rerender(
      <MemoryRouter>
        <Surprise lang="it" country="IT" />
      </MemoryRouter>,
    );
    expect(screen.queryByText('Viene lanciato lo Sputnik 1.')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: t('discovery.surprise.button') })).toBeInTheDocument();
  });
});
