import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type CardPadding = "sm" | "md";

const PADDING_CLASS: Record<CardPadding, string> = {
  sm: "p-4",
  md: "p-5",
};

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: CardPadding;
}

export function Card({ padding = "md", className, ...props }: CardProps) {
  return <div className={cn("border border-border", PADDING_CLASS[padding], className)} {...props} />;
}
