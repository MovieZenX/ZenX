import { Container } from "@/components/ui/container";
import { Skeleton, RowSkeleton } from "@/components/ui/skeleton";

/**
 * Loading skeleton for the Movie Details page preventing layout shifts.
 */
export default function MovieDetailLoading() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Backdrop & Details Header Skeleton */}
      <div className="relative min-h-[60vh] sm:min-h-[72vh] w-full flex flex-col justify-end overflow-hidden pt-24 sm:pt-32 bg-white/[0.02]">
        <Container className="pb-12 sm:pb-16">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Poster Skeleton */}
            <Skeleton className="w-48 sm:w-56 lg:w-64 aspect-[2/3] rounded-2xl shrink-0 hidden sm:block" />

            <div className="flex-1 space-y-4 max-w-3xl w-full">
              {/* Badges Skeleton */}
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16 rounded-md" />
                <Skeleton className="h-6 w-14 rounded-md" />
                <Skeleton className="h-6 w-12 rounded-md" />
                <Skeleton className="h-6 w-20 rounded-md" />
              </div>

              {/* Title Skeleton */}
              <Skeleton className="h-10 sm:h-14 w-3/4 rounded-xl" />
              <Skeleton className="h-4 w-1/2 rounded-md" />

              {/* Genres Skeleton */}
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16 rounded-md" />
                <Skeleton className="h-5 w-20 rounded-md" />
                <Skeleton className="h-5 w-16 rounded-md" />
              </div>

              {/* Overview Skeleton */}
              <div className="space-y-2 pt-2">
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-5/6 rounded" />
                <Skeleton className="h-4 w-3/4 rounded" />
              </div>

              {/* Buttons Skeleton */}
              <div className="flex gap-3 pt-3">
                <Skeleton className="h-12 w-36 rounded-xl" />
                <Skeleton className="h-12 w-36 rounded-xl" />
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Main Body Skeleton */}
      <Container className="space-y-12 pb-20 pt-8">
        {/* Cast Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-7 w-32 rounded-lg" />
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-24 sm:w-28 shrink-0 flex flex-col items-center space-y-2">
                <Skeleton className="h-20 w-20 sm:h-24 sm:w-24 rounded-full" />
                <Skeleton className="h-3 w-16 rounded" />
                <Skeleton className="h-2 w-12 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Similar Movies Row Skeleton */}
        <RowSkeleton count={5} />
      </Container>
    </div>
  );
}
