"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

export type PaginationItem = number | "dots-left" | "dots-right";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalResults?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  showJumpToPage?: boolean;
  showSummary?: boolean;
  className?: string;
  maxSupportedPages?: number;
}

/**
 * Calculates a stable 7-slot sliding window of page numbers with left and right ellipsis.
 */
export function getPaginationRange(
  currentPage: number,
  totalPages: number,
  siblingCount: number = 1,
  maxPages: number = 500
): PaginationItem[] {
  const total = Math.max(1, Math.min(totalPages, maxPages));
  const current = Math.max(1, Math.min(currentPage, total));

  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(current - siblingCount, 1);
  const rightSiblingIndex = Math.min(current + siblingCount, total);

  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < total - 1;

  if (!shouldShowLeftDots && shouldShowRightDots) {
    const leftItemCount = 3 + 2 * siblingCount;
    const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
    return [...leftRange, "dots-right", total];
  }

  if (shouldShowLeftDots && !shouldShowRightDots) {
    const rightItemCount = 3 + 2 * siblingCount;
    const rightRange = Array.from(
      { length: rightItemCount },
      (_, i) => total - rightItemCount + 1 + i
    );
    return [1, "dots-left", ...rightRange];
  }

  const middleRange = Array.from(
    { length: rightSiblingIndex - leftSiblingIndex + 1 },
    (_, i) => leftSiblingIndex + i
  );
  return [1, "dots-left", ...middleRange, "dots-right", total];
}

/**
 * Premium, glassmorphic cinema pagination component.
 * Includes first/prev/next/last chevrons, numbered pill buttons with glow effects,
 * results count summary, and direct jump-to-page input.
 */
