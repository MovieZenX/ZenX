"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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

        {/* Season Selector Tabs/Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {seasons.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => handleSelectSeason(s.seasonNumber)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold shrink-0 transition-all duration-200 cursor-pointer ${
                selectedSeasonNumber === s.seasonNumber
                  ? "bg-white text-black"
                  : "bg-white/[0.05] hover:bg-white/[0.1] text-gray-300 hover:text-white border border-white/[0.08]"
              }`}
              aria-label={`Select ${s.name || `Season ${s.seasonNumber}`}`}
            >
              {s.name || `Season ${s.seasonNumber}`}
            </button>
          ))}
        </div>
      </div>

      {/* Active Season Overview Card */}
      {activeSeason && (
        <div className="flex flex-col sm:flex-row gap-4 items-start bg-surface-card/60 p-4 rounded-xl border border-white/[0.06]">
          {activeSeason.posterUrl ? (
            <div className="w-20 aspect-[2/3] shrink-0 rounded-lg overflow-hidden border border-white/10 hidden sm:block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeSeason.posterUrl}
                alt={activeSeason.name}
                className="h-full w-full object-cover"
              />
            </div>
          ) : null}

          <div className="flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-white">
                {activeSeason.name}
              </h3>
              <Badge variant="accent" size="sm">
                {activeSeason.episodeCount} Episodes
              </Badge>
              {activeSeason.airDate && (
                <span className="text-xs text-gray-400 font-medium">
                  Premiered {activeSeason.airDate.slice(0, 4)}
                </span>
              )}
            </div>
            {activeSeason.overview ? (
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed pt-1">
                {activeSeason.overview}
              </p>
            ) : null}
          </div>
        </div>
      )}

      {/* Loading Skeleton State */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <Skeleton className="w-28 sm:w-44 aspect-video rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3 rounded" />
                <Skeleton className="h-3 w-1/4 rounded" />
                <Skeleton className="h-3 w-4/5 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State with Retry */}
      {!isLoading && error && (
        <div className="p-6 text-center rounded-xl bg-red-950/20 border border-red-500/20 space-y-3">
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
            <Card
              key={ep.id}
              className="p-3 sm:p-4 flex flex-col sm:flex-row gap-4 items-start border-white/[0.06] hover:border-white/[0.12] transition-colors"
            >
              {/* Episode Still / Thumbnail */}
              <div className="relative w-full sm:w-44 lg:w-52 aspect-video rounded-lg overflow-hidden shrink-0 bg-surface border border-white/10 group">
                {ep.stillUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={ep.stillUrl}
                    alt={ep.name}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-white/[0.04] text-gray-500 text-xs font-bold">
                    Episode {ep.episodeNumber}
                  </div>
                )}

                {/* Quick Play Watch Link Overlay */}
                <Link
                  href={`/watch/${tvId}?type=tv&season=${ep.seasonNumber}&episode=${ep.episodeNumber}`}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  aria-label={`Watch Episode ${ep.episodeNumber}: ${ep.name}`}
                >
                  <div className="h-10 w-10 rounded-full bg-white text-black flex items-center justify-center">
                    <svg className="h-5 w-5 fill-current ml-0.5" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </Link>
              </div>

              {/* Episode Information */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-sm sm:text-base font-bold text-white leading-tight">
                    <span className="text-gray-400 font-mono mr-1.5">
                      {ep.episodeNumber < 10 ? `0${ep.episodeNumber}` : ep.episodeNumber}.
                    </span>
                    {ep.name}
                  </h4>

                  <div className="flex items-center gap-2 text-xs">
                    {ep.duration && (
                      <span className="text-gray-400 font-medium">
                        {ep.duration}
                      </span>
                    )}
                    {ep.voteAverage > 0 && (
                      <Badge variant="rating" size="sm">
                        ★ {ep.voteAverage}
                      </Badge>
                    )}
                  </div>
                </div>

                {ep.airDate && (
                  <p className="text-[11px] text-gray-400">
                    Aired {ep.airDate}
                  </p>
                )}

                {ep.overview ? (
                  <p className="text-xs sm:text-sm text-gray-300 line-clamp-2 sm:line-clamp-3 leading-relaxed pt-0.5">
                    {ep.overview}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 italic">
                    No episode synopsis available.
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty Episodes State */}
      {!isLoading && !error && episodes.length === 0 && (
        <div className="p-8 text-center bg-white/[0.02] border border-white/[0.06] rounded-xl">
          <p className="text-sm text-gray-400">
            No episode details are currently available for this season.
          </p>
        </div>
      )}
    </section>
  );
}
