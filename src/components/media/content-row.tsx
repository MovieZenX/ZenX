"use client";

import { useRef, useState, useEffect, useCallback, type ReactNode } from "react";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";

export interface ContentRowProps {
  title: string;
  subtitle?: string;
  badge?: string;
  actionHref?: string;
  actionLabel?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Horizontally scrollable content row with smooth scroll arrows and touch swiping.
 */
export function ContentRow({
  title,
  subtitle,
  badge,
  actionHref,
  actionLabel,
  children,
  className,
}: ContentRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);

    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;

    const scrollAmount = el.clientWidth * 0.75;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className={cn("relative py-4 sm:py-6", className)}>
      <div className="flex items-center justify-between">
        <SectionHeading
          title={title}
          subtitle={subtitle}
          badge={badge}
          actionHref={actionHref}
          actionLabel={actionLabel}
          className="mb-3 sm:mb-4 flex-1"
        />

        {/* Carousel Desktop Navigation Arrows */}
        <div className="hidden sm:flex items-center gap-1.5 pb-3">
          <button
            type="button"
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white transition-colors cursor-pointer",
              "hover:bg-white/15 active:bg-white/20",
              "disabled:opacity-20 disabled:cursor-not-allowed"
            )}
            aria-label="Scroll left"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white transition-colors cursor-pointer",
              "hover:bg-white/15 active:bg-white/20",
              "disabled:opacity-20 disabled:cursor-not-allowed"
            )}
            aria-label="Scroll right"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Horizontally Scrollable Row */}
      <div
        ref={scrollRef}
        className="scrollbar-hide flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth"
      >
        {children}
      </div>
    </section>
  );
}
