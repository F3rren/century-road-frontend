import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import i18n from '@/i18n';
import { api } from '@/services/api';
import { CenturySamePeriod } from './CenturySamePeriod';

vi.mock('@/services/api', () => ({ api: { get: vi.fn(), post: vi.fn() } }));

const attribution = { source: 'Wikipedia', license: 'CC BY-SA 4.0', licenseUrl: 'https://example.org', notice: 'n' };
const t = (key: string, options?: Record<string, unknown>) => i18n.t(key, options);
const NONE = {
  language: 'it', year: 1969, fromYear: 1964, toYear: 1974, comparison: 'TEMPORAL', notice: 'n',
  coverage: { level: 'NONE', eventCount: 0, countryCount: 0, note: 'n' }, countries: [], attribution,
};

function renderIt() {
  return render(
    <MemoryRouter>
      <CenturySamePeriod country="IT" initialYear={1950} />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.mocked(api.get).mockReset();
  vi.mocked(api.get).mockResolvedValue({ success: true, data: NONE });
});

describe('CenturySamePeriod', () => {
  it("starts from the year it is given and leaves out the country being read", async () => {
    renderIt();
    expect(screen.getByLabelText(t('samePeriod.yearLabel'))).toHaveValue('1950');
    await waitFor(() =>
      expect(api.get).toHaveBeenCalledWith('/history/same-period?year=1950&lang=it&excludeCountry=IT'),
    );
  });

  it('follows the year the reader types, once they stop typing', async () => {
    const user = userEvent.setup();
    renderIt();
    const field = screen.getByLabelText(t('samePeriod.yearLabel'));
    await user.clear(field);
    await user.type(field, '1969');
    await waitFor(
      () => expect(api.get).toHaveBeenLastCalledWith('/history/same-period?year=1969&lang=it&excludeCountry=IT'),
      { timeout: 2000 },
    );
    // Not one request per keystroke.
    const years = vi.mocked(api.get).mock.calls.map(([path]) => String(path).match(/year=(-?\d+)/)?.[1]);
    expect(years).not.toContain('1');
    expect(years).not.toContain('19');
  });

  it('says what is wrong with a year that is not one, and asks nothing for it', async () => {
    const user = userEvent.setup();
    renderIt();
    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(1));
    const field = screen.getByLabelText(t('samePeriod.yearLabel'));
    await user.clear(field);
    await user.type(field, '99999');
    expect(screen.getByText(t('samePeriod.yearInvalid'))).toBeInTheDocument();
    expect(field).toHaveAttribute('aria-invalid', 'true');
    await new Promise((resolve) => setTimeout(resolve, 700));
    expect(api.get).toHaveBeenCalledTimes(1);
  });

  it('takes a year before the common era', async () => {
    const user = userEvent.setup();
    renderIt();
    const field = screen.getByLabelText(t('samePeriod.yearLabel'));
    await user.clear(field);
    await user.type(field, '-44');
    await waitFor(
      () => expect(api.get).toHaveBeenLastCalledWith('/history/same-period?year=-44&lang=it&excludeCountry=IT'),
      { timeout: 2000 },
    );
  });
});
