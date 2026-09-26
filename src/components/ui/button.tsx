"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "glass";
export type ButtonSize = "sm" | "md" | "lg" | "icon" | "pill";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "btn-clean-primary rounded-lg font-semibold",
  secondary:
    "btn-clean-secondary rounded-lg font-medium",
  glass:
    "bg-white/15 hover:bg-white/25 text-white border border-white/15 backdrop-blur-md rounded-lg active:scale-[0.98] transition-colors",
  outline:
    "bg-transparent text-white border border-white/20 hover:border-white/40 hover:bg-white/10 rounded-lg active:scale-[0.98] transition-colors",
  ghost:
    "bg-transparent text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors",
  danger:
    "bg-red-600 hover:bg-red-500 text-white rounded-lg active:scale-[0.98] transition-colors",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-lg",
  md: "h-10 px-4 text-xs sm:text-sm gap-2 rounded-lg",
  lg: "h-11 sm:h-12 px-6 text-sm sm:text-base gap-2 rounded-xl font-semibold",
  icon: "h-10 w-10 p-0 rounded-lg justify-center",
  pill: "h-9 px-4 text-xs gap-2 rounded-full",
};

/**
 * Reusable Button component with clean, flat, modern professional styling.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-colors duration-150 cursor-pointer select-none",
          "focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:transform-none",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <Spinner size={size === "lg" ? "md" : "sm"} className="text-current" />
            {size !== "icon" && <span>{children}</span>}
          </>
        ) : (
          <>
            {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
            {children && <span>{children}</span>}
            {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
