"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ContentCard } from "./content-card";
import { CardSkeleton } from "@/components/ui/skeleton";
import type { MediaItem } from "@/types/metadata";

export interface PopularPlatformOption {
  id: string;
  name: string;
  providerId: number;
  logoUrl: string;
}

export const POPULAR_PLATFORMS: PopularPlatformOption[] = [
  {
    id: "netflix",
    name: "Netflix",
    providerId: 8,
    logoUrl: "https://image.tmdb.org/t/p/w300/tyHnxjQJLH6h4iDQKhN5iqebWmX.png",
  },
  {
    id: "prime",
    name: "Prime Video",
    providerId: 9,
    logoUrl: "https://image.tmdb.org/t/p/w300/ifhbNuuVnlwYy5oXA5VIb2YR8AZ.png",
  },
  {
    id: "disney-plus",
    name: "Disney+",
    providerId: 337,
    logoUrl: "https://image.tmdb.org/t/p/w300/1edZOYAfoyZyZ3rklNSiUpXX30Q.png",
  },
  {
    id: "apple-tv",
    name: "Apple TV+",
    providerId: 350,
    logoUrl: "https://image.tmdb.org/t/p/w300/4KAy34EHvRM25Ih8wb82AuGU7zJ.png",
  },
  {
    id: "max",
    name: "Max / HBO",
    providerId: 1899,
    logoUrl: "https://image.tmdb.org/t/p/w300/rAb4M1LjGpWASxpk6Va791A7Nkw.png",
  },
  {
    id: "paramount-plus",
    name: "Paramount+",
    providerId: 531,
    logoUrl: "https://image.tmdb.org/t/p/w300/fi83B1oztoS47xxcemFdPMhIzK.png",
  },
  {
    id: "hulu",
    name: "Hulu",
    providerId: 15,
    logoUrl: "https://image.tmdb.org/t/p/w300/bxBlRPEPpMVDc4jMhSrTf2339DW.jpg",
  },
  {
    id: "peacock",
    name: "Peacock",
    providerId: 386,
    logoUrl: "https://image.tmdb.org/t/p/w300/2aGrp1xw3qhwCYvNGAJZPdjfeeX.jpg",
  },
];

interface PopularPlatformSectionProps {
  initialItems?: MediaItem[];
  initialPlatformId?: string;
  initialType?: "tv" | "movie";
}

