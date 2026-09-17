import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "interactive";
}

/**
 * Reusable surface card container.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl transition-all duration-200",
          variant === "default" &&
            "bg-surface-card border border-white/[0.07] shadow-lg shadow-black/40",
          variant === "glass" &&
            "glass-card",
          variant === "interactive" &&
            "bg-surface-card border border-white/[0.07] hover:border-white/[0.22] hover:bg-surface-hover hover:shadow-xl hover:shadow-black/60 active:scale-[0.99]",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
