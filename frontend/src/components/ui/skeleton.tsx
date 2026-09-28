import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type SkeletonProps = HTMLAttributes<HTMLDivElement>;

/**
 * Base animated skeleton loader with shimmer pulse.
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse rounded-lg bg-white/[0.07]",
        className
      )}
      {...props}
    />
  );
}

/**
 * Skeleton placeholder for a 2:3 Content Card.
 */
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col space-y-2.5 w-full", className)}>
      <Skeleton className="aspect-[2/3] w-full rounded-xl" />
      <Skeleton className="h-4 w-4/5 rounded-md" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-3 w-10 rounded" />
        <Skeleton className="h-3 w-12 rounded" />
      </div>
    </div>
  );
}

/**
 * Skeleton placeholder for a full-width cinematic Hero banner.
 */
export function HeroSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative flex min-h-[65vh] w-full flex-col justify-end p-6 sm:p-12 lg:p-16 overflow-hidden rounded-3xl bg-white/[0.03]",
        className
      )}
    >
      <div className="max-w-2xl space-y-4">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-md" />
          <Skeleton className="h-5 w-12 rounded-md" />
          <Skeleton className="h-5 w-14 rounded-md" />
        </div>
        <Skeleton className="h-10 sm:h-14 w-4/5 rounded-xl" />
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-3/4 rounded-md" />
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-12 w-36 rounded-xl" />
          <Skeleton className="h-12 w-36 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton placeholder for a horizontal Content Row with multiple cards.
 */
export function RowSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-40 rounded-lg" />
        <Skeleton className="h-4 w-16 rounded" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
