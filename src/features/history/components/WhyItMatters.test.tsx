import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import i18n from '@/i18n';
import { api } from '@/services/api';
import type { InsightDetail, InsightSummary } from '../types';
import { WhyItMatters } from './WhyItMatters';

vi.mock('@/services/api', () => ({ api: { get: vi.fn(), post: vi.fn() } }));

const t = (key: string, options?: Record<string, unknown>) => i18n.t(key, options);

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

  it('lists the caveats on dates and places under their heading, only when there are any', async () => {
    vi.mocked(api.get).mockResolvedValue({ success: true, data: detail });
    const { unmount } = renderBlock();
    expect(await screen.findByText("L'evento.")).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: t('insights.notes') })).not.toBeInTheDocument();
    unmount();

    vi.mocked(api.get).mockResolvedValue({ success: true, data: { ...detail, notes: ['A Baikonur era già il 5 ottobre.'] } });
    renderBlock();
    expect(await screen.findByRole('heading', { level: 4, name: t('insights.notes') })).toBeInTheDocument();
    expect(screen.getByText('A Baikonur era già il 5 ottobre.')).toBeInTheDocument();
  });

  it('says a text nobody reviewed was not, with no review date and never the word "verified"', async () => {
    vi.mocked(api.get).mockResolvedValue({ success: true, data: detail });
    renderBlock();
    expect(await screen.findByText(new RegExp(t('insights.notReviewed')))).toBeInTheDocument();
    expect(screen.getByText(/Scritto da Century Road\./)).toBeInTheDocument();
    expect(screen.queryByText(/controllato da una persona/i)).not.toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/verificat/i);
  });

  it('shows the day a person reviewed the text, when one did', async () => {
    vi.mocked(api.get).mockResolvedValue({
      success: true,
      data: { ...detail, provenance: { author: 'Century Road', reviewedAt: '2026-10-05' } },
    });
    renderBlock();
    expect(await screen.findByText(/Controllato da una persona sulle sue fonti il 5 ottobre 2026/)).toBeInTheDocument();
    expect(screen.queryByText(new RegExp(t('insights.notReviewed')))).not.toBeInTheDocument();
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
