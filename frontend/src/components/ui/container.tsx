import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: "default" | "sm" | "wide" | "full";
}

const sizeMap = {
  sm: "max-w-md mx-auto",
  default: "w-full",
  wide: "w-full",
  full: "w-full",
};

/**
 * Standardized responsive page container.
 * True full-width edge-to-edge layout spreading completely from left to right.
 */
export function Container({
  className,
  size = "default",
  children,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        "w-full px-4 sm:px-6 md:px-8",
        sizeMap[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
