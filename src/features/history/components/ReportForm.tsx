import { useId, useState, type FormEvent } from 'react';
import { Flag, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { describeFetchError, httpStatus } from '@/hooks/useFetchState';
import { submitErrorReport } from '../services/historyApi';
import type { ReportCategory, ReportReceipt, ReportTarget } from '../types';

// The backend's own limits for a report's text (ReportService).
export const REPORT_MESSAGE_MIN = 10;
export const REPORT_MESSAGE_MAX = 1000;

const CATEGORIES: readonly ReportCategory[] = ['WRONG_DATE', 'WRONG_PLACE', 'WRONG_TEXT', 'BROKEN_LINK', 'OTHER'];

const LABEL_CLASS = 'mb-1.5 block text-eyebrow text-muted-foreground';
const HINT_CLASS = 'mt-1 text-xs text-muted-foreground';

interface ReportFormProps {
  // What the report is about, filled in from the card the visitor is on: the visitor only says
  // what is wrong.
  target: ReportTarget;
  // A few words naming that card, so the visitor sees what they are reporting.
  subject?: string;
}

// "Segnala un errore": closed to a single link until opened, so it can sit under every event,
// insight and path without taking space. Nothing identifying the visitor is sent: the email is
// optional and only for a reply (the backend stores no address and no session).
export function ReportForm({ target, subject }: ReportFormProps) {
  const { t } = useTranslation();
  const ids = { category: useId(), message: useId(), contact: useId(), messageHint: useId() };
  const [category, setCategory] = useState<ReportCategory | ''>('');
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<(ReportReceipt & { withContact: boolean }) | null>(null);

  const length = message.trim().length;
  const canSend = category !== '' && length >= REPORT_MESSAGE_MIN && length <= REPORT_MESSAGE_MAX && !isSending;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (category === '' || !canSend) return;
    setIsSending(true);
    setError(null);
    const trimmedContact = contact.trim();
    try {
      const result = await submitErrorReport({
        target,
        category,
        message: message.trim(),
        contact: trimmedContact || undefined,
      });
      setReceipt({ ...result, withContact: trimmedContact !== '' });
    } catch (e) {
      // 400 is a report the backend refused as written; every other failure is the usual
      // "no connection / service down / too many requests" in plain words.
      setError(
        httpStatus(e) === 400
          ? t('report.error.invalid')
          : t('report.error.generic', { error: describeFetchError(e) }),
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <details className="group">
      <summary className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm font-bold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Flag className="h-4 w-4" aria-hidden="true" />
        {t('report.open')}
      </summary>

      {receipt ? (
        <div role="status" className="mt-2 max-w-[60ch] space-y-1 text-sm">
          <p>{t('report.sent', { id: receipt.id })}</p>
          {receipt.withContact && <p className="text-muted-foreground">{t('report.sentContact')}</p>}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-2 max-w-[60ch] space-y-4">
          <p className="text-sm text-muted-foreground">{t('report.intro')}</p>
          {subject && <p className="text-sm">{t('report.about', { subject })}</p>}

          <div>
            <label htmlFor={ids.category} className={LABEL_CLASS}>
              {t('report.categoryLabel')}
            </label>
            <Select
              id={ids.category}
              required
              value={category}
              onChange={(e) => setCategory(e.target.value as ReportCategory)}
            >
              <option value="" disabled>
                {t('report.categoryPlaceholder')}
              </option>
              {CATEGORIES.map((key) => (
                <option key={key} value={key}>
                  {t(`report.category.${key}`)}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label htmlFor={ids.message} className={LABEL_CLASS}>
              {t('report.messageLabel')}
            </label>
            <Textarea
              id={ids.message}
              required
              minLength={REPORT_MESSAGE_MIN}
              maxLength={REPORT_MESSAGE_MAX}
              aria-describedby={ids.messageHint}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <p id={ids.messageHint} className={HINT_CLASS}>
              {t('report.messageHint', { min: REPORT_MESSAGE_MIN, max: REPORT_MESSAGE_MAX, length })}
            </p>
          </div>

          <div>
            <label htmlFor={ids.contact} className={LABEL_CLASS}>
              {t('report.contactLabel')}
            </label>
            <Input
              id={ids.contact}
              type="email"
              autoComplete="email"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
            <p className={HINT_CLASS}>{t('report.contactHint')}</p>
          </div>

          {error && <Alert variant="inline">{error}</Alert>}

          <Button type="submit" disabled={!canSend}>
            <Send className="h-4 w-4" aria-hidden="true" />
            {isSending ? t('report.sending') : t('report.submit')}
          </Button>
        </form>
      )}
    </details>
  );
}