export function PopularPlatformSection({
  initialItems = [],
  initialPlatformId = "netflix",
  initialType = "tv",
}: PopularPlatformSectionProps) {
  const [selectedPlatformId, setSelectedPlatformId] = useState(initialPlatformId);
  const [selectedType, setSelectedType] = useState<"tv" | "movie">(initialType);
  const [items, setItems] = useState<MediaItem[]>(initialItems);
  const [isLoading, setIsLoading] = useState(initialItems.length === 0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [fetchTrigger, setFetchTrigger] = useState(0);

  // In-memory cache for loaded platform items across user selections
  const cacheRef = useRef<Record<string, MediaItem[]>>({
    [`${initialPlatformId}-${initialType}`]: initialItems,
  });

  // Keep cache and displayed items synced if server-provided initialItems updates
  useEffect(() => {
    if (initialItems && initialItems.length > 0) {
      cacheRef.current[`${initialPlatformId}-${initialType}`] = initialItems;
      if (selectedPlatformId === initialPlatformId && selectedType === initialType) {
        setItems(initialItems);
        setIsLoading(false);
      }
    }
  }, [initialItems, initialPlatformId, initialType, selectedPlatformId, selectedType]);

  const currentPlatform =
    POPULAR_PLATFORMS.find((p) => p.id === selectedPlatformId) || POPULAR_PLATFORMS[0]!;

  const scroll = useCallback((direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }, []);

  // Fetch when platform, type, or retry trigger changes
  useEffect(() => {
    const cacheKey = `${selectedPlatformId}-${selectedType}`;
    const cached = cacheRef.current[cacheKey];

    // If already in cache and has items, show immediately without loading delay
    if (cached && cached.length > 0) {
      setItems(cached);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    const fetchItems = async () => {
      try {
        const res = await fetch(
          `/api/metadata/search?provider=${currentPlatform.providerId}&type=${selectedType}&page=1`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const results = json.results || [];

        if (!cancelled) {
          if (results.length > 0) {
            cacheRef.current[cacheKey] = results;
            setItems(results);
          } else if (
            selectedPlatformId === initialPlatformId &&
            selectedType === initialType &&
            initialItems.length > 0
          ) {
            // Fall back to server provided initialItems
            setItems(initialItems);
          } else {
            setItems([]);
          }
        }
      } catch (err) {
        console.error("[PopularPlatformSection] Fetch error:", (err as Error).message);
        if (!cancelled) {
          // If default platform failed, fall back to initialItems
          if (
            selectedPlatformId === initialPlatformId &&
            selectedType === initialType &&
            initialItems.length > 0
          ) {
            setItems(initialItems);
          } else if (cached && cached.length > 0) {
            setItems(cached);
          } else {
            setItems([]);
          }
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchItems();

    return () => {
      cancelled = true;
    };
  }, [
    currentPlatform.providerId,
    selectedPlatformId,
    selectedType,
    initialPlatformId,
    initialType,
    initialItems,
    fetchTrigger,
  ]);

  return (
    <section
      aria-label={`Popular ${selectedType === "tv" ? "series" : "movies"} on ${currentPlatform.name}`}
      className="py-2 select-none"
    >
      {/* Header Row: "POPULAR" Branding + Dynamic Platform Logo + Selectors */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-2 border-b border-white/[0.08]">
        {/* Left Branding Group */}
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-none">
            POPULAR
          </span>
          <div className="h-8 sm:h-10 w-px bg-white/15" />
          <div className="flex flex-col justify-center">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-white/50">
              {selectedType === "tv" ? "SERIES ON" : "MOVIES ON"}
            </span>
            <div className="h-6 sm:h-7 mt-0.5 flex items-center">
              <Image
                src={currentPlatform.logoUrl}
                alt={currentPlatform.name}
                width={120}
                height={30}
                className={cn(
                  "h-5 sm:h-6 w-auto object-contain filter drop-shadow",
                  currentPlatform.id === "apple-tv" && "invert brightness-200"
                )}
                unoptimized
              />
            </div>
          </div>
        </div>

        {/* Right Controls: Platform Selector, Format Selector, and Scroll Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Platform Selector */}
          <div className="relative">
            <select
              value={selectedPlatformId}
              onChange={(e) => setSelectedPlatformId(e.target.value)}
              aria-label="Select streaming platform"
              className="appearance-none rounded-full glass-invisible px-3.5 py-1.5 pr-8 text-xs font-semibold text-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-white/30 transition-colors"
            >
              {POPULAR_PLATFORMS.map((p) => (
                <option key={p.id} value={p.id} className="bg-neutral-900 text-white">
                  {p.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-white/60">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Type Selector (Series / Movies) */}
          <div className="relative">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as "tv" | "movie")}
              aria-label="Select content type"
              className="appearance-none rounded-full glass-invisible px-3.5 py-1.5 pr-8 text-xs font-semibold text-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-white/30 transition-colors"
            >
              <option value="tv" className="bg-neutral-900 text-white">
                Series
              </option>
              <option value="movie" className="bg-neutral-900 text-white">
                Movies
              </option>
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-white/60">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* View All Link */}
          <Link
            href={`/search?provider=${currentPlatform.providerId}&name=${encodeURIComponent(
              currentPlatform.name
            )}&type=${selectedType}`}
            className="text-xs font-medium text-white/60 hover:text-white transition-colors hidden sm:inline-block px-1"
          >
            Explore All →
          </Link>

          {/* Carousel Arrows */}
          <div className="flex items-center gap-1 ml-1">
            <button
              type="button"
              onClick={() => scroll("left")}
              aria-label="Previous titles"
              className="flex h-7 w-7 items-center justify-center rounded-full glass-invisible text-white/70 hover:text-white transition-all cursor-pointer"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              aria-label="Next titles"
              className="flex h-7 w-7 items-center justify-center rounded-full glass-invisible text-white/70 hover:text-white transition-all cursor-pointer"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Cards Horizontal Carousel Track with Giant Rank Numbering */}
      <div className="relative -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div
          ref={scrollRef}
          className="flex items-center gap-4 sm:gap-5 md:gap-6 overflow-x-auto no-scrollbar scroll-smooth py-3 px-1 scroll-pl-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-48 sm:w-56 md:w-64 shrink-0">
                <CardSkeleton />
              </div>
            ))
          ) : items.length > 0 ? (
            items.slice(0, 10).map((item, index) => {
              const rank = index + 1;
              return (
                <div
                  key={`${item.contentType}-${item.id}`}
                  className="shrink-0 w-48 sm:w-56 md:w-64 snap-start select-none"
                >
                  <ContentCard
                    id={item.id}
                    title={item.title}
                    posterUrl={item.posterUrl}
                    contentType={item.contentType}
                    releaseYear={item.releaseYear}
                    rating={item.rating}
                    quality={item.quality}
                    rank={rank}
                    rankColor="white"
                  />
                </div>
              );
            })
          ) : (
            <div className="w-full py-10 flex flex-col items-center justify-center text-center px-4">
              <p className="text-xs text-white/50 mb-2.5">
                No titles currently available on this platform.
              </p>
              <button
                type="button"
                onClick={() => setFetchTrigger((prev) => prev + 1)}
                className="px-4 py-1.5 text-xs font-medium rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border border-white/15 transition-colors cursor-pointer"
              >
                Reload Platform
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
