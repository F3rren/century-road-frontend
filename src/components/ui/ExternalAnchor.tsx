import type { AnchorHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

// Every link in the history feature leaves the app (Wikipedia, Commons, the
// licence), so opening a new tab is announced instead of surprising anyone.
export function ExternalAnchor({
  className,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
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
      <span className="sr-only"> (si apre in una nuova scheda)</span>
    </a>
  );
}