export function Pagination({
  currentPage,
  totalPages,
  totalResults,
  pageSize = 24,
  onPageChange,
  showJumpToPage = true,
  showSummary = true,
  className,
  maxSupportedPages = 500,
}: PaginationProps) {
  const effectiveTotalPages = Math.max(1, Math.min(totalPages, maxSupportedPages));
  const [prevCurrentPage, setPrevCurrentPage] = useState(currentPage);
  const [jumpInput, setJumpInput] = useState<string>(String(currentPage));

  // Sync jump input during render when currentPage prop updates
  if (currentPage !== prevCurrentPage) {
    setPrevCurrentPage(currentPage);
    setJumpInput(String(currentPage));
  }

  if (effectiveTotalPages <= 1) {
    return null;
  }

  const paginationRange = getPaginationRange(
    currentPage,
    effectiveTotalPages,
    1,
    maxSupportedPages
  );

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(jumpInput, 10);
    if (Number.isInteger(parsed)) {
      const clamped = Math.max(1, Math.min(parsed, effectiveTotalPages));
      if (clamped !== currentPage) {
        onPageChange(clamped);
      }
    } else {
      setJumpInput(String(currentPage));
    }
  };

  // Result range calculation
  const fromIndex = totalResults
    ? Math.min((currentPage - 1) * pageSize + 1, totalResults)
    : (currentPage - 1) * pageSize + 1;
  const toIndex = totalResults
    ? Math.min(currentPage * pageSize, totalResults)
    : currentPage * pageSize;

  return (
    <div
      className={cn(
        "w-full rounded-2xl bg-zinc-950/80 backdrop-blur-md border border-white/[0.08] p-3 sm:p-4 flex flex-col md:flex-row items-center justify-between gap-4 select-none",
        className
      )}
      aria-label="Pagination Navigation"
    >
      {/* Left: Results Count Summary */}
      {showSummary && (
        <div className="text-xs text-gray-400 font-medium text-center md:text-left shrink-0 pl-2 sm:pl-3">
          {totalResults !== undefined && totalResults > 0 ? (
            <>
              Showing{" "}
              <span className="text-white font-semibold">
                {fromIndex.toLocaleString()}–{toIndex.toLocaleString()}
              </span>{" "}
              of{" "}
              <span className="text-white font-semibold">
                {totalResults.toLocaleString()}
              </span>{" "}
              titles
            </>
          ) : (
            <>
              Page <span className="text-white font-semibold">{currentPage}</span> of{" "}
              <span className="text-white font-semibold">
                {effectiveTotalPages.toLocaleString()}
              </span>
            </>
          )}
        </div>
      )}

      {/* Center: Pagination Button Pills */}
      <nav
        aria-label="Page navigation"
        className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-center"
      >
        {/* First Page Button */}
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(1)}
          aria-label="Go to first page"
          title="First page"
          className={cn(
            "hidden sm:flex h-8 sm:h-9 px-2 sm:px-2.5 rounded-xl text-xs font-medium items-center justify-center transition-all cursor-pointer touch-manipulation",
            currentPage <= 1
              ? "opacity-30 cursor-not-allowed text-gray-500 bg-white/[0.02] border border-transparent"
              : "text-gray-300 hover:text-white bg-white/[0.04] hover:bg-white/10 border border-white/10 hover:border-white/20 active:scale-95"
          )}
        >
          {/* Double left chevron */}
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
          <span className="hidden lg:inline ml-1">First</span>
        </button>

        {/* Previous Page Button */}
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Go to previous page"
          title="Previous page"
          className={cn(
            "h-8 sm:h-9 px-2.5 sm:px-3 rounded-xl text-xs font-medium flex items-center gap-1 transition-all cursor-pointer touch-manipulation",
            currentPage <= 1
              ? "opacity-30 cursor-not-allowed text-gray-500 bg-white/[0.02] border border-transparent"
              : "text-gray-300 hover:text-white bg-white/[0.04] hover:bg-white/10 border border-white/10 hover:border-white/20 active:scale-95"
          )}
        >
          {/* Single left chevron */}
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Page Number Pills */}
        {paginationRange.map((item, idx) => {
          if (typeof item === "string") {
            return (
              <span
                key={`${item}-${idx}`}
                className="w-7 sm:w-8 h-8 sm:h-9 flex items-center justify-center text-xs text-gray-500 font-bold select-none"
                aria-hidden="true"
              >
                •••
              </span>
            );
          }

          const isActive = item === currentPage;

          return (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              aria-current={isActive ? "page" : undefined}
              aria-label={`Page ${item}`}
              className={cn(
                "min-w-8 sm:min-w-9 h-8 sm:h-9 px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center cursor-pointer touch-manipulation",
                isActive
                  ? "bg-white text-black font-bold border border-white"
                  : "bg-white/[0.04] hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 hover:border-white/20 active:scale-95"
              )}
            >
              {item}
            </button>
          );
        })}

        {/* Next Page Button */}
        <button
          type="button"
          disabled={currentPage >= effectiveTotalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Go to next page"
          title="Next page"
          className={cn(
            "h-8 sm:h-9 px-2.5 sm:px-3 rounded-xl text-xs font-medium flex items-center gap-1 transition-all cursor-pointer touch-manipulation",
            currentPage >= effectiveTotalPages
              ? "opacity-30 cursor-not-allowed text-gray-500 bg-white/[0.02] border border-transparent"
              : "text-gray-300 hover:text-white bg-white/[0.04] hover:bg-white/10 border border-white/10 hover:border-white/20 active:scale-95"
          )}
        >
          <span className="hidden sm:inline">Next</span>
          {/* Single right chevron */}
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Last Page Button */}
        <button
          type="button"
          disabled={currentPage >= effectiveTotalPages}
          onClick={() => onPageChange(effectiveTotalPages)}
          aria-label="Go to last page"
          title="Last page"
          className={cn(
            "hidden sm:flex h-8 sm:h-9 px-2 sm:px-2.5 rounded-xl text-xs font-medium items-center justify-center transition-all cursor-pointer touch-manipulation",
            currentPage >= effectiveTotalPages
              ? "opacity-30 cursor-not-allowed text-gray-500 bg-white/[0.02] border border-transparent"
              : "text-gray-300 hover:text-white bg-white/[0.04] hover:bg-white/10 border border-white/10 hover:border-white/20 active:scale-95"
          )}
        >
          <span className="hidden lg:inline mr-1">Last</span>
          {/* Double right chevron */}
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </nav>

      {/* Right: Direct Page Jump Form */}
      {showJumpToPage && (
        <form
          onSubmit={handleJumpSubmit}
          className="flex items-center gap-1.5 shrink-0"
          aria-label="Direct page navigation"
        >
          <span className="text-xs text-gray-400 font-medium">Go to:</span>
          <input
            type="number"
            min={1}
            max={effectiveTotalPages}
            value={jumpInput}
            onChange={(e) => setJumpInput(e.target.value)}
            aria-label="Enter page number to jump to"
            className="w-14 h-8 text-center text-base sm:text-xs font-semibold rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-white/40 transition-all touch-manipulation [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="text-xs text-gray-500 font-medium">/ {effectiveTotalPages}</span>
          <button
            type="submit"
            className="h-8 px-3 rounded-xl text-xs font-medium bg-white/10 hover:bg-white/20 text-white border border-white/10 hover:border-white/25 active:scale-95 transition-all cursor-pointer touch-manipulation"
          >
            Go
          </button>
        </form>
      )}
    </div>
  );
}
