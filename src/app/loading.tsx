import { Container } from "@/components/ui/container";
import { HeroSkeleton, RowSkeleton } from "@/components/ui/skeleton";

/**
 * Cinematic loading skeleton displayed during initial render or streaming transitions.
 */
export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Featured Hero Skeleton */}
      <HeroSkeleton className="h-[100dvh] min-h-[580px] rounded-none" />

      {/* Content Rows Skeletons */}
      <Container className="space-y-10 sm:space-y-14 pb-20 pt-8">
        <RowSkeleton count={6} />
        <RowSkeleton count={6} />
        <RowSkeleton count={6} />
      </Container>
    </div>
  );
}
