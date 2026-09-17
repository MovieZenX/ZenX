import type { ReactNode } from "react";
import Link from "next/link";
import { Button } from "./button";
import { cn } from "@/lib/utils";

export type EmptyStateType = "search" | "library" | "watchlist" | "history" | "custom";

export interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  icon?: ReactNode;
  className?: string;
}

const presets: Record<
  Exclude<EmptyStateType, "custom">,
  {
    title: string;
    description: string;
    actionLabel: string;
    actionHref: string;
    icon: React.ReactNode;
  }
> = {
  search: {
    title: "No titles found",
    description: "Try searching with different keywords, check for typos, or browse popular genres.",
    actionLabel: "Explore All Movies",
    actionHref: "/",
    icon: (
      <svg className="h-10 w-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  library: {
    title: "Your library is empty",
    description: "Saved movies, TV series, and your watch history will appear here once you start exploring.",
    actionLabel: "Discover Movies",
    actionHref: "/",
    icon: (
      <svg className="h-10 w-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  watchlist: {
    title: "Your watchlist is clear",
    description: "Add movies and TV shows to keep track of what you want to watch next.",
    actionLabel: "Browse Trending",
    actionHref: "/",
    icon: (
      <svg className="h-10 w-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    ),
  },
  history: {
    title: "No watch history yet",
    description: "Shows and movies you have streamed will be tracked here so you can easily resume playback.",
    actionLabel: "Start Watching",
    actionHref: "/",
    icon: (
      <svg className="h-10 w-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
};

/**
 * Reusable empty state display for search, library, watchlist, and history.
 */
export function EmptyState({
  type = "custom",
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  icon,
  className,
}: EmptyStateProps) {
  const preset = type !== "custom" ? presets[type] : null;

  const displayTitle = title || preset?.title || "Nothing here yet";
  const displayDesc = description || preset?.description || "No items to display at this time.";
  const displayActionLabel = actionLabel || preset?.actionLabel;
  const displayActionHref = actionHref || preset?.actionHref;
  const displayIcon = icon || preset?.icon;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl bg-white/[0.02] border border-white/[0.06]",
        className
      )}
    >
      {displayIcon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/[0.08] shadow-inner">
          {displayIcon}
        </div>
      )}

      <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
        {displayTitle}
      </h3>

      <p className="mt-2 max-w-sm text-sm text-gray-400">
        {displayDesc}
      </p>

      {(displayActionLabel || onAction) && (
        <div className="mt-6">
          {displayActionHref ? (
            <Link href={displayActionHref}>
              <Button variant="secondary" size="md">
                {displayActionLabel}
              </Button>
            </Link>
          ) : (
            <Button variant="secondary" size="md" onClick={onAction}>
              {displayActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
