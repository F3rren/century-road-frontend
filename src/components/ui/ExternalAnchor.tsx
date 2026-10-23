import type { AnchorHTMLAttributes } from 'react';
import { useTranslation } from 'react-i18next';
import { isWebUrl } from '@/lib/safeUrl';
import { cn } from '@/lib/utils';

// Every link in the history feature leaves the app (Wikipedia, Commons, the
// licence), so opening a new tab is announced instead of surprising anyone.
//
// The addresses come from outside the app, so only an http(s) one becomes a link: for anything
// else (`javascript:`, `data:`, a missing or malformed address) the text is shown and nothing is
// linked, which keeps the content readable without handing out a link that runs code.
export function ExternalAnchor({
  className,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const { t } = useTranslation();
  if (!isWebUrl(props.href)) return <span>{children}</span>;
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
