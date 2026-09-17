import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchClient } from "./search-client";
import { Container } from "@/components/ui/container";
import { CardSkeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Search Movies & TV Series — StreamVault",
  description:
    "Search across thousands of blockbusters, critically acclaimed series, and classic cinema in high definition on StreamVault.",
  openGraph: {
    title: "Search Movies & TV Series — StreamVault",
    description:
      "Search across thousands of blockbusters, critically acclaimed series, and classic cinema in high definition.",
    type: "website",
  },
};

/**
 * Production Search Page supporting query parameter hydration,
 * debounced requests, media type filtering, and pagination.
 */
export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <Container className="pt-24 sm:pt-28 pb-16 text-center">
          <div className="h-8 w-48 mx-auto bg-white/10 rounded-lg animate-pulse mb-8" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </Container>
      }
    >
      <SearchClient />
    </Suspense>
  );
}
