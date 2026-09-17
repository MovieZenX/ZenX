import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "default" | "secondary" | "accent" | "rating" | "outline" | "ghost";
export type BadgeSize = "sm" | "md";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-white/10 text-gray-200 border border-white/[0.12]",
  secondary: "bg-white/[0.06] text-gray-400 border border-white/[0.08]",
  accent: "bg-white/[0.15] text-white border border-white/20",
  rating: "bg-white/[0.12] text-white border border-white/[0.16] font-semibold",
  outline: "bg-transparent text-gray-300 border border-white/20",
  ghost: "bg-white/5 text-gray-400",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "text-[10px] px-1.5 py-0.5 rounded font-medium",
  md: "text-xs px-2.5 py-0.5 rounded-md font-medium",
};

/**
 * Reusable badge / tag component for metadata, ratings, and content types.
 */
export function Badge({
  className,
  variant = "default",
  size = "md",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 leading-none tracking-wide select-none",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
