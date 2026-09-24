import type { AnchorHTMLAttributes } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

// Every link in the history feature leaves the app (Wikipedia, Commons, the
// licence), so opening a new tab is announced instead of surprising anyone.
export function ExternalAnchor({
  className,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const { t } = useTranslation();
  return (
    <a
      {...props}
      target="_blank"
      rel="noreferrer"
      className={cn(
        'underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
    >
      {children}
      <span className="sr-only">{t('common.opensInNewTab')}</span>
    </a>
  );
}
