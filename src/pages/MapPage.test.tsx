import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import '@/i18n';
import type { Country } from '@/features/map';
import { MapPage } from './MapPage';

// The map itself needs WebGL: stand-ins that click as the real one does, so that what is tested
// is what MapPage does with the clicks.
vi.mock('@/features/map', () => ({
  MapView: ({
    onCountryClick,
    onBackgroundClick,
    selectedCountryCode,
  }: {
    onCountryClick?: (country: Country) => void;
    onBackgroundClick?: () => void;
    selectedCountryCode?: string | null;
  }) => (
    <div>
      <p data-testid="selected">{selectedCountryCode ?? 'none'}</p>
      <button onClick={() => onCountryClick?.({ code: 'IT', name: 'Italia' })}>on Italy</button>
      <button onClick={() => onCountryClick?.({ code: 'FR', name: 'Francia' })}>on France</button>
      <button onClick={() => onBackgroundClick?.()}>on the sea</button>
    </div>
  ),
  PlacePlaque: () => null,
  ProjectionToggle: () => null,
  EventsPanel: ({ onClearCountry }: { onClearCountry: () => void }) => <button onClick={onClearCountry}>all countries</button>,
  localizedCountryName: (code: string) => code,
}));
vi.mock('@/features/map/components/HeatLegend', () => ({ HeatLegend: () => null }));
vi.mock('@/features/map/hooks/useTodayHistory', () => ({
  useTodayHistory: () => ({ availableCountries: [], countryHeatmap: {}, error: null, retry: () => {} }),
}));
vi.mock('@/features/history', () => ({
  trackCountryView: vi.fn(),
  useOptionalInsight: () => ({ data: null }),
}));

function Location() {
  const { search } = useLocation();
  return <p data-testid="search">{search || '(none)'}</p>;
}

function renderPage(initial = '/') {
  return render(
    <MemoryRouter initialEntries={[initial]}>
      <MapPage />
      <Location />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('MapPage', () => {
  it('selects the country the map is clicked on', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: 'on Italy' }));
    expect(screen.getByTestId('search')).toHaveTextContent('?country=IT');
    expect(screen.getByTestId('selected')).toHaveTextContent('IT');
  });

  it('deselects the country when the map is clicked where there is none, with no button needed', async () => {
    const user = userEvent.setup();
    renderPage('/?country=IT');
    expect(screen.getByTestId('selected')).toHaveTextContent('IT');
    await user.click(screen.getByRole('button', { name: 'on the sea' }));
    expect(screen.getByTestId('search')).toHaveTextContent('(none)');
    expect(screen.getByTestId('selected')).toHaveTextContent('none');
  });

  it('moves to another country when the click lands on one, rather than deselecting', async () => {
    const user = userEvent.setup();
    renderPage('/?country=IT');
    await user.click(screen.getByRole('button', { name: 'on France' }));
    expect(screen.getByTestId('search')).toHaveTextContent('?country=FR');
  });

  it('adds no step to the history for a click on the sea when nothing is selected', async () => {
    const user = userEvent.setup();
    renderPage('/?insight=sputnik-1');
    await user.click(screen.getByRole('button', { name: 'on the sea' }));
    // The insight a link named is still named: there was nothing to deselect.
    expect(screen.getByTestId('search')).toHaveTextContent('?insight=sputnik-1');
  });

  it('keeps the button that does the same', async () => {
    const user = userEvent.setup();
    renderPage('/?country=IT');
    await user.click(screen.getByRole('button', { name: 'all countries' }));
    expect(screen.getByTestId('search')).toHaveTextContent('(none)');
  });
});
