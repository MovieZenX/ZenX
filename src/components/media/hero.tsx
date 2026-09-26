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
    ? "h-9 sm:h-12 md:h-14 lg:h-16 2xl:h-20 max-w-[240px] sm:max-w-[320px] md:max-w-[380px] lg:max-w-[440px] 2xl:max-w-[540px]"
    : isTallLogo
    ? "h-11 sm:h-14 md:h-17 lg:h-20 2xl:h-24 max-w-[150px] sm:max-w-[200px] md:max-w-[240px] lg:max-w-[280px] 2xl:max-w-[340px]"
    : "h-10 sm:h-13 md:h-16 lg:h-18 2xl:h-22 max-w-[190px] sm:max-w-[260px] md:max-w-[320px] lg:max-w-[380px] 2xl:max-w-[460px]";

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
        "relative h-[88vh] sm:h-[92vh] min-h-[580px] sm:min-h-[640px] lg:min-h-[700px] max-h-[880px] 2xl:max-h-[980px] 3xl:max-h-[1080px] w-full flex flex-col justify-end overflow-hidden outline-none select-none",
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
                  className="h-full w-full object-cover object-[center_top] sm:object-[center_12%] filter brightness-105"
                  loading="eager"
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
        <div className="absolute inset-0 vignette-top z-20 pointer-events-none" />
        <div className="absolute inset-0 vignette-left z-20 pointer-events-none" />
        <div className="absolute inset-0 vignette-bottom z-20 pointer-events-none" />
      </div>

      {/* Hero Content Information Container */}
      <div className="relative z-30 w-full px-4 sm:px-6 md:px-8 pb-8 sm:pb-12 lg:pb-14 pt-24 sm:pt-32 flex flex-col sm:flex-row sm:items-end justify-between gap-6 sm:gap-8">
        {/* Active Slide Content with Glassmorphic Reveal */}
        <div
          key={`content-${currentSlide.id}-${slideKey}`}
          className="max-w-md sm:max-w-lg lg:max-w-xl space-y-3 sm:space-y-3.5 animate-glass-content"
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

          {/* Clean Flat Typographic Metadata */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-gray-300 font-medium max-w-md sm:max-w-lg">
            {currentSlide.rating !== undefined && currentSlide.rating > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 border border-white/15 text-xs font-semibold text-white select-none">
                <span className="text-amber-400">★</span>
                <span>{currentSlide.rating.toFixed(1)}</span>
              </span>
            )}

            <span className="px-2 py-0.5 rounded bg-white/10 border border-white/15 text-[11px] font-semibold text-neutral-300 select-none uppercase tracking-wide">
              {currentSlide.contentType === "tv" ? "TV Series" : "Movie"}
            </span>

            {currentSlide.quality && (
              <span className="px-2 py-0.5 rounded bg-white/10 border border-white/15 text-[11px] font-mono font-semibold text-neutral-300 select-none">
                {currentSlide.quality}
              </span>
            )}

            {currentSlide.releaseYear && (
              <>
                <span className="text-white/20 text-[10px]">·</span>
                <span className="text-gray-300 font-semibold">{currentSlide.releaseYear}</span>
              </>
            )}

            {currentSlide.duration && (
              <>
                <span className="text-white/20 text-[10px]">·</span>
                <span className="text-gray-300">{currentSlide.duration}</span>
              </>
            )}

            {currentSlide.ageRating && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wider text-gray-300 border border-white/15 bg-white/5 select-none">
                {currentSlide.ageRating}
              </span>
            )}

            {currentSlide.genres && currentSlide.genres.length > 0 && (
              <>
                <span className="text-white/20 text-[10px]">·</span>
                <span className="text-gray-400 font-normal">
                  {currentSlide.genres.slice(0, 2).join(", ")}
                </span>
              </>
            )}
          </div>

          {/* Overview / Description */}
          {currentSlide.overview?.trim() ? (
            <p className="line-clamp-2 sm:line-clamp-3 text-xs sm:text-sm text-gray-300/85 leading-relaxed max-w-md sm:max-w-lg">
              {currentSlide.overview}
            </p>
          ) : null}

          {/* Call to Actions - Clean Invisible Glassmorphism Pills (No Glow) */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link href={watchHref} className="focus-visible:outline-none">
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2.5 h-11 sm:h-12 2xl:h-13 px-6 sm:px-7 2xl:px-8 rounded-full bg-white/[0.12] hover:bg-white/[0.22] active:bg-white/[0.08] text-white font-semibold text-xs sm:text-sm 2xl:text-base backdrop-blur-xl border border-white/25 hover:border-white/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition-all duration-200 cursor-pointer select-none"
              >
                <svg className="h-4 w-4 fill-white shrink-0 ml-0.5" viewBox="0 0 24 24">
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
                  "inline-flex items-center justify-center gap-2 h-11 sm:h-12 2xl:h-13 px-5 sm:px-6 2xl:px-7 rounded-full text-xs sm:text-sm 2xl:text-base font-medium backdrop-blur-xl transition-all duration-200 cursor-pointer select-none",
                  isInWatchlist
                    ? "bg-amber-400/20 text-amber-300 border border-amber-400/35 hover:bg-amber-400/30"
                    : "bg-white/[0.06] hover:bg-white/[0.14] text-white border border-white/15 hover:border-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]"
                )}
              >
                <svg
                  className="h-4 w-4 shrink-0"
                  viewBox="0 0 24 24"
                  fill={isInWatchlist ? "currentColor" : "none"}
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

            <Link href={detailHref} className="focus-visible:outline-none">
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 h-11 sm:h-12 2xl:h-13 px-5 sm:px-6 2xl:px-7 rounded-full bg-white/[0.06] hover:bg-white/[0.14] active:bg-white/[0.04] text-white/90 hover:text-white font-medium text-xs sm:text-sm 2xl:text-base backdrop-blur-xl border border-white/15 hover:border-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] transition-all duration-200 cursor-pointer select-none"
              >
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
