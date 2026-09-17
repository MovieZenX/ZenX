"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ContentType } from "@/types";

export interface HeroProps {
  id: string;
  title: string;
  overview: string;
  backdropUrl: string | null;
  posterUrl?: string | null;
  contentType: ContentType;
  releaseYear?: number;
  rating?: number;
  duration?: string;
  genres?: string[];
  quality?: string;
  ageRating?: string;
  onWatchlistToggle?: (id: string) => void;
  isInWatchlist?: boolean;
  className?: string;
}

/**
 * Reusable cinematic hero banner with backdrop vignettes, metadata, and action buttons.
 */
export function Hero({
  id,
  title,
  overview,
  backdropUrl,
  contentType,
  releaseYear,
  rating,
  duration,
  genres = [],
  quality = "4K",
  ageRating = "PG-13",
  onWatchlistToggle,
  isInWatchlist = false,
  className,
}: HeroProps) {
  const [imageError, setImageError] = useState(false);
  const watchHref =
    contentType === "tv"
      ? `/watch/${id}?type=tv&season=1&episode=1`
      : `/watch/${id}?type=movie`;
  const detailHref = contentType === "movie" ? `/movie/${id}` : `/tv/${id}`;

  return (
    <section
      role="region"
      aria-label={title ? `Featured: ${title}` : "Featured Spotlight"}
      className={cn(
        "relative min-h-[70vh] sm:min-h-[78vh] lg:min-h-[85vh] w-full flex flex-col justify-end overflow-hidden",
        className
      )}
    >
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0">
        {!imageError && backdropUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={backdropUrl}
            alt={title}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover object-center"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-gray-900/40 via-surface to-background" />
        )}

        {/* Multi-directional vignette gradient overlays */}
        <div className="absolute inset-0 vignette-left z-10" />
        <div className="absolute inset-0 vignette-bottom z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/50 z-10" />
      </div>

      {/* Hero Content Information */}
      <div className="relative z-20 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 pt-28 sm:pt-36">
        <div className="max-w-2xl lg:max-w-3xl space-y-4 sm:space-y-6">
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {rating !== undefined && rating > 0 && (
              <Badge variant="rating" size="md">
                <span>★</span>
                <span>{rating.toFixed(1)}</span>
              </Badge>
            )}

            {quality && <Badge variant="secondary" size="md">{quality}</Badge>}
            {ageRating && <Badge variant="outline" size="md">{ageRating}</Badge>}
            {releaseYear && <span className="text-xs text-gray-300 font-medium">{releaseYear}</span>}
            {duration && (
              <>
                <span className="text-gray-500">•</span>
                <span className="text-xs text-gray-300 font-medium">{duration}</span>
              </>
            )}
            <Badge variant="accent" size="md" className="capitalize">
              {contentType === "tv" ? "TV Series" : "Movie"}
            </Badge>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight drop-shadow-md">
            {title}
          </h1>

          {/* Genres */}
          {genres.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-300">
              {genres.map((genre, idx) => (
                <span key={genre} className="flex items-center gap-2">
                  <span>{genre}</span>
                  {idx < genres.length - 1 && <span className="text-gray-600">•</span>}
                </span>
              ))}
            </div>
          )}

          {/* Overview / Description */}
          {overview?.trim() ? (
            <p className="line-clamp-3 sm:line-clamp-4 text-sm sm:text-base text-gray-300 leading-relaxed drop-shadow">
              {overview}
            </p>
          ) : null}

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link href={watchHref}>
              <Button
                variant="primary"
                size="lg"
                leftIcon={
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                }
              >
                Watch Now
              </Button>
            </Link>

            {onWatchlistToggle && (
              <Button
                variant="secondary"
                size="lg"
                onClick={() => onWatchlistToggle(id)}
                leftIcon={
                  <svg
                    className="h-5 w-5"
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
                }
              >
                {isInWatchlist ? "In Watchlist" : "Watchlist"}
              </Button>
            )}

            <Link href={detailHref}>
              <Button
                variant="outline"
                size="lg"
                leftIcon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
              >
                Details
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
