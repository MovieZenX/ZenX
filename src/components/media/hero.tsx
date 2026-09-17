"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import type { ContentType } from "@/types";

export interface HeroSlideItem {
  id: string;
  title: string;
  overview: string;
  backdropUrl: string | null;
  posterUrl?: string | null;
  logoUrl?: string | null;
  contentType: ContentType;
  releaseYear?: number;
  rating?: number;
  duration?: string;
  genres?: string[];
  quality?: string;
  ageRating?: string;
}

export interface HeroProps {
  items?: HeroSlideItem[];
  id?: string;
  title?: string;
  overview?: string;
  backdropUrl?: string | null;
  posterUrl?: string | null;
  logoUrl?: string | null;
  contentType?: ContentType;
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
 * Reusable cinematic hero slider with multi-item backdrop transitions,
 * metadata badges, action buttons, and an amazing floating liquid glass slidebar.
 */
export function Hero({
  items,
  id,
  title,
  overview,
  backdropUrl,
  posterUrl,
  logoUrl,
  contentType = "movie",
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
  // Normalize items array: if items array passed, use it, else fallback to single item props
  const slides: HeroSlideItem[] =
    items && items.length > 0
      ? items
      : [
          {
            id: id ?? "featured",
            title: title ?? "",
            overview: overview ?? "",
            backdropUrl: backdropUrl ?? null,
            posterUrl: posterUrl ?? null,
            logoUrl: logoUrl ?? null,
            contentType,
            releaseYear,
            rating,
            duration,
            genres,
            quality,
            ageRating,
          },
        ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [slideKey, setSlideKey] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [failedLogoIds, setFailedLogoIds] = useState<Record<string, boolean>>({});
  const [logoRatios, setLogoRatios] = useState<Record<string, number>>({});
  const touchStartX = useRef<number | null>(null);

  // Safely clamp activeIndex if items change
  const currentIdx = activeIndex < slides.length ? activeIndex : 0;
  const currentSlide = slides[currentIdx] ?? slides[0];
  const isLogoFailed = Boolean(currentSlide?.id && failedLogoIds[currentSlide.id]);
  const currentRatio = currentSlide?.id ? logoRatios[currentSlide.id] : undefined;

  // Smart sizing based on logo aspect ratio & hero side balance
  const isWideLogo = currentRatio !== undefined && currentRatio >= 3.0;
  const isTallLogo = currentRatio !== undefined && currentRatio < 2.0;

  const logoSizeClass = isWideLogo
    ? "h-9 sm:h-12 md:h-14 lg:h-16 max-w-[240px] sm:max-w-[320px] md:max-w-[380px] lg:max-w-[440px]"
    : isTallLogo
    ? "h-11 sm:h-14 md:h-17 lg:h-20 max-w-[150px] sm:max-w-[200px] md:max-w-[240px] lg:max-w-[280px]"
    : "h-10 sm:h-13 md:h-16 lg:h-18 max-w-[190px] sm:max-w-[260px] md:max-w-[320px] lg:max-w-[380px]";

  const handlePrev = useCallback(() => {
    setSlideKey((k) => k + 1);
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const handleNext = useCallback(() => {
    setSlideKey((k) => k + 1);
    setActiveIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const handleSelect = useCallback(
    (index: number) => {
      if (index === activeIndex) return;
      setSlideKey((k) => k + 1);
      setActiveIndex(index);
    },
    [activeIndex]
  );

  // Auto-advance slides every 6.5 seconds when not paused by mouse hover
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setSlideKey((k) => k + 1);
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 6500);

    return () => clearInterval(timer);
  }, [slides.length, isPaused]);

  // Keyboard navigation when user is focused within hero
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (slides.length <= 1) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      }
    },
    [handlePrev, handleNext, slides.length]
  );

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const clientX = e.changedTouches[0]?.clientX;
    if (clientX === undefined) return;
    const diffX = touchStartX.current - clientX;
    if (Math.abs(diffX) > 40) {
      if (diffX > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartX.current = null;
  };

  if (!currentSlide) return null;

  const watchHref =
    currentSlide.contentType === "tv"
      ? `/watch/${currentSlide.id}?type=tv&season=1&episode=1`
      : `/watch/${currentSlide.id}?type=movie`;
  const detailHref =
    currentSlide.contentType === "movie"
      ? `/movie/${currentSlide.id}`
      : `/tv/${currentSlide.id}`;

  return (
    <section
      role="region"
      aria-label={currentSlide.title ? `Featured: ${currentSlide.title}` : "Featured Spotlight"}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={cn(
        "relative min-h-[72vh] sm:min-h-[78vh] lg:min-h-[85vh] w-full flex flex-col justify-end overflow-hidden outline-none select-none",
        className
      )}
    >
      {/* Background Slides Stack with Smooth Depth Dissolve */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {slides.map((slide, idx) => {
          const isCurrent = idx === currentIdx;
          return (
            <div
              key={slide.id}
              className={cn(
                "absolute inset-0 transition-all duration-700 ease-out",
                isCurrent
                  ? "opacity-100 scale-100 z-10"
                  : "opacity-0 scale-[1.03] pointer-events-none z-0"
              )}
            >
              {slide.backdropUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={slide.backdropUrl}
                  alt={slide.title}
                  className="h-full w-full object-cover object-center"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-gray-900/40 via-surface to-background" />
              )}
            </div>
          );
        })}

        {/* Specular Liquid Glass Refraction Light Sweep */}
        <div
          key={`glass-sheen-${slideKey}`}
          className="absolute inset-0 z-15 pointer-events-none overflow-hidden"
        >
          <div
            className="absolute inset-y-0 w-2/3 bg-gradient-to-r from-transparent via-white/[0.14] to-transparent animate-glass-sweep pointer-events-none"
            style={{
              filter: "blur(32px)",
            }}
          />
        </div>

        {/* Multi-directional vignette gradient overlays */}
        <div className="absolute inset-0 vignette-left z-20 pointer-events-none" />
        <div className="absolute inset-0 vignette-bottom z-20 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/50 z-20 pointer-events-none" />
      </div>

      {/* Hero Content Information Container */}
      <div className="relative z-30 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12 pt-20 sm:pt-28 flex flex-col sm:flex-row sm:items-end justify-between gap-5 sm:gap-6">
        {/* Active Slide Content with Glassmorphic Reveal */}
        <div
          key={`content-${currentSlide.id}-${slideKey}`}
          className="max-w-xl lg:max-w-2xl space-y-3 sm:space-y-3.5 animate-glass-content"
        >
          {/* Official TMDB Logo or Fallback Title Heading */}
          {currentSlide.logoUrl && !isLogoFailed ? (
            <div className="py-0.5 sm:py-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentSlide.logoUrl}
                alt={currentSlide.title}
                onLoad={(e) => {
                  const img = e.currentTarget;
                  if (img.naturalWidth && img.naturalHeight) {
                    const ratio = Number((img.naturalWidth / img.naturalHeight).toFixed(2));
                    setLogoRatios((prev) =>
                      prev[currentSlide.id] === ratio ? prev : { ...prev, [currentSlide.id]: ratio }
                    );
                  }
                }}
                onError={() =>
                  setFailedLogoIds((prev) => ({ ...prev, [currentSlide.id]: true }))
                }
                className={cn(
                  logoSizeClass,
                  "w-auto object-contain object-left drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)] filter brightness-105 select-none pointer-events-none transition-all duration-300"
                )}
                loading="eager"
              />
            </div>
          ) : (
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight drop-shadow-md">
              {currentSlide.title}
            </h1>
          )}

          {/* Clean Cinematic Typographic Metadata (Matching the Logo) */}
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-gray-300 font-medium">
            {currentSlide.rating !== undefined && currentSlide.rating > 0 && (
              <span className="inline-flex items-center gap-1 font-semibold text-white">
                <span className="text-[11px]">★</span>
                <span>{currentSlide.rating.toFixed(1)}</span>
              </span>
            )}

            {currentSlide.releaseYear && (
              <>
                <span className="text-white/25 text-[10px]">·</span>
                <span className="text-gray-300">{currentSlide.releaseYear}</span>
              </>
            )}

            {currentSlide.duration && (
              <>
                <span className="text-white/25 text-[10px]">·</span>
                <span className="text-gray-300">{currentSlide.duration}</span>
              </>
            )}

            {currentSlide.quality && (
              <>
                <span className="text-white/25 text-[10px]">·</span>
                <span className="px-1.5 py-0.5 rounded-[4px] text-[10px] font-semibold tracking-wider text-white border border-white/25 bg-white/[0.08] backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] select-none">
                  {currentSlide.quality}
                </span>
              </>
            )}

            {currentSlide.ageRating && (
              <span className="px-1.5 py-0.5 rounded-[4px] text-[10px] font-semibold tracking-wider text-gray-200 border border-white/20 bg-white/[0.04] backdrop-blur-md select-none">
                {currentSlide.ageRating}
              </span>
            )}

            {currentSlide.genres && currentSlide.genres.length > 0 && (
              <>
                <span className="text-white/25 text-[10px]">·</span>
                <span className="text-gray-400 font-normal">
                  {currentSlide.genres.slice(0, 3).join(", ")}
                </span>
              </>
            )}
          </div>

          {/* Overview / Description */}
          {currentSlide.overview?.trim() ? (
            <p className="line-clamp-2 sm:line-clamp-3 text-xs sm:text-sm text-gray-300/85 leading-relaxed max-w-lg sm:max-w-xl drop-shadow">
              {currentSlide.overview}
            </p>
          ) : null}

          {/* Call to Actions - Proportional Frosted Glass Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1.5">
            <Link href={watchHref}>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-1.5 h-8.5 sm:h-9 px-4 sm:px-4.5 rounded-full bg-white text-black font-semibold text-[11.5px] sm:text-xs hover:bg-white/90 active:scale-[0.98] transition-all duration-200 cursor-pointer shadow-[0_4px_18px_rgba(255,255,255,0.22),inset_0_1px_1px_rgba(255,255,255,0.9)] hover:scale-[1.02]"
              >
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span>Watch Now</span>
              </button>
            </Link>

            {onWatchlistToggle && (
              <button
                type="button"
                onClick={() => onWatchlistToggle(currentSlide.id)}
                className={cn(
                  "inline-flex items-center justify-center gap-1.5 h-8.5 sm:h-9 px-3.5 sm:px-4 rounded-full backdrop-blur-xl border transition-all duration-200 text-[11.5px] sm:text-xs font-medium cursor-pointer active:scale-[0.98] hover:scale-[1.02]",
                  isInWatchlist
                    ? "bg-gradient-to-b from-white/[0.28] via-white/[0.16] to-white/[0.08] border-white/40 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.45),0_4px_16px_rgba(0,0,0,0.3)]"
                    : "bg-gradient-to-b from-white/[0.18] via-white/[0.08] to-white/[0.03] hover:from-white/[0.24] hover:to-white/[0.06] border-white/20 hover:border-white/35 text-white/90 hover:text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_4px_14px_rgba(0,0,0,0.3)]"
                )}
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
                <span>{isInWatchlist ? "In Watchlist" : "Watchlist"}</span>
              </button>
            )}

            <Link href={detailHref}>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-1.5 h-8.5 sm:h-9 px-3.5 sm:px-4 rounded-full bg-gradient-to-b from-white/[0.20] via-white/[0.10] to-white/[0.04] hover:from-white/[0.28] hover:to-white/[0.08] backdrop-blur-xl border border-white/25 hover:border-white/40 text-white font-medium text-[11.5px] sm:text-xs active:scale-[0.98] hover:scale-[1.02] transition-all duration-200 cursor-pointer shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_4px_14px_rgba(0,0,0,0.3)]"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Details</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Minimalist Slide Indicators */}
        {slides.length > 1 && (
          <div className="shrink-0 flex items-center gap-2 pt-2 sm:pt-0 select-none">
            {/* Subtle Previous Chevron */}
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous Slide"
              className="text-white/40 hover:text-white transition-colors cursor-pointer p-1 rounded-full hover:bg-white/10"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Clean Dots */}
            <div className="flex items-center gap-1.5">
              {slides.map((slide, idx) => {
                const isActive = idx === currentIdx;
                return (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => handleSelect(idx)}
                    aria-label={`Go to slide ${idx + 1}: ${slide.title}`}
                    className={cn(
                      "h-1 rounded-full transition-all duration-300 cursor-pointer block",
                      isActive
                        ? "w-6 bg-white shadow-sm"
                        : "w-1.5 bg-white/30 hover:bg-white/60 hover:w-2"
                    )}
                  />
                );
              })}
            </div>

            {/* Subtle Next Chevron */}
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next Slide"
              className="text-white/40 hover:text-white transition-colors cursor-pointer p-1 rounded-full hover:bg-white/10"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
