import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import i18n from '@/i18n';
import { api } from '@/services/api';
import type { PathDetail } from '@/features/history';
import { PathPage } from './PathPage';

vi.mock('@/services/api', () => ({ api: { get: vi.fn(), post: vi.fn() } }));

const t = (key: string, options?: Record<string, unknown>) => i18n.t(key, options);

const stop = (position: number) => ({
  position,
  slug: `tappa-${position}`,
  title: `Tappa ${position}`,
  summary: 'Riassunto.',
  date: { year: -509 + position, month: 1, day: 1 },
  place: { name: 'Roma', lat: 41.9, lon: 12.5, approximate: false },
  narrative: 'Perché.',
});

const detail: PathDetail = {
  slug: 'repubblica',
  language: 'it',
  title: 'La Repubblica',
  tagline: 'Una frase.',
  intro: 'Una introduzione.',
  topic: 'ROMA_REPUBBLICANA',
  topicLabel: 'Roma repubblicana',
  startYear: -509,
  endYear: -27,
  readingMinutes: 7,
  stops: [1, 2, 3, 4, 5, 6].map(stop),
};

function renderPage(data: PathDetail) {
  vi.mocked(api.get).mockResolvedValue({ success: true, data });
  return render(
    <MemoryRouter initialEntries={['/paths/repubblica']}>
      <Routes>
        <Route path="/paths/:slug" element={<PathPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.mocked(api.get).mockReset();
});

describe('PathPage', () => {
  it('says the years the path spans, before the common era too, with its stops and reading time', async () => {
    renderPage(detail);
    expect(await screen.findByText('509–27 a.C., 6 tappe, 7 minuti di lettura')).toBeInTheDocument();
  });

  it('goes back to the topic the path is in, not just to the whole list', async () => {
    renderPage(detail);
    const link = await screen.findByRole('link', { name: t('paths.backToTopic', { topic: 'Roma repubblicana' }) });
    expect(link).toHaveAttribute('href', '/paths?topic=ROMA_REPUBBLICANA');
  });

  it('goes back to the whole list, and shows no years, for a backend that sends no topic or years', async () => {
    const { topic, topicLabel, startYear, endYear, ...old } = detail;
    void topic; void topicLabel; void startYear; void endYear;
    renderPage(old);
    expect(await screen.findByText('6 tappe, 7 minuti di lettura')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: t('paths.back') })).toHaveAttribute('href', '/paths');
  });
});
