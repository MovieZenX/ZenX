"use client";

import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: string;
  badge?: string | number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
  size?: "sm" | "md";
}

/**
 * Reusable dark-themed tab navigation switcher.
 */
export function Tabs({
  tabs,
  activeTab,
  onChange,
  className,
  size = "md",
}: TabsProps) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex items-center rounded-xl bg-white/[0.05] p-1 border border-white/[0.08]",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;

        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative flex items-center justify-center font-medium transition-all duration-200 select-none cursor-pointer rounded-lg",
              size === "sm" ? "px-3 py-1 text-xs gap-1.5" : "px-4 py-1.5 text-sm gap-2",
              isActive
                ? "bg-white/15 text-white shadow-sm border border-white/10"
                : "text-gray-400 hover:text-white hover:bg-white/[0.05]"
            )}
          >
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.2 text-[10px] font-bold",
                  isActive ? "bg-white text-black" : "bg-white/10 text-gray-400"
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
