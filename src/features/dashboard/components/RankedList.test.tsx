import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@/i18n';
import { RankedList } from './RankedList';

const rows = [
  { id: 'a', name: '4 ottobre', viewCount: 120, href: '/archive?month=10&day=4' },
  { id: 'b', name: '5 ottobre', viewCount: 1, href: '/archive?month=10&day=5' },
];

function renderList(props: Partial<React.ComponentProps<typeof RankedList>> = {}) {
  return render(
    <MemoryRouter>
      <RankedList label="Giorni più visitati" rows={rows} emptyText="Nessun dato." {...props} />
    </MemoryRouter>,
  );
}

describe('RankedList', () => {
  it('numbers the rows in the order given, with how many views each has', () => {
    renderList();
    const items = screen.getAllByRole('listitem');
    expect(within(items[0]).getByText('1')).toBeInTheDocument();
    expect(within(items[0]).getByText('120 visite')).toBeInTheDocument();
    expect(within(items[1]).getByText('2')).toBeInTheDocument();
    expect(within(items[1]).getByText('1 visita')).toBeInTheDocument();
  });

  it('makes a row with an address a link, and one without plain text', () => {
    renderList({ rows: [rows[0], { id: 'c', name: '6 ottobre', viewCount: 3 }] });
    expect(screen.getByRole('link', { name: '4 ottobre' })).toHaveAttribute('href', '/archive?month=10&day=4');
    expect(screen.getByText('6 ottobre')).toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(1);
  });

  it('says so when there is nothing to rank', () => {
    renderList({ rows: [] });
    expect(screen.getByText('Nessun dato.')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('labels the list with a heading only when asked to', () => {
    const { unmount } = renderList();
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    unmount();
    renderList({ headingTag: 'h2' });
    expect(screen.getByRole('heading', { level: 2, name: 'Giorni più visitati' })).toBeInTheDocument();
  });
});
