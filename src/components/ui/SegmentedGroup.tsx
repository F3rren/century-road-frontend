import type { ComponentType } from "react";
import { Button } from "@/components/ui/button";

interface SegmentedGroupOption<T extends string> {
  value: T;
  label: string;
  Icon?: ComponentType<{ className?: string }>;
}

interface SegmentedGroupProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: readonly SegmentedGroupOption<T>[];
  ariaLabel: string;
}

// Generalizes the role="group"/aria-pressed button-group shape ProjectionToggle
// already uses over the map, adapted to a normal-background context (Settings
// isn't drawn over a basemap, so it uses default/ghost instead of overlay/
// overlayActive).
export function SegmentedGroup<T extends string>({ value, onChange, options, ariaLabel }: SegmentedGroupProps<T>) {
  return (
    <div role="group" aria-label={ariaLabel} className="inline-flex divide-x divide-border border border-input">
      {options.map(({ value: opt, label, Icon }) => (
        <Button
          key={opt}
          type="button"
          variant={value === opt ? "default" : "ghost"}
          size="sm"
          onClick={() => onChange(opt)}
          aria-pressed={value === opt}
          className="rounded-none"
        >
          {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
          {label}
        </Button>
      ))}
    </div>
  );
}
