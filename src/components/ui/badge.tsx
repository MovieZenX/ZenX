import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "default" | "secondary" | "accent" | "rating" | "outline" | "ghost" | "quality" | "glass";
export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
}

const variantStyles: Record<BadgeVariant, string> = {
  default:
    "badge-clean text-neutral-300 font-medium",
  secondary:
    "glass-invisible text-neutral-300 font-medium",
  accent:
    "glass-invisible text-white font-semibold",
  rating:
    "badge-clean-rating text-white font-semibold",
  quality:
    "badge-clean text-neutral-200 font-mono tracking-wider font-semibold",
  outline:
    "bg-transparent text-neutral-300 border border-white/20",
  ghost:
    "bg-white/5 text-neutral-400 border border-transparent",
  glass:
    "glass-invisible text-white/80 font-medium",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "text-[10px] px-2 py-0.5 rounded font-medium",
  md: "text-xs px-2.5 py-0.5 rounded font-medium",
  lg: "text-sm px-3 py-1 rounded font-semibold",
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
