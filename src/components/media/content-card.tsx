"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ContentType } from "@/types";

export interface ContentCardProps {
  id: string;
  title: string;
  posterUrl: string | null;
  contentType: ContentType;
  releaseYear?: number | null;
  rating?: number;
  quality?: string;
  className?: string;
  onWatchlistToggle?: (id: string) => void;
  isInWatchlist?: boolean;
  rank?: number;
  rankColor?: "blue" | "white";
}

/**
 * Reusable 2:3 poster content card with professional liquid glassmorphism,
 * floating frosted glass badges, and smooth hover interactions.
 */
export function ContentCard({
  id,
  title,
  posterUrl,
  contentType,
  releaseYear,
  rating,
  quality,
  className,
  onWatchlistToggle,
  isInWatchlist = false,
  rank,
  rankColor = "white",
}: ContentCardProps) {
  const [imageError, setImageError] = useState(false);
  const detailHref = contentType === "movie" ? `/movie/${id}` : `/tv/${id}`;

  return (
    <div
      className={cn(
        "group relative flex flex-col w-full select-none transform-gpu transition-transform duration-200 ease-out",
        "hover:-translate-y-1.5",
        className
      )}
    >
      {/* Poster Media Box with Inline Overlapping Rank Number (No Overflow Clipping) */}
      <div className={cn("relative w-full", rank !== undefined && "flex items-end")}>
        {/* Signature Stream Outlined Rank Number */}
        {rank !== undefined && (
          <span
            className={cn(
              "pointer-events-none relative z-20 shrink-0 font-black leading-none tracking-tighter select-none",
              "transition-colors duration-150 flex justify-end",
              rank >= 10
                ? "w-16 sm:w-20 md:w-24 -mr-8 sm:-mr-10 md:-mr-12 -mb-1 sm:-mb-2"
                : "w-12 sm:w-14 md:w-16 -mr-6 sm:-mr-8 md:-mr-9 -mb-1 sm:-mb-2",
              "text-7xl sm:text-8xl md:text-9xl",
              rankColor === "blue" ? "stroke-text-blue" : "stroke-text-white"
            )}
          >
            {rank}
          </span>
        )}

        <div className={cn("relative w-full", rank !== undefined && "flex-1 min-w-0")}>
          <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-zinc-900 border border-white/[0.12] group-hover:border-white/35 shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-colors duration-200">
            {/* Top Rim Highlight */}
            <div className="pointer-events-none absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent z-10 opacity-70 group-hover:opacity-100 transition-opacity duration-200" />

            {!imageError && posterUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={posterUrl}
                alt={title}
                loading="lazy"
                onError={() => setImageError(true)}
                className="h-full w-full object-cover object-center transform-gpu transition-transform duration-300 ease-out group-hover:scale-105 will-change-transform"
              />
            ) : (
              /* Fallback poster placeholder */
              <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-950 p-4 text-center">
                <svg
                  className="h-10 w-10 text-gray-600 mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                  />
                </svg>
                <span className="line-clamp-2 text-xs font-medium text-gray-400">
                  {title}
                </span>
              </div>
            )}

            {/* Bottom subtle gradient vignette */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent z-1" />

            {/* Top Badges Overlay - Flat Clean Chips */}
            <div className="pointer-events-none absolute inset-x-2 top-2 flex items-center justify-between gap-1 z-10">
              {rating !== undefined && rating > 0 ? (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-black/75 border border-white/15 text-[10.5px] font-semibold text-white select-none">
                  <span className="text-amber-400">★</span>
                  <span>{rating.toFixed(1)}</span>
                </div>
              ) : (
                <span />
              )}

              <div className="flex items-center gap-1">
                {quality && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-black/75 border border-white/15 text-[9.5px] font-semibold font-mono tracking-wider text-neutral-300 select-none">
                    {quality}
                  </span>
                )}
                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-black/75 border border-white/15 text-[9.5px] font-semibold tracking-wider uppercase text-neutral-300 select-none">
                  {contentType === "tv" ? "TV" : "Movie"}
                </span>
              </div>
            </div>

            {/* Hover Overlay — Instant Zero-Lag GPU Composited Play */}
            <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100">
              {/* Zero-blur GPU opacity scrim */}
              <div className="absolute inset-0 bg-black/50" />

              {/* Centered Frosted Play Circle — High Performance GPU Glass */}
              <div className="relative z-10 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-white/20 hover:bg-white/35 active:bg-white/10 border border-white/40 shadow-xl transform-gpu transition-transform duration-150 ease-out group-hover:scale-105 active:scale-95 select-none">
                <svg className="h-5 w-5 sm:h-6 sm:w-6 fill-white ml-0.5" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>

              {/* Watchlist Quick-Toggle (Discrete Corner Pill) */}
              {onWatchlistToggle && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onWatchlistToggle(id);
                  }}
                  className={cn(
                    "pointer-events-auto absolute bottom-2.5 right-2.5 z-20 flex h-8 w-8 items-center justify-center rounded-full border transition-colors duration-150 cursor-pointer shadow-md",
                    isInWatchlist
                      ? "bg-amber-400/30 border-amber-400/50 text-amber-300 hover:bg-amber-400/40"
                      : "bg-black/60 hover:bg-black/80 border-white/20 text-white/80 hover:text-white"
                  )}
                  aria-label={isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
                  title={isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
                >
                  <svg
                    className="h-3.5 w-3.5"
                    fill={isInWatchlist ? "currentColor" : "none"}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Full Card Primary Click Target */}
            <Link
              href={detailHref}
              className="absolute inset-0 z-0 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 rounded-2xl"
              aria-label={`View details for ${title}`}
            />
          </div>
        </div>
      </div>

      {/* Title & Release Metadata */}
      <div
        className={cn(
          "mt-2.5 flex flex-col items-center text-center gap-0.5 px-1",
          rank !== undefined && (rank >= 10 ? "pl-8 sm:pl-10 md:pl-12" : "pl-6 sm:pl-7 md:pl-8")
        )}
      >
        <Link
          href={detailHref}
          className="block w-full text-center truncate text-[13.5px] font-semibold text-white group-hover:text-gray-200 transition-colors tracking-tight"
          title={title}
        >
          {title}
        </Link>
        <div className="flex items-center justify-center gap-1.5 text-[11.5px] text-gray-400 font-medium">
          {releaseYear && <span className="text-gray-300/90">{releaseYear}</span>}
          {releaseYear && contentType && <span className="text-gray-600">•</span>}
          <span className="capitalize text-gray-400">{contentType === "tv" ? "TV Series" : "Movie"}</span>
        </div>
      </div>
    </div>
  );
}