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
        // Used on top of the map/globe: dark glass surface, not tied to the app theme
        // (the basemap underneath is always a light tileset).
        overlay:
          "text-white/80 hover:text-white hover:bg-white/10 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
        overlayActive: "bg-white text-black shadow-sm focus-visible:ring-offset-2 focus-visible:ring-offset-black",
      },
      size: {
        default: "h-9 px-4 py-2",
        // 44px: below this, real touch targets get missed. ghost/outline
        // buttons have no fill at rest, so the larger box doesn't add
        // visual weight — it only grows the hit area and the hover state.
        sm: "h-11 px-4 text-sm",
        icon: "h-11 w-11 shrink-0 p-0",
        pill: "rounded-full px-3 py-1.5 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
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
