import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import i18n from '@/i18n';
import { MostViewedStats } from './MostViewedStats';

const t = (key: string, options?: Record<string, unknown>) => i18n.t(key, options);

const days = [{ month: 10, day: 4, viewCount: 120 }];
const countries = [{ countryCode: 'IT', viewCount: 50 }];

function renderStats(props: Partial<React.ComponentProps<typeof MostViewedStats>> = {}) {
  return render(
    <MemoryRouter>
      <MostViewedStats topDays={days} topCountries={countries} isLoading={false} error={null} {...props} />
    </MemoryRouter>,
  );
}

describe('MostViewedStats', () => {
  it('shows the top of each ranking, and leads to the full rankings', () => {
    renderStats();
    expect(screen.getByText('4 ottobre')).toBeInTheDocument();
    expect(screen.getByText('Italia')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: t('popular.seeAll') })).toHaveAttribute('href', '/popular');
  });

  it('keeps its rows as plain text: the page of the full rankings is where they lead somewhere', () => {
    renderStats();
    expect(screen.queryByRole('link', { name: '4 ottobre' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Italia' })).not.toBeInTheDocument();
  });

  it('shows nothing while loading or when there is nothing to rank, and says when it failed', () => {
    const loading = renderStats({ isLoading: true });
    expect(loading.container).toBeEmptyDOMElement();
    loading.unmount();

    const empty = renderStats({ topDays: [], topCountries: [] });
    expect(empty.container).toBeEmptyDOMElement();
    empty.unmount();

    renderStats({ error: 'boom' });
    expect(screen.getByRole('alert')).toHaveTextContent(t('dashboard.popularity.loadError', { error: 'boom' }));
  });
});
