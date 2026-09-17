"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onClear?: () => void;
}

/**
 * Reusable dark-themed input with icon slots and error states.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, leftIcon, rightIcon, onClear, disabled, value, ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="pointer-events-none absolute left-3.5 text-gray-400">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            disabled={disabled}
            value={value}
            className={cn(
              "w-full rounded-xl bg-white/[0.05] border border-white/[0.1] px-4 py-2.5 text-sm text-foreground",
              "placeholder:text-gray-500",
              "transition-colors duration-150",
              "focus:border-white/40 focus:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-white/15",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              leftIcon ? "pl-10" : undefined,
              rightIcon || (onClear && value) ? "pr-10" : undefined,
              error ? "border-red-500/80 focus:border-red-500 focus:ring-red-500/20" : undefined,
              className
            )}
            {...props}
          />

          {onClear && value && !disabled && (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-3 p-1 text-gray-400 hover:text-white transition-colors"
              aria-label="Clear input"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {rightIcon && !(onClear && value) && (
            <span className="pointer-events-none absolute right-3.5 text-gray-400">
              {rightIcon}
            </span>
          )}
        </div>

        {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
