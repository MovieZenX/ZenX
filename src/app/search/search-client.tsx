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

  // Live autocomplete dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [liveSuggestions, setLiveSuggestions] = useState<MediaItem[]>([]);
  const [isLiveLoading, setIsLiveLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const liveFetchTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch instant autocomplete previews when typing (min 2 chars)
  useEffect(() => {
    const trimmed = inputQuery.trim();
    if (trimmed.length < 2) {
      return;
    }

    if (liveFetchTimerRef.current) {
      clearTimeout(liveFetchTimerRef.current);
    }

    liveFetchTimerRef.current = setTimeout(async () => {
      setIsLiveLoading(true);
      try {
        const typeParam = typeFromUrl !== "all" ? `&type=${typeFromUrl}` : "";
        const res = await fetch(
          `/api/metadata/search?q=${encodeURIComponent(trimmed)}${typeParam}&pageSize=5&page=1`
        );
        if (res.ok) {
          const json = await res.json();
          setLiveSuggestions(json.results?.slice(0, 5) || []);
        }
      } catch (err) {
        console.error("[Search] Autocomplete error:", err);
      } finally {
        setIsLiveLoading(false);
      }
    }, 200);

    return () => {
      if (liveFetchTimerRef.current) {
        clearTimeout(liveFetchTimerRef.current);
      }
    };
  }, [inputQuery, typeFromUrl]);

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

  const totalDropdownOptions =
    inputQuery.trim().length >= 2
      ? liveSuggestions.length + 1
      : 0;

  // Handle keyboard navigation & selection inside live suggestions or search form
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isDropdownOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        setIsDropdownOpen(true);
        return;
      }
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (totalDropdownOptions > 0) {
        setHighlightedIndex((prev) => (prev + 1) % totalDropdownOptions);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (totalDropdownOptions > 0) {
        setHighlightedIndex((prev) =>
          prev <= 0 ? totalDropdownOptions - 1 : prev - 1
        );
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (
        highlightedIndex >= 0 &&
        highlightedIndex < liveSuggestions.length
      ) {
        const selected = liveSuggestions[highlightedIndex];
        if (selected) {
          setIsDropdownOpen(false);
          saveRecentSearch(selected.title);
          router.push(`/watch/${selected.id}`);
          return;
        }
      }
      setIsDropdownOpen(false);
      updateQueryInUrl(inputQuery);
      if (inputQuery.trim()) {
        saveRecentSearch(inputQuery.trim());
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsDropdownOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const handleClear = () => {
    setInputQuery("");
    updateQueryInUrl("");
    setLiveSuggestions([]);
    setHighlightedIndex(-1);
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
    <div className="relative min-h-[calc(100vh-4rem)] overflow-x-clip">
      {/* Cosmic Parallax Starfield Background (uiverse.io/jaykdoe/tasty-dragon-12) */}
      <StarfieldBackground />

      {/* Ambient Top Glow Effect */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-white/[0.08] via-white/[0.02] to-transparent blur-3xl rounded-full select-none z-10"
      />

      <Container className="relative z-10 pt-20 sm:pt-28 pb-14 sm:pb-20">
        {/* Header & Search Control Hub */}
        <div className="max-w-3xl mx-auto mb-7 sm:mb-10 text-center space-y-3.5 sm:space-y-5">

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
            Find What to Watch
          </h1>
          <p className="text-xs sm:text-base text-gray-400 max-w-xl mx-auto leading-relaxed px-2 sm:px-0">
            Search across thousands of blockbusters, series, and streaming platforms powered by live metadata.
          </p>

          {/* Search Input Box with Live Suggestions Dropdown */}
          <div ref={searchContainerRef} className="relative pt-2 group z-30">
            <div className="relative flex items-center shadow-2xl rounded-2xl">
              <Input
                ref={searchInputRef}
                type="search"
                inputMode="search"
                enterKeyHint="search"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={true}
                value={inputQuery}
                onFocus={() => setIsDropdownOpen(true)}
                onChange={(e) => {
                  const val = e.target.value;
                  setInputQuery(val);
                  if (!isDropdownOpen) setIsDropdownOpen(true);
                  if (val.trim().length < 2) {
                    setLiveSuggestions([]);
                    setIsLiveLoading(false);
                    setHighlightedIndex(-1);
                  }
                }}
                onKeyDown={handleKeyDown}
                onClear={handleClear}
                placeholder="Search movies, series, genres, actors..."
                aria-label="Search movies and TV shows"
                className="h-13 sm:h-16 pl-11 sm:pl-13 pr-11 sm:pr-24 rounded-2xl bg-zinc-900/80 backdrop-blur-xl border-white/15 focus:border-white/40 focus:ring-4 focus:ring-white/10 text-base sm:text-lg shadow-inner placeholder:text-gray-500"
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
                    {isPending || isLiveLoading ? (
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

            {/* Instant Live Autocomplete Dropdown */}
            {isDropdownOpen && (
              <div
                role="listbox"
                className="absolute left-0 right-0 top-full mt-2.5 z-50 rounded-2xl bg-zinc-950/95 backdrop-blur-2xl border border-white/15 shadow-2xl shadow-black/90 overflow-hidden transition-all duration-200 text-left"
              >
                {inputQuery.trim().length < 2 ? (
                  /* Recent & Popular Quick Searches */
                  <div className="p-3.5 space-y-3.5">
                    {recentSearches.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between pb-2 mb-1.5 border-b border-white/10 px-1">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Recent Searches
                          </span>
                          <button
                            type="button"
                            onClick={clearAllRecentSearches}
                            className="text-[11px] text-gray-500 hover:text-white transition-colors"
                          >
                            Clear all
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {recentSearches.map((term) => (
                            <div
                              key={term}
                              onClick={() => {
                                handleSuggestionClick(term);
                                setIsDropdownOpen(false);
                              }}
                              className="group/chip inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/25 text-xs text-gray-200 transition-all cursor-pointer touch-manipulation"
                            >
                              <span>{term}</span>
                              <button
                                type="button"
                                onClick={(e) => removeRecentSearch(term, e)}
                                className="p-0.5 text-gray-500 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                                aria-label={`Remove ${term}`}
                              >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 pb-2 mb-1.5 border-b border-white/10 px-1 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.316.492-.63 1.077-.96 1.705C8.42 6.136 7.6 7.747 7.02 9.4c-.58-1.653-1.4-3.264-2.143-4.647a32.06 32.06 0 00-.96-1.705c-.208-.322-.477-.65-.822-.88a1 1 0 00-1.45.385A9.972 9.972 0 000 10c0 5.523 4.477 10 10 10s10-4.477 10-10a9.972 9.972 0 00-7.605-7.447zM10 18a8 8 0 110-16 8 8 0 010 16z" clipRule="evenodd" />
                        </svg>
                        Quick Popular Searches
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {["Dune: Part Two", "Oppenheimer", "Deadpool & Wolverine", "The Dark Knight", "Inception", "Breaking Bad", "Stranger Things"].map((term) => (
                          <button
                            key={term}
                            type="button"
                            onClick={() => {
                              handleSuggestionClick(term);
                              setIsDropdownOpen(false);
                            }}
                            className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/25 text-xs text-gray-200 transition-all touch-manipulation cursor-pointer"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Live Query Preview Cards */
                  <div>
                    {isLiveLoading && liveSuggestions.length === 0 ? (
                      <div className="p-4 space-y-3">
                        {[1, 2, 3].map((n) => (
                          <div key={n} className="flex items-center gap-3 animate-pulse">
                            <div className="w-10 h-14 rounded-lg bg-white/10 shrink-0" />
                            <div className="flex-1 space-y-1.5">
                              <div className="h-4 bg-white/10 rounded w-1/2" />
                              <div className="h-3 bg-white/5 rounded w-1/4" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : liveSuggestions.length > 0 ? (
                      <div className="max-h-[360px] sm:max-h-[420px] overflow-y-auto divide-y divide-white/5 p-1.5">
                        {liveSuggestions.map((item, idx) => {
                          const isSelected = idx === highlightedIndex;
                          return (
                            <Link
                              key={item.id}
                              href={`/watch/${item.id}`}
                              onClick={() => {
                                setIsDropdownOpen(false);
                                saveRecentSearch(item.title);
                              }}
                              onMouseEnter={() => setHighlightedIndex(idx)}
                              className={cn(
                                "flex items-center gap-3.5 p-2 rounded-xl transition-all duration-150 group touch-manipulation",
                                isSelected ? "bg-white/15" : "hover:bg-white/10"
                              )}
                            >
                              <div className="relative w-10 sm:w-11 h-14 sm:h-15 rounded-lg overflow-hidden bg-zinc-800 shrink-0 shadow-sm">
                                {item.posterUrl ? (
                                  <Image
                                    src={item.posterUrl}
                                    alt={item.title}
                                    fill
                                    sizes="48px"
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                                    🎬
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-sm sm:text-base text-white truncate group-hover:text-blue-300 transition-colors">
                                    {item.title}
                                  </span>
                                  {item.releaseYear && (
                                    <span className="text-xs text-gray-400 shrink-0">
                                      ({item.releaseYear})
                                    </span>
                                  )}
                                </div>
                                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-400">
                                  <span className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-medium uppercase tracking-wide text-gray-300">
                                    {item.contentType === "tv" ? "TV Series" : "Movie"}
                                  </span>
                                  {item.rating && item.rating > 0 && (
                                    <span className="flex items-center gap-1 text-amber-400 font-medium">
                                      ★ {item.rating.toFixed(1)}
                                    </span>
                                  )}
                                  {item.genres && item.genres.length > 0 && (
                                    <span className="text-gray-400 truncate hidden sm:inline">
                                      • {item.genres.slice(0, 2).join(", ")}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="shrink-0 pr-1 text-gray-500 group-hover:text-white transition-colors">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-7 px-4 text-center">
                        <p className="text-sm text-gray-400">
                          No instant preview for &ldquo;{inputQuery}&rdquo;
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Press Enter to search entire database & credits
                        </p>
                      </div>
                    )}

                    {/* Bottom Bar: Search all results */}
                    <div className="p-2 border-t border-white/10 bg-white/[0.02]">
                      <button
                        type="button"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          updateQueryInUrl(inputQuery);
                          if (inputQuery.trim()) {
                            saveRecentSearch(inputQuery.trim());
                          }
                        }}
                        onMouseEnter={() => setHighlightedIndex(liveSuggestions.length)}
                        className={cn(
                          "w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors touch-manipulation cursor-pointer",
                          highlightedIndex === liveSuggestions.length
                            ? "bg-white/15 text-white"
                            : "text-gray-300 hover:bg-white/10 hover:text-white"
                        )}
                      >
                        <span className="flex items-center gap-2 truncate">
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          Search all results for &ldquo;{inputQuery}&rdquo;
                        </span>
                        <span className="shrink-0 text-xs text-gray-400 font-mono hidden sm:inline">
                          ↵ Enter
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 sm:gap-4 p-3.5 sm:p-4 rounded-2xl bg-zinc-900/60 border border-white/[0.08] backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-8 w-8 rounded-xl bg-white/10 text-white shrink-0">
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
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-semibold text-white truncate">
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
                  <div className="text-[11px] sm:text-xs text-gray-400">
                    Page {data.page} of {Math.min(data.totalPages, 500).toLocaleString()} • Live catalog index
                  </div>
                </div>
              </div>

              {/* Toolbar: Sort & View Toggle */}
              <div className="flex items-center justify-between md:justify-end gap-2 sm:gap-3 w-full md:w-auto">
                {/* Mini Top Pager for instant flipping (tablet & desktop) */}
                {data.totalPages > 1 && (
                  <div className="hidden sm:inline-flex items-center gap-1 rounded-xl bg-white/[0.06] p-1 border border-white/10 text-xs shrink-0">
                    <button
                      type="button"
                      disabled={pageFromUrl <= 1}
                      onClick={() => handlePageChange(pageFromUrl - 1)}
                      title="Previous Page"
                      aria-label="Previous Page"
                      className="p-1 rounded-lg text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 transition-colors cursor-pointer disabled:cursor-not-allowed touch-manipulation"
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
                      className="p-1 rounded-lg text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 transition-colors cursor-pointer disabled:cursor-not-allowed touch-manipulation"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Sort Selector with text-base sm:text-xs to prevent iOS auto-zoom */}
                <div className="flex-1 sm:flex-initial sm:w-48 min-w-[130px]">
                  <Select
                    options={SORT_OPTIONS}
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    aria-label="Sort search results"
                    className="h-9 py-1 text-base sm:text-xs rounded-xl bg-white/[0.06] border-white/10"
                  />
                </div>

                {/* View Mode Toggle */}
                <div className="inline-flex rounded-xl bg-white/[0.06] p-1 border border-white/10 shrink-0">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    title="Grid View"
                    aria-label="Grid View"
                    className={cn(
                      "p-1.5 rounded-lg transition-colors cursor-pointer touch-manipulation",
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
                      "p-1.5 rounded-lg transition-colors cursor-pointer touch-manipulation",
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

            {/* In-Result Genre Filter Chips (Edge-to-edge horizontal swipe on mobile) */}
            {availableResultGenres.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide pt-1 touch-pan-x -mx-4 px-4 sm:mx-0 sm:px-0">
                <span className="text-xs font-semibold text-gray-400 shrink-0 uppercase tracking-wider pl-1">
                  Genre:
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedGenreFilter("all")}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer touch-manipulation",
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
                      "px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer touch-manipulation",
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
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
              /* Detailed List View - Responsive layout */
              <div className="space-y-3 sm:space-y-4">
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
                      className="group relative flex flex-row gap-3 sm:gap-6 p-3 sm:p-5 rounded-2xl bg-zinc-900/60 border border-white/[0.08] hover:border-white/25 hover:bg-zinc-900/90 transition-all duration-300"
                    >
                      {/* Left: Poster */}
                      <Link
                        href={detailHref}
                        className="relative aspect-[2/3] w-24 sm:w-36 shrink-0 rounded-xl overflow-hidden bg-zinc-950 border border-white/10 group-hover:border-white/30 transition-colors shadow-lg"
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
                          <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 rounded bg-black/80 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-white backdrop-blur-md border border-white/10">
                            {item.quality}
                          </span>
                        )}
                      </Link>

                      {/* Right: Info, Synopsis & Actions */}
                      <div className="flex flex-col justify-between flex-1 min-w-0">
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                            <span className="rounded bg-white/10 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-white">
                              {item.contentType === "movie" ? "Movie" : "TV Series"}
                            </span>
                            {item.releaseYear && (
                              <span className="text-[11px] sm:text-xs text-gray-400 font-medium">
                                {item.releaseYear}
                              </span>
                            )}
                            {item.rating > 0 && (
                              <div className="flex items-center gap-1 rounded-full bg-white/10 border border-white/15 px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-white">
                                <svg
                                  className="w-3 h-3 fill-amber-400 text-amber-400"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span>{item.rating.toFixed(1)}</span>
                                {item.voteCount ? (
                                  <span className="text-[10px] text-gray-400 font-normal hidden xs:inline">
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
                            <h3 className="text-sm sm:text-xl font-bold text-white hover:text-gray-200 transition-colors line-clamp-1">
                              {item.title}
                            </h3>
                          </Link>

                          {/* Genre Pills */}
                          {item.genres && item.genres.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5 sm:mt-2.5">
                              {item.genres.slice(0, 3).map((g) => (
                                <span
                                  key={g}
                                  className="rounded-md bg-white/[0.05] border border-white/[0.08] px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] text-gray-300"
                                >
                                  {g}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Synopsis */}
                          {item.overview && (
                            <p className="mt-2 text-xs sm:text-sm text-gray-400 line-clamp-2 sm:line-clamp-3 leading-relaxed">
                              {item.overview}
                            </p>
                          )}
                        </div>

                        {/* Action buttons footer */}
                        <div className="mt-3 sm:mt-5 pt-2 sm:pt-3 border-t border-white/[0.06] flex items-center justify-between">
                          <div className="flex items-center gap-2 sm:gap-2.5">
                            <Link
                              href={watchHref}
                              className="inline-flex items-center gap-1.5 sm:gap-2 rounded-xl bg-white text-black px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold hover:bg-gray-200 transition-colors shadow-sm touch-manipulation"
                            >
                              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                              Watch Now
                            </Link>
                            <Link
                              href={detailHref}
                              className="inline-flex items-center gap-1 rounded-xl bg-white/10 hover:bg-white/15 text-white px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-medium transition-colors border border-white/10 touch-manipulation"
                            >
                              Details
                            </Link>
                          </div>

                          <span className="text-[11px] text-gray-500 hidden md:inline">
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
          <div className="space-y-8 sm:space-y-14 animate-in fade-in duration-300">
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
                      className="group inline-flex items-center gap-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] px-3.5 py-1.5 text-xs text-gray-200 hover:text-white transition-all cursor-pointer touch-manipulation"
                    >
                      <span>{term}</span>
                      <button
                        type="button"
                        onClick={(e) => removeRecentSearch(term, e)}
                        className="text-gray-500 group-hover:text-gray-300 hover:!text-white transition-colors p-0.5 touch-manipulation"
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

              <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3">
                {STREAMING_PLATFORMS.slice(0, 8).map((platform) => (
                  <button
                    key={platform.id}
                    type="button"
                    onClick={() => handlePlatformClick(platform)}
                    className="group relative flex flex-col items-center justify-center p-2.5 sm:p-3.5 rounded-2xl bg-zinc-900/60 border border-white/[0.08] hover:border-white/30 hover:bg-zinc-800/80 hover:-translate-y-1 transition-all duration-200 cursor-pointer shadow-lg touch-manipulation"
                  >
                    <div className="relative h-8 w-8 sm:h-12 sm:w-12 rounded-xl overflow-hidden mb-1.5 sm:mb-2 shadow-inner border border-white/10 bg-black/40 p-1 flex items-center justify-center">
                      <Image
                        src={platform.logoUrl}
                        alt={platform.name}
                        width={48}
                        height={48}
                        className="object-contain rounded-lg"
                      />
                    </div>
                    <span className="text-[10px] sm:text-xs font-semibold text-gray-300 group-hover:text-white transition-colors text-center line-clamp-1">
                      {platform.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>



            {/* 4. Popular Search Keywords (Hidden on mobile for compact discovery) */}
            <div className="hidden md:block p-4 sm:p-5 rounded-2xl bg-zinc-900/40 border border-white/[0.08] backdrop-blur-sm">
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
                    className="rounded-full bg-white/[0.05] hover:bg-white/[0.12] border border-white/[0.08] px-3.5 py-1.5 text-xs text-gray-300 hover:text-white transition-all cursor-pointer touch-manipulation"
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
