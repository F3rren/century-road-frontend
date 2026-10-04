import { cn } from "@/lib/utils";

export const BRAND_NAME = "Grains of History";

// An hourglass drawn in grains: four rows narrowing to the neck, four widening
// below. Rows are counts of grains, centred on the glass's axis.
const ROWS = [4, 3, 2, 1, 1, 2, 3, 4] as const;
const GAP = 3;
const WIDTH = (Math.max(...ROWS) - 1) * GAP + 3;
const GRAINS = ROWS.flatMap((count, row) =>
  Array.from({ length: count }, (_, i) => ({
    cx: WIDTH / 2 + (i - (count - 1) / 2) * GAP,
    cy: 1.5 + row * 2.6,
  })),
);

// Pause between two grains when the mark settles in, top row first.
const GRAIN_STAGGER_S = 0.045;

interface HourglassMarkProps {
  className?: string;
  // Settle the grains in one by one (the Welcome page); still elsewhere.
  settle?: boolean;
}

export function HourglassMark({ className, settle = false }: HourglassMarkProps) {
  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${1.5 * 2 + (ROWS.length - 1) * 2.6}`}
      className={cn("h-5 w-auto shrink-0", className)}
      fill="currentColor"
      aria-hidden="true"
    >
      {GRAINS.map(({ cx, cy }, i) => (
        <circle
          key={`${cx}-${cy}`}
          cx={cx}
          cy={cy}
          r={1.05}
          className={settle ? "motion-safe:animate-grain-settle" : undefined}
          style={settle ? { animationDelay: `${i * GRAIN_STAGGER_S}s` } : undefined}
        />
      ))}
    </svg>
  );
}

interface WordmarkProps {
  className?: string;
  markClassName?: string;
}

// The mark plus the name, which stays in English in every UI language.
export function Wordmark({ className, markClassName }: WordmarkProps) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-display font-semibold", className)}>
      <HourglassMark className={markClassName} />
      {BRAND_NAME}
    </span>
  );
}
