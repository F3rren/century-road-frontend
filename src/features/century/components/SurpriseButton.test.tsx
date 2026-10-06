import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import i18n from '@/i18n';
import { api } from '@/services/api';
import { SurpriseButton } from './SurpriseButton';

vi.mock('@/services/api', () => ({ api: { get: vi.fn(), post: vi.fn() } }));

const attribution = { source: 'Wikipedia', license: 'CC BY-SA 4.0', licenseUrl: 'https://example.org', notice: 'n' };
const t = (key: string, options?: Record<string, unknown>) => i18n.t(key, options);

function Where() {
  const { pathname, search } = useLocation();
  return <p data-testid="where">{pathname + search}</p>;
}

function renderButton(params = { country: null, fromYear: 1901, toYear: 2000 } as Parameters<typeof SurpriseButton>[0]['params']) {
  return render(
    <MemoryRouter initialEntries={['/century']}>
      <SurpriseButton params={params} language="it" />
      <Where />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.mocked(api.get).mockReset();
});

describe('SurpriseButton', () => {
  it('opens the random event in the archive on its day and year', async () => {
    vi.mocked(api.get).mockResolvedValue({
      success: true,
      data: { language: 'it', event: { year: 1957, month: 10, day: 4, countryCode: 'KZ', text: 'Sputnik' }, attribution },
    });
    const user = userEvent.setup();
    renderButton();
    await user.click(screen.getByRole('button', { name: t('century.surprise.button') }));
    expect(await screen.findByText('/archive?month=10&day=4&from=1957&to=1957&types=events&lang=it')).toBeInTheDocument();
  });

  it('honours the country and years in force', async () => {
    vi.mocked(api.get).mockResolvedValue({ success: true, data: { language: 'it', attribution } });
    const user = userEvent.setup();
    renderButton({ country: 'IT', fromYear: 1901, toYear: null });
    await user.click(screen.getByRole('button', { name: t('century.surprise.button') }));
    await screen.findByText(t('century.surprise.none'));
    expect(api.get).toHaveBeenCalledWith('/history/random?lang=it&country=IT&fromYear=1901');
  });

  it('says so, and stays where it is, when nothing matches', async () => {
    vi.mocked(api.get).mockResolvedValue({ success: true, data: { language: 'it', attribution } });
    const user = userEvent.setup();
    renderButton();
    await user.click(screen.getByRole('button', { name: t('century.surprise.button') }));
    expect(await screen.findByText(t('century.surprise.none'))).toBeInTheDocument();
    expect(screen.getByTestId('where')).toHaveTextContent('/century');
  });

  it('explains a failure in plain words', async () => {
    vi.mocked(api.get).mockImplementation(() => Promise.reject(new TypeError('Failed to fetch')));
    const user = userEvent.setup();
    renderButton();
    await user.click(screen.getByRole('button', { name: t('century.surprise.button') }));
    expect(await screen.findByRole('alert')).toHaveTextContent(t('errors.network'));
  });
});
