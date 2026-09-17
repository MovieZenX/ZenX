"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
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
}

/**
 * Reusable 2:3 poster content card with hover effects, rating, and metadata.
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
}: ContentCardProps) {
  const [imageError, setImageError] = useState(false);
  const detailHref = contentType === "movie" ? `/movie/${id}` : `/tv/${id}`;

  return (
    <div
      className={cn(
        "group relative flex flex-col w-full rounded-xl overflow-hidden select-none transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40",
        className
      )}
    >
      {/* Poster Media Box (2:3 Aspect Ratio) */}
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-surface-card border border-white/[0.08] group-hover:border-white/[0.2]">
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
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-surface to-surface-card p-4 text-center">
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

        {/* Top Badges Overlay */}
        <div className="pointer-events-none absolute inset-x-2 top-2 flex items-center justify-between gap-1 z-10">
          {rating !== undefined && rating > 0 ? (
            <Badge variant="rating" size="sm" className="shadow-md backdrop-blur-md">
              <span>★</span>
              <span>{rating.toFixed(1)}</span>
            </Badge>
          ) : <span />}

          <div className="flex items-center gap-1">
            {quality && (
              <Badge variant="secondary" size="sm" className="bg-black/60 backdrop-blur-md">
                {quality}
              </Badge>
            )}
            <Badge variant="default" size="sm" className="bg-black/60 backdrop-blur-md capitalize">
              {contentType}
            </Badge>
          </div>
        </div>

        {/* Hover / Focus Interactive Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/95 via-gray-950/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex flex-col justify-end p-3.5 z-20">
          {/* Action Button linking to Detail Page */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <Link
              href={detailHref}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black transition-transform duration-200 hover:scale-110 active:scale-95"
              aria-label={`View details for ${title}`}
            >
              <svg className="h-5 w-5 fill-current ml-0.5" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </Link>

            {onWatchlistToggle && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onWatchlistToggle(id);
                }}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer",
                  isInWatchlist
                    ? "bg-white/25 border-white/40 text-white"
                    : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                )}
                aria-label={isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
              >
                <svg className="h-4 w-4" fill={isInWatchlist ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
            )}
          </div>

          <Link
            href={detailHref}
            className="text-center text-xs font-medium text-gray-300 hover:text-white transition-colors"
          >
            More Details →
          </Link>
        </div>

        {/* Full Card Primary Click Target */}
        <Link
          href={detailHref}
          className="absolute inset-0 z-0 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 rounded-xl"
          aria-label={`View details for ${title}`}
        />
      </div>

      {/* Title & Release Metadata */}
      <div className="mt-2 flex flex-col">
        <Link
          href={detailHref}
          className="line-clamp-1 text-sm font-semibold text-white group-hover:text-gray-300 transition-colors"
          title={title}
        >
          {title}
        </Link>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          {releaseYear && <span>{releaseYear}</span>}
          {releaseYear && contentType && <span>•</span>}
          <span className="capitalize">{contentType === "tv" ? "TV Series" : "Movie"}</span>
        </div>
      </div>
    </div>
  );
}
