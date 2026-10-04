import type { ReactNode } from "react";
import { Link } from "react-router-dom";

// Children are optional because react-i18next's <Trans> clones these and fills them
// in from the translation string, e.g. "<archive>Archivio</archive>".
export function ProseLink({ to, children }: { to: string; children?: ReactNode }) {
  return (
    <Link
      to={to}
      className="text-primary underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {children}
    </Link>
  );
}

export function Kbd({ children }: { children?: ReactNode }) {
  return <kbd className="border border-border px-1 font-mono text-sm">{children}</kbd>;
}
