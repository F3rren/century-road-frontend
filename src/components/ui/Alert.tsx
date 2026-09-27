import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AlertProps {
  variant?: "boxed" | "inline";
  children: ReactNode;
  className?: string;
}

// A single error/notice message, always announced via role="alert". "boxed" is the
// page-level treatment (border + padding); "inline" is for tighter contexts (inside a
// panel that already has its own border/padding).
export function Alert({ variant = "boxed", className, children }: AlertProps) {
  return (
    <p
      role="alert"
      className={cn(
        variant === "boxed"
          ? "border border-destructive p-4 text-sm text-destructive"
          : "text-xs text-destructive",
        className,
      )}
    >
      {children}
    </p>
  );
}
