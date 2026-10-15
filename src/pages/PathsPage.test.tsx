import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import i18n from '@/i18n';
import { api } from '@/services/api';
import type { PathSummary, StartHereItem } from '@/features/history';
import { PathsPage } from './PathsPage';

vi.mock('@/services/api', () => ({ api: { get: vi.fn(), post: vi.fn() } }));

const t = (key: string, options?: Record<string, unknown>) => i18n.t(key, options);

const TOPICS: readonly [string, string][] = [
  ['ROMA_REPUBBLICANA', 'Roma repubblicana'],
  ['MEDIOEVO', 'Medioevo'],
  ['SCIENZA', 'Scienza'],
];

// 120 paths, 40 in each of three topics, in the order the backend would send them.
function manyPaths(withTopics = true): PathSummary[] {
  return TOPICS.flatMap(([code, label], topicIndex) =>
    Array.from({ length: 40 }, (_, i) => ({
      slug: `${code.toLowerCase()}-${i}`,
      title: `${label}, percorso ${i + 1}`,
      tagline: 'Una frase.',
      ...(withTopics ? { topic: code, topicLabel: label, startYear: -500 + topicIndex * 1000 + i, endYear: -400 + topicIndex * 1000 + i } : {}),
      readingMinutes: 8,
      stopCount: 8,
    })),
  );
}

function answer(paths: PathSummary[], startHere: StartHereItem[] = []) {
  vi.mocked(api.get).mockImplementation(async (endpoint: string) => ({
    success: true,
    data: endpoint === '/history/start-here' ? startHere : paths,
  }));
}

function Where() {
  const { pathname, search } = useLocation();
  return <p data-testid="where">{pathname + search}</p>;
}

function renderPage(initial = '/paths') {
  return render(
    <MemoryRouter initialEntries={[initial]}>
      <PathsPage />
      <Where />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.mocked(api.get).mockReset();
});

