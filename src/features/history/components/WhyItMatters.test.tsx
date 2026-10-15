import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { api } from '@/services/api';
import type { InsightDetail, InsightSummary } from '../types';
import { WhyItMatters } from './WhyItMatters';

vi.mock('@/services/api', () => ({ api: { get: vi.fn(), post: vi.fn() } }));

const summary: InsightSummary = {
  slug: 'sputnik-1',
  title: 'Lo Sputnik 1 entra in orbita',
  summary: 'Il primo satellite artificiale.',
  date: { year: 1957, month: 10, day: 4 },
  place: { name: 'Baikonur', lat: 45.92, lon: 63.34, approximate: false },
};

const related = (n: number) => ({
  slug: `evento-${n}`,
  title: `Evento ${n}`,
  date: { year: 1960 + n, month: 1, day: 1 },
  reason: `Perché ${n}.`,
});

const detail: InsightDetail = {
  ...summary,
  language: 'it',
  before: 'Prima uno.\n\nPrima due.',
  event: "L'evento.",
  after: 'Dopo.',
  related: [1, 2, 3, 4].map(related),
  inPaths: [],
  sources: [],
  notes: [],
  provenance: { author: 'Century Road' },
};

function renderBlock() {
  return render(
    <MemoryRouter>
      <WhyItMatters insight={summary} />
    </MemoryRouter>,
  );
}

describe('WhyItMatters', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset();
  });

  it('shows before, the event, after and at most three connections', async () => {
    vi.mocked(api.get).mockResolvedValue({ success: true, data: detail });
    renderBlock();

    expect(await screen.findByText('Prima uno.')).toBeInTheDocument();
    expect(screen.getByText('Prima due.')).toBeInTheDocument();
    expect(screen.getByText("L'evento.")).toBeInTheDocument();
    expect(screen.getByText('Dopo.')).toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(3);
    expect(screen.getByRole('link', { name: /Evento 1/ })).toHaveAttribute('href', '/insights/evento-1');
  });

  it('shows nothing while loading', () => {
    vi.mocked(api.get).mockReturnValue(new Promise(() => {}));
    const { container } = renderBlock();
    expect(container).toBeEmptyDOMElement();
  });

  it('is hidden when the insight cannot be read', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('HTTP 500: boom'));
    const { container } = renderBlock();
    await vi.waitFor(() => expect(api.get).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
  });

  it('leaves out an empty part and an empty connections list', async () => {
    vi.mocked(api.get).mockResolvedValue({ success: true, data: { ...detail, before: "", related: [] } });
    renderBlock();

    expect(await screen.findByText("L'evento.")).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 4 })).toHaveLength(2);
  });
});
