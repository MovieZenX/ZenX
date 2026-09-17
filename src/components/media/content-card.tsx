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
  rankColor = "blue",
}: ContentCardProps) {
  const [imageError, setImageError] = useState(false);
  const detailHref = contentType === "movie" ? `/movie/${id}` : `/tv/${id}`;

  return (
    <div
      className={cn(
        "group relative flex flex-col w-full select-none transition-all duration-300",
        "hover:-translate-y-1.5",
        className
      )}
    >
      {/* Poster Media Box with Optional Overlapping Rank Number */}
      <div className="relative w-full">
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-zinc-900/60 border border-white/[0.12] group-hover:border-white/30 shadow-[0_8px_24px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.15)] group-hover:shadow-[0_16px_36px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.35)] transition-all duration-300">
          {/* Specular Liquid Glass Top Rim Highlight */}
          <div className="pointer-events-none absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent z-10 opacity-70 group-hover:opacity-100 transition-opacity duration-300" />

          {!imageError && posterUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={posterUrl}
              alt={title}
              loading="lazy"
              onError={() => setImageError(true)}
              className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
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

          {/* Top Badges Overlay - Floating Liquid Frosted Glass Capsules */}
          <div className="pointer-events-none absolute inset-x-2 top-2 flex items-center justify-between gap-1 z-10">
            {rating !== undefined && rating > 0 ? (
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold bg-gradient-to-b from-white/[0.30] via-white/[0.16] to-white/[0.08] backdrop-blur-xl border border-white/35 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),0_2px_8px_rgba(0,0,0,0.35)] select-none">
                <span className="text-[10px]">★</span>
                <span>{rating.toFixed(1)}</span>
              </div>
            ) : (
              <span />
            )}

            <div className="flex items-center gap-1">
              {quality && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gradient-to-b from-white/[0.22] via-white/[0.12] to-white/[0.05] backdrop-blur-xl border border-white/25 text-white/90 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_2px_8px_rgba(0,0,0,0.25)] select-none">
                  {quality}
                </span>
              )}
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-gradient-to-b from-white/[0.22] via-white/[0.12] to-white/[0.06] backdrop-blur-xl border border-white/30 text-white capitalize shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_2px_8px_rgba(0,0,0,0.25)] select-none">
                {contentType === "tv" ? "TV" : "Movie"}
              </span>
            </div>
          </div>

          {/* Hover / Focus Glassmorphic Interactive Theater Overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 backdrop-blur-[2px] opacity-0 transition-all duration-300 group-hover:opacity-100 flex items-center justify-center p-3 z-20">
            {/* Floating Liquid Glass Action Capsule */}
            <div className="pointer-events-auto flex items-center gap-2 h-9 px-3.5 rounded-full bg-gradient-to-b from-white/[0.28] via-white/[0.14] to-white/[0.06] hover:from-white/[0.36] hover:to-white/[0.18] backdrop-blur-xl border border-white/35 hover:border-white/50 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.55),0_8px_24px_rgba(0,0,0,0.6)] transition-all duration-200 hover:scale-105 active:scale-95">
              <Link
                href={detailHref}
                className="flex items-center gap-2 focus-visible:outline-none"
                aria-label={`Watch ${title}`}
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-black shadow-sm shrink-0">
                  <svg className="h-2.5 w-2.5 fill-current ml-0.5" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <span className="text-[11.5px] font-semibold tracking-wide text-white whitespace-nowrap">
                  Watch Now
                </span>
              </Link>

              {onWatchlistToggle && (
                <>
                  <div className="h-3.5 w-[1px] bg-white/25 mx-0.5" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onWatchlistToggle(id);
                    }}
                    className="flex h-5 w-5 items-center justify-center rounded-full text-white/80 hover:text-white transition-all hover:scale-110 active:scale-95 cursor-pointer"
                    aria-label={isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
                    title={isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
                  >
                    <svg className="h-3.5 w-3.5" fill={isInWatchlist ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Full Card Primary Click Target */}
          <Link
            href={detailHref}
            className="absolute inset-0 z-0 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 rounded-2xl"
            aria-label={`View details for ${title}`}
          />
        </div>

        {/* Primeshows.org Signature Hollow Outlined Rank Number */}
        {rank !== undefined && (
          <span
            className={cn(
              "pointer-events-none absolute select-none z-20 font-black leading-none tracking-tighter",
              "transition-all duration-300 group-hover:scale-105 group-hover:-translate-x-1",
              rank >= 10
                ? "-left-6 sm:-left-8 md:-left-9 -bottom-2.5 sm:-bottom-3.5 md:-bottom-4"
                : "-left-4 sm:-left-6 md:-left-7 -bottom-2.5 sm:-bottom-3.5 md:-bottom-4",
              "text-7xl sm:text-8xl md:text-9xl",
              rankColor === "white" ? "stroke-text-white" : "stroke-text-blue",
              "drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]"
            )}
            style={{
              WebkitTextStroke:
                rankColor === "white"
                  ? "2.5px rgba(255, 255, 255, 0.88)"
                  : "2.5px #3b82f6",
            }}
          >
            {rank}
          </span>
        )}
      </div>

      {/* Title & Release Metadata */}
      <div className="mt-2.5 flex flex-col gap-0.5 px-1">
        <Link
          href={detailHref}
          className="line-clamp-1 text-[13.5px] font-semibold text-white group-hover:text-gray-200 transition-colors tracking-tight"
          title={title}
        >
          {title}
        </Link>
        <div className="flex items-center gap-1.5 text-[11.5px] text-gray-400 font-medium">
          {releaseYear && <span className="text-gray-300/90">{releaseYear}</span>}
          {releaseYear && contentType && <span className="text-gray-600">•</span>}
          <span className="capitalize text-gray-400">{contentType === "tv" ? "TV Series" : "Movie"}</span>
        </div>
      </div>
    </div>
  );
}