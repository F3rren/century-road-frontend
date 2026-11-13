import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, Outlet, RouterProvider } from 'react-router-dom';
import i18n from '@/i18n';
import { RouteError } from './RouteError';

const t = (key: string) => i18n.t(key);

function Boom({ error }: { error: Error }): never {
  throw error;
}

// The router's own shape: a layout that stays, and a pathless route holding the boundary around the pages.
function renderApp(error: Error) {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: (
          <div>
            <nav>the sidebar</nav>
            <Outlet />
          </div>
        ),
        errorElement: <RouteError />,
        children: [{ errorElement: <RouteError />, children: [{ index: true, element: <Boom error={error} /> }] }],
      },
    ],
    { initialEntries: ['/'] },
  );
  return render(<RouterProvider router={router} />);
}

describe('RouteError', () => {
  beforeEach(() => {
    // React and the router both report the error they catch; this test throws on purpose.
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows a message instead of a blank page when a page throws, and leaves the layout around it', () => {
    renderApp(new Error('a bug in a page'));

    expect(screen.getByRole('heading', { name: t('errorPage.title') })).toBeInTheDocument();
    expect(screen.getByText(t('errorPage.message'))).toBeInTheDocument();
    expect(screen.getByText('the sidebar')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: t('errorPage.reload') })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: t('notFound.backToMap') })).toHaveAttribute('href', '/');
  });

  it('never shows the technical text of the error to the reader', () => {
    renderApp(new Error('Cannot read properties of undefined (reading "stops")'));

    expect(document.body.textContent).not.toContain('Cannot read properties');
  });

  it.each([
    'Failed to fetch dynamically imported module: https://example.org/assets/PathPage-abc123.js',
    'error loading dynamically imported module',
    'Importing a module script failed.',
  ])('says the site was updated when a page\'s code can no longer be fetched (%s)', (message) => {
    renderApp(new TypeError(message));

    expect(screen.getByText(t('errorPage.newVersion'))).toBeInTheDocument();
    expect(screen.queryByText(t('errorPage.message'))).not.toBeInTheDocument();
  });

  it('keeps the error somewhere a developer can find it', () => {
    const error = new Error('a bug in a page');
    renderApp(error);

    expect(console.error).toHaveBeenCalledWith(error);
  });
});
