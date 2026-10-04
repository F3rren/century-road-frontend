import { Fragment, useEffect, useRef, type ComponentProps, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export interface GrainColumn {
  key: string | number;
  // One grain per item.
  count: number;
  // Under the baseline (a year, a century).
  label: ReactNode;
  // The whole column is a link: where its items can be read. A "#section" link
  // stays a plain anchor, so it scrolls the page and keeps the query string.
  href: string;
  ariaLabel: string;
  // A jump between this column and the one before, marked rather than drawn to scale.
  gapBefore?: boolean;
}

// Grain size, gap (px) and the most rows a column may reach. A column past that
// puts more grains side by side (it widens) rather than growing taller. A dense
// chart (a country's decades can hold 180 events) uses finer grains and taller
// columns, so ten of them still fit the page. Every grain stays one item.
const NORMAL = { grain: 7, gap: 3, maxRows: 20 };
const DENSE = { grain: 5, gap: 2, maxRows: 36 };
const DENSE_FROM = 60;
// Narrowest column, wide enough for a label like "2400 a.C." under it.
const MIN_COLUMN = 40;

function ColumnLink({ href, ...props }: { href: string } & Omit<ComponentProps<"a">, "href">) {
  return href.startsWith("#") ? <a href={href} {...props} /> : <Link to={href} {...props} />;
}

// The app's chart, named after it: items as grains, piled one per item in the
// column they belong to (today's events by century, a country's by decade).
// Columns are links, so the chart is also a way in. On a narrow screen it scrolls
// sideways, starting at the recent end, where most of history's events sit.
export function GrainChart({ columns, className }: { columns: GrainColumn[]; className?: string }) {
  const most = Math.max(...columns.map((c) => c.count));
  const { grain: GRAIN, gap: GAP, maxRows } = most > DENSE_FROM ? DENSE : NORMAL;
  const perRow = Math.max(2, Math.ceil(most / maxRows));
  const pileWidth = perRow * GRAIN + (perRow - 1) * GAP;
  const pileHeight = Math.ceil(most / perRow) * (GRAIN + GAP);
  // Shared by the grain columns and their labels, so they line up.
  const columnWidth = Math.max(MIN_COLUMN, pileWidth + 8);
  const scrollerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (scroller) scroller.scrollLeft = scroller.scrollWidth;
  }, [columns]);

  return (
    <div ref={scrollerRef} className={cn("overflow-x-auto pb-2", className)}>
      <ol className="flex min-w-max items-end gap-2 border-b border-border">
        {columns.map((column) => (
          <Fragment key={column.key}>
            {column.gapBefore && (
              <li aria-hidden="true" className="self-end pb-1 text-sm text-muted-foreground">
                …
              </li>
            )}
            <li>
              <ColumnLink
                href={column.href}
                aria-label={column.ariaLabel}
                className="group flex flex-col items-center justify-end pt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{ width: columnWidth, height: pileHeight + 8 }}
              >
                <span
                  aria-hidden="true"
                  className="flex flex-wrap-reverse justify-center"
                  style={{ width: pileWidth, gap: GAP }}
                >
                  {Array.from({ length: column.count }, (_, g) => (
                    <span
                      key={g}
                      className="rounded-full bg-primary transition-colors group-hover:bg-foreground"
                      style={{ width: GRAIN, height: GRAIN }}
                    />
                  ))}
                </span>
              </ColumnLink>
            </li>
          </Fragment>
        ))}
      </ol>
      <div aria-hidden="true" className="flex min-w-max gap-2 pt-1.5">
        {columns.map((column) => (
          <Fragment key={column.key}>
            {column.gapBefore && <span className="invisible text-sm">…</span>}
            <span
              className="shrink-0 text-center font-display text-xs tabular-nums leading-tight text-muted-foreground"
              style={{ width: columnWidth }}
            >
              {column.label}
            </span>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
