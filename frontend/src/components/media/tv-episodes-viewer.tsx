"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { SeasonItem, EpisodeItem } from "@/types/metadata";

export interface TvEpisodesViewerProps {
  tvId: string;
  seasons: SeasonItem[];
  initialSeason: SeasonItem | null;
}

/**
 * Interactive TV seasons and episode list viewer.
 * Provides on-demand season switching, cached season state, and responsive episode cards.
 */
export function TvEpisodesViewer({
  tvId,
  seasons,
  initialSeason,
}: TvEpisodesViewerProps) {
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<number>(
    initialSeason?.seasonNumber ?? seasons[0]?.seasonNumber ?? 1
  );

  // Cache seasons in local state to avoid duplicate network requests
  const [seasonsCache, setSeasonsCache] = useState<Record<number, SeasonItem>>(() => {
    const map: Record<number, SeasonItem> = {};
    if (initialSeason) {
      map[initialSeason.seasonNumber] = initialSeason;
    }
    return map;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch season data when not present in client cache
  useEffect(() => {
    if (seasonsCache[selectedSeasonNumber]) return;

    let ignore = false;
    async function fetchSeason() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/metadata/tv/${tvId}/season/${selectedSeasonNumber}`);
        if (!res.ok) throw new Error("Failed to load season details.");
        const data: SeasonItem = await res.json();
        if (!ignore) {
          setSeasonsCache((prev) => ({
            ...prev,
            [selectedSeasonNumber]: data,
          }));
        }
      } catch {
        if (!ignore) {
          setError("Unable to load episodes for this season. Please try again.");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    fetchSeason();
    return () => {
      ignore = true;
    };
  }, [selectedSeasonNumber, tvId, seasonsCache]);

  const handleSelectSeason = (seasonNum: number) => {
    setSelectedSeasonNumber(seasonNum);
  };

  const activeSeason = seasonsCache[selectedSeasonNumber] ?? initialSeason;
  const episodes: EpisodeItem[] = activeSeason?.episodes ?? [];

  if (!seasons || seasons.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6" aria-labelledby="episodes-heading">
      {/* Section Header & Season Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <h2 id="episodes-heading" className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Episodes & Seasons
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Browse episodes by season for this series.
          </p>
        </div>

        {/* Season Selector Segmented Capsule Bar - Only show when multiple seasons exist */}
        {seasons.length > 1 && (
          <div className="inline-flex items-center p-1 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-md gap-1 overflow-x-auto max-w-full scrollbar-none">
            {seasons.map((s) => {
              const isSelected = selectedSeasonNumber === s.seasonNumber;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSelectSeason(s.seasonNumber)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold shrink-0 transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? "bg-white/[0.15] text-white border border-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
                      : "text-white/60 hover:text-white hover:bg-white/[0.06] border border-transparent"
                  }`}
                  aria-label={`Select ${s.name || `Season ${s.seasonNumber}`}`}
                >
                  {s.name || `Season ${s.seasonNumber}`}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Season Overview Card */}
      {activeSeason && (
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3.5 sm:p-5 backdrop-blur-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <div className="flex gap-3.5 sm:gap-5 items-start">
            {activeSeason.posterUrl ? (
              <div className="w-14 sm:w-20 aspect-[2/3] shrink-0 rounded-xl overflow-hidden border border-white/15 shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeSeason.posterUrl}
                  alt={activeSeason.name}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : null}

            <div className="flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {activeSeason.name}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-white/[0.08] border border-white/10 text-xs font-semibold text-white/90">
                  {activeSeason.episodeCount} Episodes
                </span>
                {activeSeason.airDate && (
                  <span className="text-xs text-white/50 font-mono">
                    Premiered {activeSeason.airDate.slice(0, 4)}
                  </span>
                )}
              </div>
              {activeSeason.overview ? (
                <p className="text-xs sm:text-sm text-gray-300/80 leading-relaxed max-w-4xl line-clamp-3">
                  {activeSeason.overview}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Loading Skeleton State */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <Skeleton className="w-full sm:w-52 md:w-60 aspect-video rounded-xl shrink-0" />
              <div className="flex-1 space-y-2.5">
                <Skeleton className="h-5 w-1/3 rounded-md" />
                <Skeleton className="h-3 w-1/5 rounded" />
                <Skeleton className="h-3 w-4/5 rounded" />
                <Skeleton className="h-3 w-3/5 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State with Retry */}
      {!isLoading && error && (
        <div className="p-6 text-center rounded-2xl bg-red-950/20 border border-red-500/20 space-y-3">
          <p className="text-sm text-red-300">{error}</p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleSelectSeason(selectedSeasonNumber)}
          >
            Retry Loading Season
          </Button>
        </div>
      )}

      {/* Episode Cards List */}
      {!isLoading && !error && episodes.length > 0 && (
        <div className="space-y-3">
          {episodes.map((ep) => (
            <Link
              key={ep.id}
              href={`/watch/${tvId}?type=tv&season=${ep.seasonNumber}&episode=${ep.episodeNumber}`}
              className="group relative flex flex-col sm:flex-row gap-3 sm:gap-5 p-3 sm:p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.07] hover:border-white/[0.15] transition-all duration-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] cursor-pointer"
              aria-label={`Watch Episode ${ep.episodeNumber}: ${ep.name}`}
            >
              {/* Mobile top split row (thumbnail + info) / Desktop standard left thumbnail */}
              <div className="flex gap-3 sm:gap-5 items-start sm:contents">
                {/* Episode Still / Thumbnail */}
                <div className="relative w-32 xs:w-36 sm:w-52 md:w-60 aspect-video rounded-xl overflow-hidden shrink-0 bg-white/[0.03] border border-white/10">
                  {/* Episode Index Pill */}
                  <div className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 z-10 px-1.5 sm:px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-sm border border-white/15 text-[10px] sm:text-[11px] font-mono font-bold text-white/90">
                    EP {ep.episodeNumber < 10 ? `0${ep.episodeNumber}` : ep.episodeNumber}
                  </div>

                  {ep.stillUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={ep.stillUrl}
                      alt={ep.name}
                      loading="lazy"
                      className="h-full w-full object-cover transform-gpu group-hover:scale-[1.03] transition-transform duration-300 ease-out"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-white/[0.03] text-gray-500 text-xs font-bold font-mono">
                      EP {ep.episodeNumber}
                    </div>
                  )}

                  {/* Translucent Frosted Glass Play Overlay */}
                  <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center">
                    <div className="h-8 w-8 sm:h-11 sm:w-11 rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
                      <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-white ml-0.5" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Mobile-only header next to thumbnail */}
                <div className="flex-1 min-w-0 sm:hidden space-y-1">
                  <h4 className="text-xs xs:text-sm font-bold text-white group-hover:text-white transition-colors leading-snug line-clamp-2">
                    <span className="text-gray-400 font-mono mr-1">
                      {ep.episodeNumber < 10 ? `0${ep.episodeNumber}` : ep.episodeNumber}.
                    </span>
                    {ep.name}
                  </h4>

                  <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                    {ep.duration && (
                      <span className="px-1.5 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-white/70 font-mono">
                        {ep.duration}
                      </span>
                    )}
                    {ep.voteAverage > 0 && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 font-semibold">
                        ★ {ep.voteAverage}
                      </span>
                    )}
                  </div>

                  {ep.airDate && (
                    <p className="text-[10px] text-white/40 font-mono">
                      {ep.airDate}
                    </p>
                  )}
                </div>
              </div>

              {/* Episode Information (Desktop main block + Mobile overview) */}
              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                <div className="space-y-1.5">
                  {/* Desktop header (hidden on mobile, shown next to thumbnail instead) */}
                  <div className="hidden sm:flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-white transition-colors leading-snug">
                      <span className="text-gray-400 font-mono mr-1.5 text-xs sm:text-sm">
                        {ep.episodeNumber < 10 ? `0${ep.episodeNumber}` : ep.episodeNumber}.
                      </span>
                      {ep.name}
                    </h4>

                    <div className="flex items-center gap-2 text-xs">
                      {ep.duration && (
                        <span className="px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-white/70 text-[11px] font-mono">
                          {ep.duration}
                        </span>
                      )}
                      {ep.voteAverage > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 font-semibold text-[11px]">
                          ★ {ep.voteAverage}
                        </span>
                      )}
                    </div>
                  </div>

                  {ep.airDate && (
                    <p className="hidden sm:block text-[11px] text-white/40 font-mono">
                      Aired {ep.airDate}
                    </p>
                  )}

                  {ep.overview ? (
                    <p className="text-xs text-gray-300/80 line-clamp-2 sm:line-clamp-3 leading-relaxed pt-0.5">
                      {ep.overview}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 italic pt-0.5 hidden sm:block">
                      No episode synopsis available.
                    </p>
                  )}
                </div>

                {/* Interactive Play Episode Indicator */}
                <div className="pt-2 sm:pt-0 flex items-center justify-between sm:justify-start">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white/70 sm:text-white/50 group-hover:text-white transition-colors">
                    <span>Watch Episode</span>
                    <svg className="h-3 w-3 stroke-current fill-none transform-gpu group-hover:translate-x-0.5 transition-transform" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Empty Episodes State */}
      {!isLoading && !error && episodes.length === 0 && (
        <div className="p-8 text-center bg-white/[0.02] border border-white/[0.06] rounded-2xl">
          <p className="text-sm text-gray-400">
            No episode details are currently available for this season.
          </p>
        </div>
      )}
    </section>
  );
}