describe('PathsPage with many paths', () => {
  it('gathers the topics under a heading each, in the order the backend sent them, closed and counted', async () => {
    answer(manyPaths());
    renderPage();

    expect(await screen.findByText(t('paths.filters.count', { count: 120 }))).toBeInTheDocument();
    const headings = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(headings).toEqual(['Antichità', 'Medioevo e Rinascimento', 'Scienza e tecnica']);
    const rows = screen.getAllByText(/^(Roma repubblicana|Medioevo|Scienza)$/).map((name) => name.closest('details'));
    expect(rows).toHaveLength(3);
    for (const row of rows) {
      expect(row).not.toHaveAttribute('open');
      expect(within(row as HTMLElement).getByText(t('paths.filters.count', { count: 40 }))).toBeInTheDocument();
    }
    expect(screen.getAllByRole('link', { name: /percorso/ })).toHaveLength(120);
  });

  it('opens a topic when its row is clicked', async () => {
    answer(manyPaths());
    const user = userEvent.setup();
    renderPage();
    const row = (await screen.findByText('Medioevo')).closest('details') as HTMLDetailsElement;

    await user.click(screen.getByText('Medioevo'));

    expect(row.open).toBe(true);
  });

  it('puts the search first, above the proposals, which step aside while looking for something', async () => {
    const proposal = manyPaths()[0];
    const startHere: StartHereItem[] = [{ type: 'PATH', slug: proposal.slug, title: proposal.title, teaser: 'Un consiglio.', path: proposal }];
    answer(manyPaths(), startHere);
    const user = userEvent.setup();
    renderPage();
    const search = await screen.findByLabelText(t('paths.filters.searchLabel'));
    const proposals = await screen.findByRole('heading', { name: t('paths.startHere') });
    expect(search.compareDocumentPosition(proposals) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    await user.type(search, 'medioevo');

    expect(screen.queryByRole('heading', { name: t('paths.startHere') })).not.toBeInTheDocument();
  });

  it('shows the years each path spans, before the common era too', async () => {
    answer(manyPaths());
    renderPage();
    await screen.findByText(t('paths.filters.count', { count: 120 }));
    // -500 to -400 counts down with the era said once; 500 to 600 is plain.
    expect(screen.getAllByText(/^500–400 a\.C\., 8 tappe/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/^500–600 d\.C\., 8 tappe/).length).toBeGreaterThan(0);
  });

  it('lists the topics in the select, each with its count, and narrows to one when it is chosen', async () => {
    answer(manyPaths());
    const user = userEvent.setup();
    renderPage();
    const select = await screen.findByLabelText(t('paths.filters.topicLabel'));
    expect(within(select).getByRole('option', { name: 'Medioevo (40)' })).toBeInTheDocument();

    await user.selectOptions(select, 'MEDIOEVO');

    expect(screen.getByRole('status')).toHaveTextContent(t('paths.filters.count', { count: 40 }));
    expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual(['Medioevo e Rinascimento']);
    // What was asked for is open, not behind a click.
    expect(screen.getByText('Medioevo').closest('details')).toHaveAttribute('open');
    expect(screen.getByTestId('where')).toHaveTextContent('/paths?topic=MEDIOEVO');
  });

  it('opens already narrowed when the address says so', async () => {
    answer(manyPaths());
    renderPage('/paths?topic=SCIENZA');
    expect(await screen.findByRole('status')).toHaveTextContent(t('paths.filters.count', { count: 40 }));
    expect(screen.getByLabelText(t('paths.filters.topicLabel'))).toHaveValue('SCIENZA');
  });

  it('searches without accents, in the address too, and counts the topics that still match', async () => {
    const paths = manyPaths();
    paths[0] = { ...paths[0], title: 'Il perché di Cesare' };
    answer(paths);
    const user = userEvent.setup();
    renderPage();
    const search = await screen.findByLabelText(t('paths.filters.searchLabel'));

    await user.type(search, 'perche');

    expect(screen.getByRole('status')).toHaveTextContent(t('paths.filters.count', { count: 1 }));
    expect(screen.getByRole('link', { name: /Il perché di Cesare/ })).toBeInTheDocument();
    expect(screen.getByTestId('where')).toHaveTextContent('/paths?q=perche');
    expect(screen.getByRole('option', { name: 'Roma repubblicana (1)' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Medioevo (0)' })).toBeInTheDocument();
  });

  it('says nothing matches, and the clear button brings the whole list back', async () => {
    answer(manyPaths());
    const user = userEvent.setup();
    renderPage('/paths?q=zzzz');

    expect(await screen.findByText(t('paths.filters.noMatches'))).toBeInTheDocument();
    expect(screen.queryAllByRole('heading', { level: 3 })).toHaveLength(0);

    await user.click(screen.getByRole('button', { name: t('paths.filters.clear') }));

    expect(await screen.findByText(t('paths.filters.count', { count: 120 }))).toBeInTheDocument();
    expect(screen.getByTestId('where')).toHaveTextContent(/^\/paths$/);
  });
});

describe('PathsPage with a backend that sends no topics, or a few paths', () => {
  it('is one list with no headings and no topic select, but still searchable', async () => {
    answer(manyPaths(false));
    renderPage();
    expect(await screen.findByText(t('paths.filters.count', { count: 120 }))).toBeInTheDocument();
    expect(screen.queryAllByRole('heading', { level: 3 })).toHaveLength(0);
    expect(screen.queryByLabelText(t('paths.filters.topicLabel'))).not.toBeInTheDocument();
    expect(screen.getByLabelText(t('paths.filters.searchLabel'))).toBeInTheDocument();
    // No years either: the line is what it always was.
    expect(screen.getAllByText('8 tappe, 8 minuti di lettura').length).toBeGreaterThan(0);
  });

  it('shows the date of a start-here event as exactly as it is known, not as an invented 1 January', async () => {
    const insight = {
      slug: 'fondazione-di-roma',
      title: 'Fondazione di Roma',
      summary: 'Una sintesi.',
      date: { year: -753, month: 1, day: 1, precision: 'YEAR' as const },
      place: { name: 'Palatino', lat: 41.89, lon: 12.49, approximate: false },
    };
    answer(manyPaths().slice(0, 4), [
      { type: 'INSIGHT', slug: insight.slug, title: insight.title, teaser: 'Dove tutto comincia.', insight },
    ]);
    renderPage();
    expect(await screen.findByText('753 a.C.')).toBeInTheDocument();
    expect(screen.queryByText(/gennaio/)).not.toBeInTheDocument();
  });

  it('shows no filters over a handful of paths: it is short enough to read whole', async () => {
    answer(manyPaths().slice(0, 4));
    renderPage();
    expect(await screen.findByRole('link', { name: /percorso 1/ })).toBeInTheDocument();
    expect(screen.queryByLabelText(t('paths.filters.searchLabel'))).not.toBeInTheDocument();
  });
});
