"use client";

import {
  useState,
  useEffect,
  useTransition,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { Tabs } from "@/components/ui/tabs";
import { ContentCard } from "@/components/media/content-card";
import { CardSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
import { StarfieldBackground } from "@/components/layout/starfield-background";
import { STREAMING_PLATFORMS } from "@/components/media/streaming-platforms";
import { cn } from "@/lib/utils";
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
  "Oppenheimer",
  "Fallout",
];

interface GenreCategory {
  name: string;
  query: string;
  subtitle: string;
  gradient: string;
  borderHover: string;
  icon: (className: string) => React.ReactNode;
}

const CURATED_GENRES: GenreCategory[] = [
  {
    name: "Action & Adventure",
    query: "Action",
    subtitle: "High-octane adrenaline & blockbusters",
    gradient: "from-red-600/20 via-orange-600/10 to-transparent",
    borderHover: "group-hover:border-red-500/40",
    icon: (cls) => (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    name: "Sci-Fi & Cyberpunk",
    query: "Sci-Fi",
    subtitle: "Future worlds, space & alternate realities",
    gradient: "from-cyan-600/20 via-blue-600/10 to-transparent",
    borderHover: "group-hover:border-cyan-500/40",
    icon: (cls) => (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
  },
  {
    name: "Crime & Thriller",
    query: "Thriller",
    subtitle: "Edge-of-your-seat suspense & twists",
    gradient: "from-amber-600/20 via-yellow-600/10 to-transparent",
    borderHover: "group-hover:border-amber-500/40",
    icon: (cls) => (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  {
    name: "Animation & Anime",
    query: "Animation",
    subtitle: "Stunning visuals & animated classics",
    gradient: "from-pink-600/20 via-rose-600/10 to-transparent",
    borderHover: "group-hover:border-pink-500/40",
    icon: (cls) => (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
  },
  {
    name: "Comedy & Sitcoms",
    query: "Comedy",
    subtitle: "Feel-good laughs & witty satires",
    gradient: "from-emerald-600/20 via-teal-600/10 to-transparent",
    borderHover: "group-hover:border-emerald-500/40",
    icon: (cls) => (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    name: "Horror & Suspense",
    query: "Horror",
    subtitle: "Dark tales, psychological dread & frights",
    gradient: "from-purple-600/20 via-violet-600/10 to-transparent",
    borderHover: "group-hover:border-purple-500/40",
    icon: (cls) => (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  },
  {
    name: "Drama & Prestige",
    query: "Drama",
    subtitle: "Critically acclaimed character journeys",
    gradient: "from-indigo-600/20 via-blue-600/10 to-transparent",
    borderHover: "group-hover:border-indigo-500/40",
    icon: (cls) => (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
      </svg>
    ),
  },
  {
    name: "Documentary & Truth",
    query: "Documentary",
    subtitle: "Real stories, history & natural wonders",
    gradient: "from-sky-600/20 via-teal-600/10 to-transparent",
    borderHover: "group-hover:border-sky-500/40",
    icon: (cls) => (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const SORT_OPTIONS = [
  { value: "default", label: "TMDB Relevance" },
  { value: "rating", label: "Highest Rated (★)" },
  { value: "year_desc", label: "Newest First" },
  { value: "year_asc", label: "Oldest First" },
  { value: "title", label: "Title (A to Z)" },
];

const LOCAL_STORAGE_RECENT_KEY = "streamvault_recent_searches";

export interface SearchClientProps {
  initialTrending?: MediaItem[];
}

export function SearchClient({ initialTrending = [] }: SearchClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryFromUrl = searchParams.get("q") || "";
  const providerFromUrl = searchParams.get("provider") || "";
  const providerNameFromUrl = searchParams.get("name") || "";
  const typeFromUrl = searchParams.get("type") || "all";
  const pageFromUrl = parseInt(searchParams.get("page") || "1", 10);

  const [inputQuery, setInputQuery] = useState(queryFromUrl);
  const [data, setData] = useState<PaginatedResults<MediaItem> | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isPending, startTransition] = useTransition();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // In-result UI Controls
  const [viewMode, setViewMode] = useState<"grid" | "detailed">("grid");
  const [sortBy, setSortBy] = useState<string>("default");
  const [selectedGenreFilter, setSelectedGenreFilter] = useState<string>("all");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_RECENT_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          queueMicrotask(() => {
            setRecentSearches(parsed.slice(0, 8));
          });
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const saveRecentSearch = useCallback((term: string) => {
    const clean = term.trim();
    if (!clean) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== clean.toLowerCase());
      const updated = [clean, ...filtered].slice(0, 8);
      try {
        localStorage.setItem(LOCAL_STORAGE_RECENT_KEY, JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  }, []);

  const removeRecentSearch = useCallback((term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches((prev) => {
      const updated = prev.filter((item) => item !== term);
      try {
        localStorage.setItem(LOCAL_STORAGE_RECENT_KEY, JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  }, []);

  const clearAllRecentSearches = useCallback(() => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(LOCAL_STORAGE_RECENT_KEY);
    } catch {
      // Ignore
    }
  }, []);

  // Global keyboard shortcut '/' to focus search input
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  // Adjust input query state during render when URL query changes (e.g. browser back/forward, direct links)
  const [prevQueryFromUrl, setPrevQueryFromUrl] = useState(queryFromUrl);
  if (queryFromUrl !== prevQueryFromUrl) {
    setPrevQueryFromUrl(queryFromUrl);
    setInputQuery(queryFromUrl);
  }

  // Execute search whenever query, provider, type, or page in URL changes
  useEffect(() => {
    let cancelled = false;
    const trimmed = queryFromUrl.trim();

    if (!trimmed && !providerFromUrl) {
      startTransition(() => {
        setData(null);
        setHasError(false);
        setSelectedGenreFilter("all");
      });
      return;
    }

    startTransition(async () => {
      try {
        const fetchUrl = providerFromUrl
          ? `/api/metadata/search?provider=${encodeURIComponent(providerFromUrl)}&type=${typeFromUrl}&page=${pageFromUrl}`
          : `/api/metadata/search?q=${encodeURIComponent(trimmed)}&type=${typeFromUrl}&page=${pageFromUrl}`;

        const res = await fetch(fetchUrl);

        if (!res.ok) throw new Error("Search request failed");
        const json: PaginatedResults<MediaItem> = await res.json();

        if (!cancelled) {
          setData(json);
          setHasError(false);
          setSelectedGenreFilter("all"); // Reset genre filter when query changes
          if (trimmed) {
            saveRecentSearch(trimmed);
          }
        }
      } catch (err) {
        console.error("[Search] Fetch error:", (err as Error).message);
        if (!cancelled) setHasError(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [queryFromUrl, providerFromUrl, typeFromUrl, pageFromUrl, saveRecentSearch]);

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
      if (inputQuery.trim()) {
        saveRecentSearch(inputQuery.trim());
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setInputQuery("");
      updateQueryInUrl("");
    }
  };

  const handleClear = () => {
    setInputQuery("");
    updateQueryInUrl("");
    searchInputRef.current?.focus();
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
    const maxPage = data ? Math.min(data.totalPages, 500) : 500;
    const clamped = Math.max(1, Math.min(newPage, maxPage));
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(clamped));
    router.replace(`/search?${params.toString()}`, { scroll: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSuggestionClick = (term: string) => {
    setInputQuery(term);
    updateQueryInUrl(term);
    saveRecentSearch(term);
  };

  const handlePlatformClick = (platform: (typeof STREAMING_PLATFORMS)[0]) => {
    const params = new URLSearchParams();
    params.set("provider", String(platform.providerId));
    params.set("name", platform.name);
    if (typeFromUrl !== "all") params.set("type", typeFromUrl);
    router.replace(`/search?${params.toString()}`, { scroll: false });
  };

  // Derive distinct genres present in current search results
  const availableResultGenres = useMemo(() => {
    if (!data?.results || data.results.length === 0) return [];
    const genreMap = new Map<string, number>();
    for (const item of data.results) {
      if (item.genres && Array.isArray(item.genres)) {
        for (const g of item.genres) {
          if (g) {
            genreMap.set(g, (genreMap.get(g) || 0) + 1);
          }
        }
      }
    }
    return Array.from(genreMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [data]);

  // Filter and sort the retrieved results
  const processedResults = useMemo(() => {
    if (!data?.results) return [];

    let list = [...data.results];

    // Filter by genre if selected
    if (selectedGenreFilter !== "all") {
      list = list.filter((item) =>
        item.genres?.some(
          (g) => g.toLowerCase() === selectedGenreFilter.toLowerCase()
        )
      );
    }

    // Sort by criteria
    switch (sortBy) {
      case "rating":
        list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "year_desc":
        list.sort((a, b) => (b.releaseYear || 0) - (a.releaseYear || 0));
        break;
      case "year_asc":
        list.sort((a, b) => (a.releaseYear || 0) - (b.releaseYear || 0));
        break;
      case "title":
        list.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        // default TMDB relevance
        break;
    }

    return list;
  }, [data, selectedGenreFilter, sortBy]);

  const isSearching = Boolean(queryFromUrl.trim() || providerFromUrl);

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      {/* Cosmic Parallax Starfield Background (uiverse.io/jaykdoe/tasty-dragon-12) */}
      <StarfieldBackground />

      {/* Ambient Top Glow Effect */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-white/[0.08] via-white/[0.02] to-transparent blur-3xl rounded-full select-none z-10"
      />

      <Container className="relative z-10 pt-24 sm:pt-28 pb-20">
        {/* Header & Search Control Hub */}
        <div className="max-w-3xl mx-auto mb-10 text-center space-y-5">

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Find What to Watch
          </h1>
          <p className="text-sm sm:text-base text-gray-400 max-w-xl mx-auto leading-relaxed">
            Search across thousands of blockbusters, series, and streaming platforms powered by live metadata.
          </p>

          {/* Search Input Box */}
          <div className="relative pt-2 group">
            <div className="relative flex items-center shadow-2xl rounded-2xl">
              <Input
                ref={searchInputRef}
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onClear={handleClear}
                placeholder="Type a title, actor, or genre (e.g. Inception, Breaking Bad, Sci-Fi)..."
                aria-label="Search movies and TV shows"
                className="h-14 sm:h-16 pl-13 pr-24 rounded-2xl bg-zinc-900/80 backdrop-blur-xl border-white/15 focus:border-white/40 focus:ring-4 focus:ring-white/10 text-base sm:text-lg shadow-inner placeholder:text-gray-500"
                leftIcon={
                  <svg
                    className="h-5 w-5 text-gray-400 group-focus-within:text-white transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                }
                rightIcon={
                  <div className="flex items-center gap-2">
                    {isPending ? (
                      <svg
                        className="h-5 w-5 animate-spin text-white"
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
                    ) : (
                      <kbd className="hidden sm:inline-flex items-center justify-center h-6 px-2 rounded-md bg-white/10 border border-white/15 text-[11px] font-mono text-gray-300 select-none shadow-sm">
                        /
                      </kbd>
                    )}
                  </div>
                }
              />
            </div>
          </div>

          {/* Media Type Tabs Switcher */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <Tabs
              tabs={SEARCH_TABS.map((t) => ({
                ...t,
                badge:
                  t.id === typeFromUrl && data?.totalResults !== undefined
                    ? data.totalResults
                    : undefined,
              }))}
              activeTab={typeFromUrl}
              onChange={handleTypeChange}
              size="md"
            />
          </div>

          {/* Active Streaming Platform Filter Chip */}
          {providerFromUrl && (
            <div className="flex items-center justify-center pt-1 animate-in fade-in duration-200">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-white shadow-lg backdrop-blur-md">
                <span className="flex h-2 w-2 rounded-full bg-white animate-pulse" />
                <span>
                  Filtering by{" "}
                  <strong className="text-white">
                    {providerNameFromUrl || "Platform"}
                  </strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.delete("provider");
                    params.delete("name");
                    params.delete("page");
                    router.replace(
                      params.toString() ? `/search?${params.toString()}` : "/search"
                    );
                  }}
                  className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-white/90 hover:bg-white hover:text-black transition-colors cursor-pointer text-[10px]"
                  aria-label="Clear streaming platform filter"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
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
          <div className="space-y-6">
            <div className="h-6 w-48 bg-white/10 rounded-lg animate-pulse" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 24 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {!isPending && hasError && (
          <ErrorState
            title="Search Service Temporarily Unavailable"
            message="Could not retrieve results. Please verify your connection or try another keyword."
            onRetry={() => {
              const params = new URLSearchParams(searchParams.toString());
              router.replace(`/search?${params.toString()}`);
            }}
          />
        )}

        {/* ACTIVE SEARCH RESULTS SECTION */}
        {!isPending && !hasError && data && data.results.length > 0 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Results Filter & Toolbar Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900/60 border border-white/[0.08] backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-8 w-8 rounded-xl bg-white/10 text-white">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">
                    {providerFromUrl ? (
                      <>
                        Showing{" "}
                        <span className="text-white font-bold">
                          {data.totalResults}
                        </span>{" "}
                        titles on{" "}
                        <span className="text-white font-bold">
                          {providerNameFromUrl || "Platform"}
                        </span>
                        {queryFromUrl ? ` matching "${queryFromUrl}"` : ""}
                      </>
                    ) : (
                      <>
                        Found{" "}
                        <span className="text-white font-bold">
                          {data.totalResults.toLocaleString()}
                        </span>{" "}
                        titles for &ldquo;
                        <span className="text-white">{queryFromUrl}</span>
                        &rdquo;
                      </>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">
                    Page {data.page} of {Math.min(data.totalPages, 500).toLocaleString()} • Live catalog index
                  </div>
                </div>
              </div>

              {/* Toolbar: Sort & View Toggle */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                {/* Mini Top Pager for instant flipping */}
                {data.totalPages > 1 && (
                  <div className="hidden sm:inline-flex items-center gap-1 rounded-xl bg-white/[0.06] p-1 border border-white/10 text-xs">
                    <button
                      type="button"
                      disabled={pageFromUrl <= 1}
                      onClick={() => handlePageChange(pageFromUrl - 1)}
                      title="Previous Page"
                      aria-label="Previous Page"
                      className="p-1 rounded-lg text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 transition-colors cursor-pointer disabled:cursor-not-allowed"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <span className="px-2 text-gray-300 font-medium whitespace-nowrap text-[11px]">
                      {data.page} / {Math.min(data.totalPages, 500)}
                    </span>
                    <button
                      type="button"
                      disabled={pageFromUrl >= Math.min(data.totalPages, 500)}
                      onClick={() => handlePageChange(pageFromUrl + 1)}
                      title="Next Page"
                      aria-label="Next Page"
                      className="p-1 rounded-lg text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 transition-colors cursor-pointer disabled:cursor-not-allowed"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Sort Selector */}
                <div className="w-44 sm:w-48">
                  <Select
                    options={SORT_OPTIONS}
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    aria-label="Sort search results"
                    className="h-9 py-1 text-xs rounded-xl bg-white/[0.06] border-white/10"
                  />
                </div>

                {/* View Mode Toggle */}
                <div className="inline-flex rounded-xl bg-white/[0.06] p-1 border border-white/10">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    title="Grid View"
                    aria-label="Grid View"
                    className={cn(
                      "p-1.5 rounded-lg transition-colors cursor-pointer",
                      viewMode === "grid"
                        ? "bg-white text-black shadow-sm"
                        : "text-gray-400 hover:text-white"
                    )}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("detailed")}
                    title="Detailed View"
                    aria-label="Detailed View"
                    className={cn(
                      "p-1.5 rounded-lg transition-colors cursor-pointer",
                      viewMode === "detailed"
                        ? "bg-white text-black shadow-sm"
                        : "text-gray-400 hover:text-white"
                    )}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* In-Result Genre Filter Chips */}
            {availableResultGenres.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide pt-1">
                <span className="text-xs font-semibold text-gray-400 shrink-0 uppercase tracking-wider pl-1">
                  Genre:
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedGenreFilter("all")}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer",
                    selectedGenreFilter === "all"
                      ? "bg-white text-black font-semibold shadow-sm"
                      : "bg-white/[0.06] text-gray-300 hover:bg-white/[0.12] hover:text-white border border-white/[0.08]"
                  )}
                >
                  All ({data.results.length})
                </button>
                {availableResultGenres.map(({ name, count }) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setSelectedGenreFilter(name)}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer",
                      selectedGenreFilter.toLowerCase() === name.toLowerCase()
                        ? "bg-white text-black font-semibold shadow-sm"
                        : "bg-white/[0.06] text-gray-300 hover:bg-white/[0.12] hover:text-white border border-white/[0.08]"
                    )}
                  >
                    {name} ({count})
                  </button>
                ))}
              </div>
            )}

            {/* Content Display: Grid vs Detailed View */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {processedResults.map((item) => (
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
            ) : (
              /* Detailed List View */
              <div className="space-y-4">
                {processedResults.map((item) => {
                  const detailHref =
                    item.contentType === "movie"
                      ? `/movie/${item.id}`
                      : `/tv/${item.id}`;
                  const watchHref =
                    item.contentType === "movie"
                      ? `/watch/${item.id}?type=movie`
                      : `/watch/${item.id}?type=tv&season=1&episode=1`;

                  return (
                    <div
                      key={`${item.contentType}-${item.id}`}
                      className="group relative flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-5 rounded-2xl bg-zinc-900/60 border border-white/[0.08] hover:border-white/25 hover:bg-zinc-900/90 transition-all duration-300"
                    >
                      {/* Left: Poster */}
                      <Link
                        href={detailHref}
                        className="relative aspect-[2/3] w-28 sm:w-36 shrink-0 rounded-xl overflow-hidden bg-zinc-950 border border-white/10 group-hover:border-white/30 transition-colors shadow-lg"
                      >
                        {item.posterUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.posterUrl}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-800 text-gray-500 text-xs p-2 text-center">
                            No Poster
                          </div>
                        )}
                        {item.quality && (
                          <span className="absolute top-2 left-2 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-md border border-white/10">
                            {item.quality}
                          </span>
                        )}
                      </Link>

                      {/* Right: Info, Synopsis & Actions */}
                      <div className="flex flex-col justify-between flex-1 min-w-0">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                              {item.contentType === "movie" ? "Movie" : "TV Series"}
                            </span>
                            {item.releaseYear && (
                              <span className="text-xs text-gray-400 font-medium">
                                {item.releaseYear}
                              </span>
                            )}
                            {item.rating > 0 && (
                              <div className="flex items-center gap-1 rounded-full bg-white/10 border border-white/15 px-2 py-0.5 text-[11px] font-semibold text-white">
                                <svg
                                  className="w-3 h-3 fill-amber-400 text-amber-400"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span>{item.rating.toFixed(1)}</span>
                                {item.voteCount ? (
                                  <span className="text-[10px] text-gray-400 font-normal">
                                    (
                                    {item.voteCount > 1000
                                      ? `${(item.voteCount / 1000).toFixed(1)}k`
                                      : item.voteCount}
                                    )
                                  </span>
                                ) : null}
                              </div>
                            )}
                          </div>

                          <Link href={detailHref}>
                            <h3 className="text-lg sm:text-xl font-bold text-white hover:text-gray-200 transition-colors line-clamp-1">
                              {item.title}
                            </h3>
                          </Link>

                          {/* Genre Pills */}
                          {item.genres && item.genres.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2.5">
                              {item.genres.slice(0, 4).map((g) => (
                                <span
                                  key={g}
                                  className="rounded-md bg-white/[0.05] border border-white/[0.08] px-2 py-0.5 text-[11px] text-gray-300"
                                >
                                  {g}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Synopsis */}
                          {item.overview && (
                            <p className="mt-3 text-xs sm:text-sm text-gray-400 line-clamp-2 sm:line-clamp-3 leading-relaxed">
                              {item.overview}
                            </p>
                          )}
                        </div>

                        {/* Action buttons footer */}
                        <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <Link
                              href={watchHref}
                              className="inline-flex items-center gap-2 rounded-xl bg-white text-black px-4 py-2 text-xs font-semibold hover:bg-gray-200 transition-colors shadow-sm"
                            >
                              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                              Watch Now
                            </Link>
                            <Link
                              href={detailHref}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white px-3.5 py-2 text-xs font-medium transition-colors border border-white/10"
                            >
                              Details
                            </Link>
                          </div>

                          <span className="text-[11px] text-gray-500 hidden sm:inline">
                            Free streaming in HD / 4K
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {data.totalPages > 1 && (
              <div className="pt-8 border-t border-white/[0.08]">
                <Pagination
                  currentPage={data.page}
                  totalPages={data.totalPages}
                  totalResults={data.totalResults}
                  pageSize={24}
                  onPageChange={handlePageChange}
                  showJumpToPage={true}
                  showSummary={true}
                />
              </div>
            )}
          </div>
        )}

        {/* Empty Result State with Curated Suggestions */}
        {!isPending && !hasError && data && data.results.length === 0 && isSearching && (
          <div className="space-y-12">
            <EmptyState
              type="search"
              title={`No titles found for "${queryFromUrl || providerNameFromUrl}"`}
              description="We couldn't find any direct matches. Try checking your spelling, using broader keywords, or exploring the trending recommendations below."
            />

            {/* Trending Fallback Grid when search yields no matches */}
            {initialTrending.length > 0 && (
              <div className="space-y-4 pt-6 border-t border-white/[0.08]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Popular Trending Alternatives
                    </h3>
                    <p className="text-xs text-gray-400">
                      Top streamed titles trending across the platform
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {initialTrending.slice(0, 6).map((item) => (
                    <ContentCard
                      key={`alt-${item.contentType}-${item.id}`}
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
              </div>
            )}
          </div>
        )}

        {/* DEFAULT DISCOVERY STATE (When no search query is active) */}
        {!isPending && !hasError && !isSearching && (
          <div className="space-y-14 animate-in fade-in duration-300">
            {/* 1. Recent Searches (If present) */}
            {recentSearches.length > 0 && (
              <div className="p-5 rounded-2xl bg-zinc-900/40 border border-white/[0.08] backdrop-blur-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-300">
                    <svg
                      className="h-4 w-4 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>Recent Searches</span>
                  </div>
                  <button
                    type="button"
                    onClick={clearAllRecentSearches}
                    className="text-xs text-gray-500 hover:text-white transition-colors cursor-pointer"
                  >
                    Clear history
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((term) => (
                    <div
                      key={term}
                      onClick={() => handleSuggestionClick(term)}
                      className="group inline-flex items-center gap-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] px-3.5 py-1.5 text-xs text-gray-200 hover:text-white transition-all cursor-pointer"
                    >
                      <span>{term}</span>
                      <button
                        type="button"
                        onClick={(e) => removeRecentSearch(term, e)}
                        className="text-gray-500 group-hover:text-gray-300 hover:!text-white transition-colors"
                        aria-label={`Remove ${term}`}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Browse by Streaming Platform Hub */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-white">
                    Browse by Streaming Service
                  </h2>
                  <p className="text-xs text-gray-400">
                    Filter catalog titles available on your favorite platform
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                {STREAMING_PLATFORMS.slice(0, 8).map((platform) => (
                  <button
                    key={platform.id}
                    type="button"
                    onClick={() => handlePlatformClick(platform)}
                    className="group relative flex flex-col items-center justify-center p-3.5 rounded-2xl bg-zinc-900/60 border border-white/[0.08] hover:border-white/30 hover:bg-zinc-800/80 hover:-translate-y-1 transition-all duration-200 cursor-pointer shadow-lg"
                  >
                    <div className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-xl overflow-hidden mb-2 shadow-inner border border-white/10 bg-black/40 p-1 flex items-center justify-center">
                      <Image
                        src={platform.logoUrl}
                        alt={platform.name}
                        width={48}
                        height={48}
                        className="object-contain rounded-lg"
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-300 group-hover:text-white transition-colors text-center line-clamp-1">
                      {platform.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Curated Genre Collections */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-white">
                    Explore Curated Genres
                  </h2>
                  <p className="text-xs text-gray-400">
                    Discover handpicked collections organized by atmosphere and mood
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {CURATED_GENRES.map((genre) => (
                  <button
                    key={genre.name}
                    type="button"
                    onClick={() => handleSuggestionClick(genre.query)}
                    className={cn(
                      "group relative text-left p-4 sm:p-5 rounded-2xl border border-white/[0.08] bg-zinc-900/50 hover:bg-zinc-800/60 transition-all duration-300 overflow-hidden cursor-pointer",
                      genre.borderHover
                    )}
                  >
                    {/* Gradient backdrop */}
                    <div
                      className={cn(
                        "absolute inset-0 bg-gradient-to-br opacity-40 group-hover:opacity-80 transition-opacity duration-300",
                        genre.gradient
                      )}
                    />

                    <div className="relative z-10 flex flex-col h-full justify-between space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="p-2 rounded-xl bg-white/[0.08] border border-white/10 text-white">
                          {genre.icon("h-5 w-5")}
                        </div>
                        <span className="text-xs text-gray-400 group-hover:text-white transition-colors">
                          Explore →
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-white group-hover:text-white transition-colors">
                          {genre.name}
                        </h3>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-1 leading-relaxed">
                          {genre.subtitle}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Popular Search Keywords */}
            <div className="p-5 rounded-2xl bg-zinc-900/40 border border-white/[0.08] backdrop-blur-sm">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-300 mb-3">
                <svg
                  className="h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
                <span>Popular Search Terms</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_SEARCHES.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handleSuggestionClick(term)}
                    className="rounded-full bg-white/[0.05] hover:bg-white/[0.12] border border-white/[0.08] px-3.5 py-1.5 text-xs text-gray-300 hover:text-white transition-all cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Trending Searches Spotlight Grid */}
            {initialTrending.length > 0 && (
              <div className="space-y-5 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                      <span>Trending Titles Right Now</span>
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white">
                        LIVE
                      </span>
                    </h2>
                    <p className="text-xs text-gray-400">
                      Most popular movies and series streamed this week
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {initialTrending.map((item, idx) => (
                    <ContentCard
                      key={`trending-${item.contentType}-${item.id}`}
                      id={item.id}
                      title={item.title}
                      posterUrl={item.posterUrl}
                      contentType={item.contentType}
                      releaseYear={item.releaseYear}
                      rating={item.rating}
                      quality={item.quality}
                      rank={idx < 5 ? idx + 1 : undefined}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Container>
    </div>
  );
}
