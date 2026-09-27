import type { ComponentType, ReactNode } from "react";
import { cn } from "@/lib/utils";

type EmptyStateVariant = "dashed" | "plain" | "overlay";
type EmptyStateTone = "muted" | "destructive";

const CONTAINER_CLASS: Record<EmptyStateVariant, string> = {
  dashed: "gap-1 border border-dashed border-border py-12",
  plain: "gap-2 py-12",
  overlay: "absolute inset-0 gap-3 bg-background/95 p-6",
};

const ICON_TONE_CLASS: Record<EmptyStateTone, string> = {
  muted: "text-muted-foreground/40",
  destructive: "text-destructive",
};

interface EmptyStateProps {
  icon?: ComponentType<{ className?: string }>;
  title?: ReactNode;
  description?: ReactNode;
  descriptionClassName?: string;
  action?: ReactNode;
  variant?: EmptyStateVariant;
  tone?: EmptyStateTone;
  className?: string;
}

// Consolidates the app's 3 "content region missing or failed" treatments: a dashed
// placeholder box, a plain in-flow block, and an absolute overlay takeover.
export function EmptyState({
  icon: Icon,
  title,
  description,
  descriptionClassName,
  action,
  variant = "plain",
  tone = "muted",
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        CONTAINER_CLASS[variant],
        className,
      )}
    >
      {Icon && <Icon className={cn("h-8 w-8", ICON_TONE_CLASS[tone])} />}
      {title && <p className="text-sm font-medium">{title}</p>}
      {description && (
        <p className={cn("max-w-xs text-xs text-muted-foreground", descriptionClassName)}>{description}</p>
      )}
      {action}
    </div>
  );
}
