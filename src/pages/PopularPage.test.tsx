import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import i18n from '@/i18n';
import { api } from '@/services/api';
import { PopularPage } from './PopularPage';

vi.mock('@/services/api', () => ({ api: { get: vi.fn(), post: vi.fn() } }));

const t = (key: string, options?: Record<string, unknown>) => i18n.t(key, options);

const days = [
  { month: 10, day: 4, viewCount: 120 },
  { month: 7, day: 20, viewCount: 33 },
];
const countries = [
  { countryCode: 'IT', viewCount: 50 },
  { countryCode: 'US', viewCount: 9 },
];

function answer(path: string) {
  if (path.startsWith('/history/stats/days')) return { success: true, data: days };
  if (path.startsWith('/history/stats/countries')) return { success: true, data: countries };
  throw new Error(`unexpected ${path}`);
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/popular']}>
      <PopularPage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.mocked(api.get).mockReset();
  vi.mocked(api.get).mockImplementation(async (path: string) => answer(path));
});

describe('PopularPage', () => {
  it('asks for as many of each as the backend allows', async () => {
    renderPage();
    await screen.findByText('4 ottobre');
    expect(api.get).toHaveBeenCalledWith('/history/stats/days?limit=50', expect.any(AbortSignal));
    expect(api.get).toHaveBeenCalledWith('/history/stats/countries?limit=50', expect.any(AbortSignal));
  });

  it('lists the days and the countries, each row leading to that day or that country', async () => {
    renderPage();
    expect(await screen.findByRole('link', { name: '4 ottobre' })).toHaveAttribute('href', '/archive?month=10&day=4');
    expect(screen.getByRole('link', { name: '20 luglio' })).toHaveAttribute('href', '/archive?month=7&day=20');
    expect(screen.getByRole('link', { name: 'Italia' })).toHaveAttribute('href', '/century?country=IT');
    expect(screen.getByRole('link', { name: 'Stati Uniti' })).toHaveAttribute('href', '/century?country=US');

    const daysList = screen.getByRole('heading', { level: 2, name: t('dashboard.popularity.days.label') }).parentElement as HTMLElement;
    expect(within(daysList).getByText('120 visite')).toBeInTheDocument();
  });

  it('says what the counts are, and are not, and leads back to the Dashboard', async () => {
    renderPage();
    await screen.findByText('4 ottobre');
    expect(screen.getByRole('heading', { level: 1, name: t('popular.title') })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: t('popular.method.title') })).toBeInTheDocument();
    expect(screen.getByText(t('popular.method.days'))).toBeInTheDocument();
    expect(screen.getByText(t('popular.method.countries'))).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/privacy');
    expect(screen.getByRole('link', { name: t('popular.back') })).toHaveAttribute('href', '/dashboard');
  });

  it('says there is nothing to rank yet, for each list', async () => {
    vi.mocked(api.get).mockImplementation(async () => ({ success: true, data: [] }));
    renderPage();
    expect(await screen.findAllByText(t('dashboard.popularity.noData'))).toHaveLength(2);
  });

  it('explains a failure in plain words and asks again on retry', async () => {
    vi.mocked(api.get).mockImplementationOnce(() => Promise.reject(new Error('HTTP 503: Service Unavailable')));
    const user = userEvent.setup();
    renderPage();

    expect(await screen.findByRole('alert')).toHaveTextContent(t('errors.server'));
    await user.click(screen.getByRole('button', { name: t('common.retry') }));
    expect(await screen.findByRole('link', { name: '4 ottobre' })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
