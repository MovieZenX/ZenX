"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import type { MediaDetail, SeasonItem, EpisodeItem } from "@/types/metadata";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export interface WatchTheaterProps {
  media: MediaDetail;
  initialSeasonNumber: number;
  initialEpisodeNumber: number;
  initialSeasonData: SeasonItem | null;
  type: "movie" | "tv";
}

export function WatchTheater({
  media,
  initialSeasonNumber,
  initialEpisodeNumber,
  initialSeasonData,
  type,
}: WatchTheaterProps) {
  const isTv = type === "tv";

  // Player state
  const [seasonNum, setSeasonNum] = useState<number>(initialSeasonNumber);
  const [episodeNum, setEpisodeNum] = useState<number>(initialEpisodeNumber);
  const [server, setServer] = useState<"vidfast" | "backup">("vidfast");
  const [cinemaMode, setCinemaMode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [iframeKey, setIframeKey] = useState<number>(1);
  const [overviewExpanded, setOverviewExpanded] = useState<boolean>(false);

  // TV Seasons & Episodes Cache
  const [seasonsCache, setSeasonsCache] = useState<Record<number, SeasonItem>>(() => {
    const map: Record<number, SeasonItem> = {};
    if (initialSeasonData) {
      map[initialSeasonData.seasonNumber] = initialSeasonData;
    }
    return map;
  });
  const [loadingSeason, setLoadingSeason] = useState<boolean>(false);
  const playerRef = useRef<HTMLDivElement>(null);

  // Sync state with props when navigating via router
  useEffect(() => {
    setSeasonNum(initialSeasonNumber);
    setEpisodeNum(initialEpisodeNumber);
    if (initialSeasonData) {
      setSeasonsCache((prev) => ({
        ...prev,
        [initialSeasonData.seasonNumber]: initialSeasonData,
      }));
    }
  }, [initialSeasonNumber, initialEpisodeNumber, initialSeasonData]);

  // Fetch season data on demand when switching seasons in the TV playlist
  useEffect(() => {
    if (!isTv || seasonsCache[seasonNum]) return;

    let ignore = false;
    async function fetchSeason() {
      setLoadingSeason(true);
      try {
        const res = await fetch(`/api/metadata/tv/${media.id}/season/${seasonNum}`);
        if (!res.ok) throw new Error("Failed to fetch season details");
        const data: SeasonItem = await res.json();
        if (!ignore) {
          setSeasonsCache((prev) => ({
            ...prev,
            [seasonNum]: data,
          }));
        }
      } catch (err) {
        console.error("Error loading season episodes:", err);
      } finally {
        if (!ignore) {
          setLoadingSeason(false);
        }
      }
    }

    fetchSeason();
    return () => {
      ignore = true;
    };
  }, [isTv, media.id, seasonNum, seasonsCache]);

  // Construct embed URL
  const embedUrl = isTv
    ? server === "vidfast"
      ? `https://vidfast.vc/tv/${media.id}/${seasonNum}/${episodeNum}?autoPlay=true`
      : `https://vidsrc.to/embed/tv/${media.id}/${seasonNum}/${episodeNum}`
    : server === "vidfast"
    ? `https://vidfast.vc/movie/${media.id}?autoPlay=true`
    : `https://vidsrc.to/embed/movie/${media.id}`;

  const currentSeasonData = seasonsCache[seasonNum] ?? initialSeasonData;
  const episodes: EpisodeItem[] = currentSeasonData?.episodes ?? [];
  const currentEpisodeData = episodes.find((ep) => ep.episodeNumber === episodeNum);

  const totalEpisodesInSeason = episodes.length;
  const hasPrevEpisode = isTv && episodeNum > 1;
  const hasNextEpisode =
    isTv && (totalEpisodesInSeason > 0 ? episodeNum < totalEpisodesInSeason : true);

  // Switch to episode
  const handleSelectEpisode = useCallback(
    (targetEp: number, targetSeason?: number) => {
      const s = targetSeason ?? seasonNum;
      setSeasonNum(s);
      setEpisodeNum(targetEp);
      setIframeKey((prev) => prev + 1);

      // Smoothly update browser URL without full page reload
      window.history.replaceState(
        null,
        "",
        `/watch/${media.id}?type=tv&season=${s}&episode=${targetEp}`
      );
    },
    [media.id, seasonNum]
  );

  // Switch season
  const handleSelectSeason = (newSeasonNum: number) => {
    setSeasonNum(newSeasonNum);
    // Find if target season has cached episodes, default to episode 1
    handleSelectEpisode(1, newSeasonNum);
  };

  // Keyboard navigation for theater
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === "Escape" && cinemaMode) {
        setCinemaMode(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cinemaMode]);

  // Copy shareable link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Reload player iframe
  const handleReload = () => {
    setIframeKey((prev) => prev + 1);
  };

  const detailHref = isTv ? `/tv/${media.id}` : `/movie/${media.id}`;
  const displayTitle = isTv
    ? `${media.title} — Season ${seasonNum}, Episode ${episodeNum}${
        currentEpisodeData?.name ? `: ${currentEpisodeData.name}` : ""
      }`
    : media.title;

  return (
    <div
      className={cn(
        "transition-all duration-300 min-h-screen text-white",
        cinemaMode ? "bg-black pt-4 pb-12" : "pt-20 sm:pt-24 pb-20"
      )}
    >
      <div
        className={cn(
          "mx-auto transition-all duration-300 px-4 sm:px-6 lg:px-8",
          cinemaMode ? "max-w-[100vw] px-2 sm:px-4" : "max-w-7xl"
        )}
      >
        {/* Top Control & Breadcrumb Header */}
        {!cinemaMode && (
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-2">
            <div className="flex items-center gap-3">
              <Link
                href={detailHref}
                className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                title={`Back to ${media.title} details`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back to Details</span>
              </Link>

              <div className="hidden sm:flex items-center gap-2">
                <Badge variant="accent" size="sm" className="capitalize">
                  {isTv ? "TV Series" : "Movie"}
                </Badge>
                {isTv && (
                  <Badge variant="outline" size="sm">
                    S{seasonNum} E{episodeNum}
                  </Badge>
                )}
                {media.quality && (
                  <Badge variant="secondary" size="sm">
                    {media.quality}
                  </Badge>
                )}
              </div>
            </div>

            {/* Quick Action Toolbar */}
            <div className="flex items-center gap-2">
              {/* Cinema Mode Toggle */}
              <button
                type="button"
                onClick={() => setCinemaMode(!cinemaMode)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                title="Expand Theater View"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                  />
                </svg>
                <span className="hidden sm:inline">Cinema Mode</span>
              </button>

              {/* Reload Stream Button */}
              <button
                type="button"
                onClick={handleReload}
                className="inline-flex items-center justify-center h-8 w-8 rounded-xl border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                title="Reload Stream"
                aria-label="Reload Stream"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>

              {/* Share / Copy Link Button */}
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                title="Copy stream link"
              >
                {copied ? (
                  <>
                    <svg className="h-3.5 w-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                      />
                    </svg>
                    <span>Share</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Master Video Screen Container */}
        <div
          ref={playerRef}
          className={cn(
            "relative w-full overflow-hidden rounded-2xl bg-black border border-white/15 shadow-2xl transition-all duration-300",
            cinemaMode ? "aspect-video max-h-[88vh]" : "aspect-video"
          )}
        >
          {/* Subtle Ambient Backdrop Reflection */}
          {media.backdropUrl && (
            <div className="pointer-events-none absolute inset-0 z-0 opacity-15">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={media.backdropUrl}
                alt=""
                className="h-full w-full object-cover filter blur-xl scale-105"
              />
            </div>
          )}

          {/* Master Streaming Iframe */}
          <iframe
            key={iframeKey}
            src={embedUrl}
            title={displayTitle}
            className="relative z-10 h-full w-full border-0"
            allowFullScreen
            allow="encrypted-media; autoplay; fullscreen; picture-in-picture"
          />
        </div>

        {/* Sub-Player Utility & Server Dock */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-surface-card p-3 sm:px-4">
          {/* Left: Server Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-400">Server:</span>
            <div className="inline-flex rounded-lg bg-white/5 p-0.5 border border-white/10">
              <button
                type="button"
                onClick={() => setServer("vidfast")}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer",
                  server === "vidfast"
                    ? "bg-white text-black"
                    : "text-gray-400 hover:text-white"
                )}
              >
                VidFast (Fast)
              </button>
              <button
                type="button"
                onClick={() => setServer("backup")}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer",
                  server === "backup"
                    ? "bg-white text-black"
                    : "text-gray-400 hover:text-white"
                )}
              >
                Backup Stream
              </button>
            </div>
          </div>

          {/* Right: TV Controls (Previous / Next Episode) */}
          {isTv ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSelectEpisode(episodeNum - 1)}
                disabled={!hasPrevEpisode}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1 text-xs font-semibold transition-colors",
                  hasPrevEpisode
                    ? "bg-white/5 text-white hover:bg-white/15 cursor-pointer"
                    : "bg-white/[0.02] text-gray-600 border-white/[0.04] cursor-not-allowed"
                )}
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Prev Ep</span>
              </button>

              <span className="text-xs font-mono text-gray-300 font-semibold px-1">
                S{seasonNum} : E{episodeNum}
              </span>

              <button
                type="button"
                onClick={() => handleSelectEpisode(episodeNum + 1)}
                disabled={!hasNextEpisode}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition-colors",
                  hasNextEpisode
                    ? "bg-white text-black hover:bg-gray-200 cursor-pointer"
                    : "bg-white/10 text-gray-500 cursor-not-allowed"
                )}
              >
                <span>Next Ep</span>
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="flex h-2 w-2 rounded-full bg-white animate-pulse" />
              <span>Streaming in 1080p / 4K Ultra HD</span>
            </div>
          )}
        </div>

        {/* Main Content Details & Playlist Layout */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Primary Column: Info, Overview, Cast */}
          <div className={cn("space-y-6", isTv ? "lg:col-span-8" : "lg:col-span-12")}>
            {/* Title & Key Metrics */}
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                {isTv
                  ? `${media.title} — Season ${seasonNum}, Episode ${episodeNum}`
                  : media.title}
              </h1>

              {isTv && currentEpisodeData?.name && (
                <p className="text-base sm:text-lg text-gray-200 font-medium">
                  {currentEpisodeData.name}
                </p>
              )}

              {media.tagline && !isTv && (
                <p className="text-sm sm:text-base italic text-gray-400">
                  &ldquo;{media.tagline}&rdquo;
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 pt-1">
                {media.releaseYear && <span>{media.releaseYear}</span>}
                {media.duration && (
                  <>
                    <span>•</span>
                    <span>{media.duration}</span>
                  </>
                )}
                {media.rating > 0 && (
                  <>
                    <span>•</span>
                    <Badge variant="rating" size="sm">
                      ★ {media.rating.toFixed(1)}
                    </Badge>
                  </>
                )}
                {media.genres.length > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-gray-300">{media.genres.join(", ")}</span>
                  </>
                )}
              </div>
            </div>

            {/* Synopsis / Overview */}
            <div className="space-y-2 border-t border-white/[0.08] pt-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                {isTv && currentEpisodeData ? "Episode Synopsis" : "Synopsis"}
              </h2>
              <p
                className={cn(
                  "text-sm sm:text-base text-gray-300 leading-relaxed",
                  !overviewExpanded && "line-clamp-3"
                )}
              >
                {isTv && currentEpisodeData?.overview
                  ? currentEpisodeData.overview
                  : media.overview || "No overview available for this title."}
              </p>
              {((isTv && (currentEpisodeData?.overview?.length ?? 0) > 180) ||
                (!isTv && (media.overview?.length ?? 0) > 180)) && (
                <button
                  type="button"
                  onClick={() => setOverviewExpanded(!overviewExpanded)}
                  className="text-xs font-semibold text-white hover:underline cursor-pointer"
                >
                  {overviewExpanded ? "Show Less" : "Read More"}
                </button>
              )}
            </div>

            {/* Cast Section */}
            {media.cast && media.cast.length > 0 && (
              <div className="space-y-3 border-t border-white/[0.08] pt-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Starring
                </h2>
                <div className="flex flex-wrap gap-2">
                  {media.cast.slice(0, 8).map((actor) => (
                    <div
                      key={actor.id}
                      className="inline-flex items-center gap-2 rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 py-1 text-xs"
                    >
                      <span className="font-semibold text-white">{actor.name}</span>
                      {actor.character && (
                        <span className="text-gray-400 text-[11px]">as {actor.character}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Secondary Column: TV Episodes Playlist Drawer */}
          {isTv && (
            <div className="lg:col-span-4 rounded-2xl border border-white/10 bg-surface-card overflow-hidden">
              {/* Season Selector Bar */}
              <div className="p-4 border-b border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    Episodes
                  </h3>
                  <span className="text-xs text-gray-400 font-mono">
                    {episodes.length} Episodes
                  </span>
                </div>

                {/* Season Dropdown or Pills */}
                {media.seasons && media.seasons.length > 1 ? (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                    {media.seasons.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleSelectSeason(s.seasonNumber)}
                        className={cn(
                          "rounded-lg px-3 py-1 text-xs font-semibold shrink-0 transition-colors cursor-pointer",
                          s.seasonNumber === seasonNum
                            ? "bg-white text-black"
                            : "bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10"
                        )}
                      >
                        Season {s.seasonNumber}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">Season {seasonNum}</p>
                )}
              </div>

              {/* Scrollable Playlist of Episodes */}
              <div className="max-h-[560px] overflow-y-auto divide-y divide-white/[0.06] p-2">
                {loadingSeason ? (
                  <div className="flex flex-col items-center justify-center p-12 space-y-3">
                    <Spinner size="md" />
                    <p className="text-xs text-gray-400">Loading episodes...</p>
                  </div>
                ) : episodes.length > 0 ? (
                  episodes.map((ep) => {
                    const isPlaying = ep.episodeNumber === episodeNum;
                    return (
                      <button
                        key={ep.id}
                        type="button"
                        onClick={() => handleSelectEpisode(ep.episodeNumber)}
                        className={cn(
                          "w-full text-left p-3 rounded-xl transition-all duration-150 flex gap-3 items-start group cursor-pointer",
                          isPlaying
                            ? "bg-white/15 border border-white/20 shadow-md"
                            : "hover:bg-white/5"
                        )}
                      >
                        {/* Episode Still / Index */}
                        <div className="relative aspect-video w-20 shrink-0 rounded-lg overflow-hidden bg-black/60 border border-white/10">
                          {ep.stillUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={ep.stillUrl}
                              alt={ep.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] font-mono text-gray-500">
                              EP {ep.episodeNumber}
                            </div>
                          )}
                          {isPlaying && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <span className="flex h-2 w-2 rounded-full bg-white animate-ping" />
                            </div>
                          )}
                        </div>

                        {/* Episode Information */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span
                              className={cn(
                                "text-xs font-semibold truncate",
                                isPlaying ? "text-white" : "text-gray-200 group-hover:text-white"
                              )}
                            >
                              <span className="font-mono text-gray-400 mr-1">
                                {ep.episodeNumber < 10 ? `0${ep.episodeNumber}` : ep.episodeNumber}.
                              </span>
                              {ep.name}
                            </span>
                            {isPlaying && (
                              <span className="text-[10px] uppercase font-bold tracking-wider text-white bg-white/20 px-1.5 py-0.5 rounded">
                                Playing
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-400">
                            {ep.duration && <span>{ep.duration}</span>}
                            {ep.airDate && <span>• {ep.airDate}</span>}
                          </div>

                          {ep.overview && (
                            <p className="mt-1 line-clamp-2 text-[11px] text-gray-400 leading-normal">
                              {ep.overview}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-xs text-gray-500">
                    No episode details found for this season.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
