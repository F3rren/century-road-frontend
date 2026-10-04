import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        ghost: "hover:bg-accent hover:text-accent-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        // Formalizes an already-repeated ad hoc recipe (ContactEmail, SeeAlso, and
        // several inline text links) rather than inventing new visual language.
        link: "text-primary underline-offset-4 hover:underline focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        // Used on top of the map/globe: a solid Prussian plaque, not tied to
        // the app theme (the basemap underneath is always a light tileset).
        // The focus ring is fixer yellow there, as in the sidebar: the
        // theme's ring is Prussian in light mode and would vanish on it.
        overlay:
          "text-white/80 hover:text-white hover:bg-white/10 focus-visible:ring-sidebar-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black",
        // Active state is fixer yellow, as on the sidebar and the selected
        // country: on the Prussian plaque the exposure blue would barely show.
        overlayActive: "bg-highlight text-highlight-foreground focus-visible:ring-sidebar-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black",
      },
      size: {
        // 44px: below this, real touch targets get missed. ghost/outline
        // buttons have no fill at rest, so the larger box doesn't add
        // visual weight — it only grows the hit area and the hover state.
        // No sub-44px size exists — every call site in the system needs a
        // real touch target, so there's no compliant reason to add one.
        sm: "h-11 px-4 text-sm",
        icon: "h-11 w-11 shrink-0 p-0",
        pill: "h-11 px-4 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
