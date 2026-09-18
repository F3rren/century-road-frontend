import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

// Shared "glass" surface for floating controls drawn on top of the map
// (ProjectionToggle, HeatLegend). Deliberately not theme-reactive: the
// basemap underneath is always a light tileset, so this stays dark for
// legibility regardless of light/dark app mode.
export function MapOverlayPanel({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border border-white/10 bg-black/70 backdrop-blur-md",
        className
      )}
      {...props}
    />
  );
}
