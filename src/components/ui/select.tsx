"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  error?: string;
  label?: string;
}

/**
 * Reusable dark-themed select component.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, error, label, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block mb-1.5 text-xs font-medium text-gray-400">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={id}
            className={cn(
              "w-full appearance-none rounded-xl bg-white/[0.05] border border-white/[0.1] px-4 py-2.5 pr-10 text-sm text-foreground",
              "transition-colors duration-150 cursor-pointer",
              "focus:border-white/40 focus:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-white/15",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              error && "border-red-500/80 focus:border-red-500",
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-gray-900 text-white">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
