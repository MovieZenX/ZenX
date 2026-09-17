"use client";

import { useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface StreamingPlatform {
  id: string;
  name: string;
  providerId: number;
  region?: string;
  logoUrl: string;
}

export const STREAMING_PLATFORMS: StreamingPlatform[] = [
  {
    id: "netflix",
    name: "Netflix",
    providerId: 8,
    logoUrl: "https://image.tmdb.org/t/p/w300/tyHnxjQJLH6h4iDQKhN5iqebWmX.png",
  },
  {
    id: "prime-video",
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
    name: "Max",
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
  {
    id: "crunchyroll",
    name: "Crunchyroll",
    providerId: 283,
    logoUrl: "https://image.tmdb.org/t/p/w300/fzN5Jok5Ig1eJ7gyNGoMhnLSCfh.jpg",
  },
  {
    id: "starz",
    name: "Starz",
    providerId: 43,
    logoUrl: "https://image.tmdb.org/t/p/w300/yIKwylTLP1u8gl84Is7FItpYLGL.jpg",
  },
  {
    id: "discovery-plus",
    name: "Discovery+",
    providerId: 520,
    region: "US",
    logoUrl: "https://image.tmdb.org/t/p/w300/eMTnWwNVtThkjvQA6zwxaoJG9NE.jpg",
  },
  {
    id: "amc-plus",
    name: "AMC+",
    providerId: 526,
    region: "US",
    logoUrl: "https://image.tmdb.org/t/p/w300/ovmu6uot1XVvsemM2dDySXLiX57.jpg",
  },
  {
    id: "tubi",
    name: "Tubi",
    providerId: 73,
    logoUrl: "https://image.tmdb.org/t/p/w300/zLYr7OPvpskMA4S79E3vlCi71iC.jpg",
  },
  {
    id: "plex",
    name: "Plex",
    providerId: 538,
    logoUrl: "https://image.tmdb.org/t/p/w300/vLZKlXUNDcZR7ilvfY9Wr9k80FZ.jpg",
  },
  {
    id: "mubi",
    name: "MUBI",
    providerId: 11,
    logoUrl: "https://image.tmdb.org/t/p/w300/x570VpH2C9EKDf1riP83rYc5dnL.jpg",
  },
  {
    id: "shudder",
    name: "Shudder",
    providerId: 99,
    region: "US",
    logoUrl: "https://image.tmdb.org/t/p/w300/vEtdiYRPRbDCp1Tcn3BEPF1Ni76.jpg",
  },
];

interface StreamingPlatformsProps {
  className?: string;
}

export function StreamingPlatforms({ className }: StreamingPlatformsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [failedLogos, setFailedLogos] = useState<Record<string, boolean>>({});

  const scroll = useCallback((direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollAmount = container.clientWidth * 0.75;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  }, []);

  const handleLogoError = useCallback((id: string) => {
    setFailedLogos((prev) => ({ ...prev, [id]: true }));
  }, []);

  return (
    <section
      aria-label="Streaming Platforms"
      className={cn("pt-4 pb-2 md:pt-6 md:pb-4 select-none", className)}
    >
      {/* Header Row: Title, Badge, and Carousel Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white">
            Streaming Platforms
          </h2>
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-white/10 text-white/70 border border-white/10">
            Official Networks
          </span>
        </div>

        {/* Carousel Navigation Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => scroll("left")}
            aria-label="Previous platforms"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 hover:bg-white/15 hover:text-white transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-white"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            aria-label="Next platforms"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 hover:bg-white/15 hover:text-white transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-white"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Horizontal Scrolling Card Track */}
      <div className="relative -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div
          ref={scrollContainerRef}
          tabIndex={0}
          role="region"
          aria-label="Scrollable list of streaming platforms"
          className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth py-2 px-1 focus:outline-none"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {STREAMING_PLATFORMS.map((platform) => {
            const isFailed = failedLogos[platform.id];
            const searchUrl = `/search?provider=${platform.providerId}&name=${encodeURIComponent(
              platform.name
            )}`;

            return (
              <Link
                key={platform.id}
                href={searchUrl}
                aria-label={`Browse ${platform.name} catalog`}
                className={cn(
                  "group relative shrink-0 w-36 sm:w-48 md:w-56 h-20 sm:h-24 md:h-28 rounded-2xl overflow-hidden",
                  "flex items-center justify-center p-4",
                  "bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/25",
                  "backdrop-blur-sm shadow-md hover:shadow-xl transition-all duration-300",
                  "hover:scale-[1.03] active:scale-95 focus-visible:outline-2 focus-visible:outline-white"
                )}
              >
                {/* Subtle Hover Sheen */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Logo Image with Fallback */}
                <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
                  {!isFailed ? (
                    <Image
                      src={platform.logoUrl}
                      alt={platform.name}
                      width={180}
                      height={60}
                      className="max-h-8 sm:max-h-11 md:max-h-13 max-w-[82%] w-auto object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                      onError={() => handleLogoError(platform.id)}
                      unoptimized
                    />
                  ) : (
                    <span className="text-sm sm:text-base font-bold text-white tracking-wide">
                      {platform.name}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
