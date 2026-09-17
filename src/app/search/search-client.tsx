"use client";

import { useState, useEffect, useTransition, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { Tabs } from "@/components/ui/tabs";
import { ContentCard } from "@/components/media/content-card";
import { CardSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";
import type { MediaItem, PaginatedResults } from "@/types/metadata";

const SEARCH_TABS = [
  { id: "all", label: "All Titles" },
  { id: "movie", label: "Movies" },
  { id: "tv", label: "TV Shows" },
];

const SUGGESTED_SEARCHES = [
  "Inception",
  "Breaking Bad",
  "Interstellar",
  "Stranger Things",
  "The Dark Knight",
  "Game of Thrones",
  "Avengers",
  "Dune",
];

const QUICK_GENRES = [
  { name: "Action", query: "Action" },
  { name: "Sci-Fi", query: "Sci-Fi" },
  { name: "Drama", query: "Drama" },
  { name: "Animation", query: "Animation" },
  { name: "Comedy", query: "Comedy" },
  { name: "Thriller", query: "Thriller" },
];

export function SearchClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryFromUrl = searchParams.get("q") || "";
  const typeFromUrl = searchParams.get("type") || "all";
  const pageFromUrl = parseInt(searchParams.get("page") || "1", 10);

  const [inputQuery, setInputQuery] = useState(queryFromUrl);
  const [data, setData] = useState<PaginatedResults<MediaItem> | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isPending, startTransition] = useTransition();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Adjust input query state during render when URL query changes (e.g. browser back/forward, direct links)
  const [prevQueryFromUrl, setPrevQueryFromUrl] = useState(queryFromUrl);
  if (queryFromUrl !== prevQueryFromUrl) {
    setPrevQueryFromUrl(queryFromUrl);
    setInputQuery(queryFromUrl);
  }

  // Execute search whenever query, type, or page in URL changes
  useEffect(() => {
    let cancelled = false;
    const trimmed = queryFromUrl.trim();

    if (!trimmed) {
      startTransition(() => {
        setData(null);
        setHasError(false);
      });
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch(
          `/api/metadata/search?q=${encodeURIComponent(trimmed)}&type=${typeFromUrl}&page=${pageFromUrl}`
        );

        if (!res.ok) throw new Error("Search request failed");
        const json: PaginatedResults<MediaItem> = await res.json();

        if (!cancelled) {
          setData(json);
          setHasError(false);
        }
      } catch (err) {
        console.error("[Search] Fetch error:", (err as Error).message);
        if (!cancelled) setHasError(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [queryFromUrl, typeFromUrl, pageFromUrl]);

  // Push new query into URL and clear any pending debounce
  const updateQueryInUrl = useCallback(
    (newQuery: string, newType = typeFromUrl) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      const trimmed = newQuery.trim();
      const params = new URLSearchParams();

      if (trimmed) params.set("q", trimmed);
      if (newType !== "all") params.set("type", newType);

      const newUrl = params.toString() ? `/search?${params.toString()}` : "/search";
      router.replace(newUrl, { scroll: false });
    },
    [router, typeFromUrl]
  );

  // Debounced sync from input typing to URL
  useEffect(() => {
    const trimmed = inputQuery.trim();
    if (trimmed === queryFromUrl) return;

    debounceTimerRef.current = setTimeout(() => {
      updateQueryInUrl(trimmed);
    }, 350);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [inputQuery, queryFromUrl, updateQueryInUrl]);

  // Handle immediate form submission on Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      updateQueryInUrl(inputQuery);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setInputQuery("");
      updateQueryInUrl("");
    }
  };

  const handleClear = () => {
    setInputQuery("");
    updateQueryInUrl("");
  };

  const handleTypeChange = (typeId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (typeId === "all") {
      params.delete("type");
    } else {
      params.set("type", typeId);
    }
    params.delete("page");
    const newUrl = params.toString() ? `/search?${params.toString()}` : "/search";
    router.replace(newUrl, { scroll: false });
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.replace(`/search?${params.toString()}`, { scroll: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSuggestionClick = (term: string) => {
    setInputQuery(term);
    updateQueryInUrl(term);
  };

  return (
    <Container className="pt-24 sm:pt-28 pb-16">
      {/* Header & Search Bar Section */}
      <div className="max-w-2xl mx-auto mb-8 space-y-4 text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Search Titles
        </h1>
        <p className="text-sm sm:text-base text-gray-400">
          Find movies, TV series, and more powered by live metadata.
        </p>

        {/* Search Input with Clear & Active Loading Indicator */}
        <div className="pt-2">
          <Input
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onClear={handleClear}
            placeholder="Type a title, actor, or genre (e.g. Inception, Breaking Bad)..."
            aria-label="Search movies and TV shows"
            leftIcon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            }
            rightIcon={
              isPending ? (
                <svg
                  className="h-4 w-4 animate-spin text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
              ) : undefined
            }
          />
        </div>

        {/* Media Type Filter Tabs */}
        <div className="flex justify-center pt-2">
          <Tabs
            tabs={SEARCH_TABS}
            activeTab={typeFromUrl}
            onChange={handleTypeChange}
            size="sm"
          />
        </div>
      </div>

      {/* Screen Reader Live Status Region */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {isPending
          ? "Searching titles..."
          : data
          ? `Found ${data.totalResults} titles on page ${data.page} of ${data.totalPages}`
          : ""}
      </div>

      {/* Loading Skeleton Grid */}
      {isPending && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error State */}
      {!isPending && hasError && (
        <ErrorState
          title="Search Failed"
          message="Could not retrieve search results. Please check your connection and try again."
          onRetry={() => {
            const params = new URLSearchParams(searchParams.toString());
            router.replace(`/search?${params.toString()}`);
          }}
        />
      )}

      {/* Results Grid */}
      {!isPending && !hasError && data && data.results.length > 0 && (
        <div className="space-y-8">
          <div className="flex items-center justify-between text-xs text-gray-400 border-b border-white/[0.08] pb-3">
            <span>
              Found <strong className="text-white">{data.totalResults}</strong> titles for &ldquo;
              {queryFromUrl}&rdquo;
            </span>
            <span>
              Page <strong className="text-white">{data.page}</strong> of {data.totalPages}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {data.results.map((item) => (
              <ContentCard
                key={`${item.contentType}-${item.id}`}
                id={item.id}
                title={item.title}
                posterUrl={item.posterUrl}
                contentType={item.contentType}
                releaseYear={item.releaseYear}
                rating={item.rating}
                quality={item.quality}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-6 border-t border-white/[0.08]">
              <Button
                variant="secondary"
                size="sm"
                disabled={pageFromUrl <= 1}
                onClick={() => handlePageChange(pageFromUrl - 1)}
                aria-label="Previous Page"
              >
                ← Previous
              </Button>

              <span className="text-xs text-gray-400 px-2 font-medium">
                Page <strong className="text-white">{data.page}</strong> of{" "}
                <strong className="text-white">{data.totalPages}</strong>
              </span>

              <Button
                variant="secondary"
                size="sm"
                disabled={pageFromUrl >= data.totalPages}
                onClick={() => handlePageChange(pageFromUrl + 1)}
                aria-label="Next Page"
              >
                Next →
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Empty Result State */}
      {!isPending && !hasError && data && data.results.length === 0 && queryFromUrl && (
        <EmptyState
          type="search"
          title={`No results found for "${queryFromUrl}"`}
          description="We couldn't find any matching titles. Check for typos or try searching with broader keywords or general genres."
        />
      )}

      {/* Default Discovery State when no query is present */}
      {!isPending && !hasError && (!data || !queryFromUrl) && (
        <div className="max-w-xl mx-auto space-y-8 pt-4">
          <EmptyState
            type="search"
            title="Search the Streaming Catalog"
            description="Start typing above to search across thousands of movies and TV series."
          />

          {/* Suggested Trending Titles */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 text-center">
              Popular Searches
            </h3>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTED_SEARCHES.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => handleSuggestionClick(term)}
                  className="rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] px-3.5 py-1.5 text-xs text-gray-300 hover:text-white transition-all duration-200 cursor-pointer"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Genre Explorations */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 text-center">
              Explore by Category
            </h3>
            <div className="flex flex-wrap justify-center gap-2">
              {QUICK_GENRES.map((g) => (
                <button
                  key={g.name}
                  type="button"
                  onClick={() => handleSuggestionClick(g.query)}
                  className="rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 px-3 py-1 text-xs font-medium text-gray-300 hover:text-white transition-all duration-200 cursor-pointer"
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}
