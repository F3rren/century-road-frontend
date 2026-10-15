import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import i18n from '@/i18n';
import { submitErrorReport } from '../services/historyApi';
import { ReportForm } from './ReportForm';

vi.mock('../services/historyApi', () => ({ submitErrorReport: vi.fn() }));

const submit = vi.mocked(submitErrorReport);
const target = { type: 'INSIGHT', slug: 'sputnik-1' } as const;
const t = (key: string, options?: Record<string, unknown>) => i18n.t(key, options);

async function openAndFill(user: ReturnType<typeof userEvent.setup>, message = 'A Baikonur era già il 5 ottobre.') {
  await user.click(screen.getByText(t('report.open')));
  await user.selectOptions(screen.getByLabelText(t('report.categoryLabel')), 'WRONG_DATE');
  await user.type(screen.getByLabelText(t('report.messageLabel')), message);
}

beforeEach(() => {
  submit.mockReset();
});

describe('ReportForm', () => {
  it('cannot be sent until a category is chosen and the message is long enough', async () => {
    const user = userEvent.setup();
    render(<ReportForm target={target} />);
    await user.click(screen.getByText(t('report.open')));
    const send = screen.getByRole('button', { name: t('report.submit') });
    expect(send).toBeDisabled();

    await user.selectOptions(screen.getByLabelText(t('report.categoryLabel')), 'WRONG_DATE');
    await user.type(screen.getByLabelText(t('report.messageLabel')), 'troppo');
    expect(send).toBeDisabled();

    await user.type(screen.getByLabelText(t('report.messageLabel')), ' breve, ma ora basta');
    expect(send).toBeEnabled();
  });

  it('does not count blanks towards the length the backend requires', async () => {
    const user = userEvent.setup();
    render(<ReportForm target={target} />);
    await openAndFill(user, '          a          ');
    expect(screen.getByRole('button', { name: t('report.submit') })).toBeDisabled();
  });

  it('sends what it was given about, with the visitor only saying what is wrong, and thanks them', async () => {
    submit.mockResolvedValue({ id: 42, receivedAt: '2026-10-06T16:10:35Z' });
    const user = userEvent.setup();
    render(<ReportForm target={target} subject="Lo Sputnik 1 entra in orbita" />);
    await openAndFill(user);
    await user.click(screen.getByRole('button', { name: t('report.submit') }));

    expect(submit).toHaveBeenCalledWith({
      target,
      category: 'WRONG_DATE',
      message: 'A Baikonur era già il 5 ottobre.',
    });
    expect(await screen.findByRole('status')).toHaveTextContent(t('report.sent', { id: 42 }));
  });

  it('asks for nothing that identifies the visitor: no name, no email, only the category and the message', async () => {
    const user = userEvent.setup();
    render(<ReportForm target={target} />);
    await user.click(screen.getByText(t('report.open')));
    expect(screen.queryByRole('textbox', { name: /email/i })).not.toBeInTheDocument();
    expect(document.querySelector('input[type="email"]')).toBeNull();
    // Two fields and a button: the category, the message, and sending.
    expect(screen.getAllByRole('combobox')).toHaveLength(1);
    expect(screen.getAllByRole('textbox')).toHaveLength(1);
    expect(screen.getByText(new RegExp(t('report.noPersonalData')))).toBeInTheDocument();
  });

  it('names a 400 as a report that was not accepted, and keeps what was typed', async () => {
    submit.mockImplementation(() => Promise.reject(new Error('HTTP 400: Bad Request')));
    const user = userEvent.setup();
    render(<ReportForm target={target} />);
    await openAndFill(user);
    await user.click(screen.getByRole('button', { name: t('report.submit') }));

    expect(await screen.findByRole('alert')).toHaveTextContent(t('report.error.invalid'));
    expect(screen.getByLabelText(t('report.messageLabel'))).toHaveValue('A Baikonur era già il 5 ottobre.');
  });

  it('names a 429 as too many requests, not as a mistake in the report', async () => {
    submit.mockImplementation(() => Promise.reject(new Error('HTTP 429: Too Many Requests')));
    const user = userEvent.setup();
    render(<ReportForm target={target} />);
    await openAndFill(user);
    await user.click(screen.getByRole('button', { name: t('report.submit') }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(t('errors.rateLimited'));
    expect(alert).not.toHaveTextContent(t('report.error.invalid'));
    expect(screen.getByRole('button', { name: t('report.submit') })).toBeEnabled();
  });
});
