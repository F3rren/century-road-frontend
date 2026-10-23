import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { RankedRow } from "../lib/popularityRows";

interface RankedListProps {
  label: string;
  rows: RankedRow[];
  emptyText: string;
  // `p` inside a section that has its own heading; `h2` when the list is the section.
  headingTag?: "p" | "h2";
}

// A numbered, most-viewed-first list: the name, and how many views it has. A row with an
// `href` is a link, with a 44px target; one without is plain text.
export function RankedList({ label, rows, emptyText, headingTag: Heading = "p" }: RankedListProps) {
  const { t } = useTranslation();

  return (
    <div>
      <Heading className="text-eyebrow text-muted-foreground">{label}</Heading>
      {rows.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        <ol className="mt-2 divide-y divide-border border-t border-border">
          {rows.map((row, index) => (
            <li
              key={row.id}
              className={`flex justify-between gap-3 ${row.href ? "min-h-11 items-center" : "items-baseline py-2"}`}
            >
              <span className="flex min-w-0 items-baseline gap-3">
                <span className="w-6 shrink-0 text-xs tabular-nums text-muted-foreground">{index + 1}</span>
                {row.href ? (
                  <Link
                    to={row.href}
                    className="inline-flex min-h-11 items-center truncate text-sm font-bold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {row.name}
                  </Link>
                ) : (
                  <span className="truncate text-sm font-medium">{row.name}</span>
                )}
              </span>
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                {t("dashboard.popularity.views", { count: row.viewCount })}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
