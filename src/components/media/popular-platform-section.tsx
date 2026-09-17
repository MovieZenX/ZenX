"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
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
  const isInitialMount = useRef(true);

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

  // Fetch when platform or type changes
  useEffect(() => {
    if (isInitialMount.current && initialItems.length > 0) {
      isInitialMount.current = false;
      return;
    }
    isInitialMount.current = false;

    let cancelled = false;
    setIsLoading(true);

    const fetchItems = async () => {
      try {
        const res = await fetch(
          `/api/metadata/search?provider=${currentPlatform.providerId}&type=${selectedType}&page=1`
        );
        if (!res.ok) throw new Error("Failed to load platform items");
        const json = await res.json();
        if (!cancelled) {
          setItems(json.results || []);
        }
      } catch (err) {
        console.error("[PopularPlatformSection] Fetch error:", (err as Error).message);
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchItems();

    return () => {
      cancelled = true;
    };
  }, [currentPlatform.providerId, selectedType, initialItems.length]);

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
                className="h-5 sm:h-6 w-auto object-contain filter drop-shadow"
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
              className="appearance-none rounded-full bg-white/10 hover:bg-white/15 border border-white/15 px-3.5 py-1.5 pr-8 text-xs font-semibold text-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-white/30 transition-colors"
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
              className="appearance-none rounded-full bg-white/10 hover:bg-white/15 border border-white/15 px-3.5 py-1.5 pr-8 text-xs font-semibold text-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-white/30 transition-colors"
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
              className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 hover:bg-white/15 hover:text-white transition-colors cursor-pointer"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              aria-label="Next titles"
              className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 hover:bg-white/15 hover:text-white transition-colors cursor-pointer"
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
          className="flex items-center gap-6 sm:gap-8 md:gap-9 overflow-x-auto no-scrollbar scroll-smooth py-3 px-1 pl-7 sm:pl-9 md:pl-11"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-36 sm:w-44 md:w-52 shrink-0">
                <CardSkeleton />
              </div>
            ))
          ) : items.length > 0 ? (
            items.slice(0, 10).map((item, index) => {
              const rank = index + 1;
              return (
                <div
                  key={`${item.contentType}-${item.id}`}
                  className="shrink-0 w-36 sm:w-44 md:w-52 snap-start select-none"
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
                    rankColor="blue"
                  />
                </div>
              );
            })
          ) : (
            <div className="w-full py-8 text-center text-xs text-white/50">
              No titles currently available on this platform.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
