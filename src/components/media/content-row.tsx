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
  isNumbered?: boolean;
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
  isNumbered = false,
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
              "flex h-7.5 w-7.5 items-center justify-center rounded-full border border-white/20 bg-gradient-to-b from-white/[0.18] via-white/[0.08] to-white/[0.03] text-white transition-all duration-200 cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] backdrop-blur-md",
              "hover:from-white/[0.28] hover:to-white/[0.10] hover:border-white/35 active:scale-95",
              "disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:scale-100"
            )}
            aria-label="Scroll left"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={cn(
              "flex h-7.5 w-7.5 items-center justify-center rounded-full border border-white/20 bg-gradient-to-b from-white/[0.18] via-white/[0.08] to-white/[0.03] text-white transition-all duration-200 cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] backdrop-blur-md",
              "hover:from-white/[0.28] hover:to-white/[0.10] hover:border-white/35 active:scale-95",
              "disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:scale-100"
            )}
            aria-label="Scroll right"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Horizontally Scrollable Row */}
      <div
        ref={scrollRef}
        className={cn(
          "scrollbar-hide flex overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth",
          isNumbered
            ? "gap-6 sm:gap-8 md:gap-9 pl-7 sm:pl-9 md:pl-11"
            : "gap-4"
        )}
      >
        {children}
      </div>
    </section>
  );
}
