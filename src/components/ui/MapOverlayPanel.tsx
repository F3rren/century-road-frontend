import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

// Shared plaque for floating controls drawn on top of the map
// (ProjectionToggle, HeatLegend) — a solid mounted plate, not frosted
// glass (blur-as-decoration is off the table for this direction).
// Deliberately not theme-reactive: the basemap underneath is always a
// light tileset, so this stays dark for legibility regardless of
// light/dark app mode.
export function MapOverlayPanel({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "border border-white/15 bg-[#141210]/90",
        className
      )}
      {...props}
    />
  );
}
