"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import type { MediaDetail, SeasonItem, EpisodeItem, CastMember } from "@/types/metadata";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { ContentRow } from "@/components/media/content-row";
import { ContentCard } from "@/components/media/content-card";
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
  const [seriesOverviewExpanded, setSeriesOverviewExpanded] = useState<boolean>(false);
  const [ambilight, setAmbilight] = useState<boolean>(true);
  const [lightsOff, setLightsOff] = useState<boolean>(false);
  const [episodeSearch, setEpisodeSearch] = useState<string>("");
  const [isReloading, setIsReloading] = useState<boolean>(false);
  const [episodeViewMode, setEpisodeViewMode] = useState<"grid" | "carousel">("carousel");

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
  const carouselRef = useRef<HTMLDivElement>(null);
  const activeEpisodeRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (direction: "left" | "right") => {
    if (!carouselRef.current) return;
    const scrollAmount = carouselRef.current.clientWidth * 0.75;
    carouselRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // Sync state with props during render without triggering cascading effect renders
  const [prevProps, setPrevProps] = useState({
    season: initialSeasonNumber,
    episode: initialEpisodeNumber,
  });

  if (
    prevProps.season !== initialSeasonNumber ||
    prevProps.episode !== initialEpisodeNumber
  ) {
    setPrevProps({
      season: initialSeasonNumber,
      episode: initialEpisodeNumber,
    });
    setSeasonNum(initialSeasonNumber);
    setEpisodeNum(initialEpisodeNumber);
    if (initialSeasonData && !seasonsCache[initialSeasonData.seasonNumber]) {
      setSeasonsCache((prev) => ({
        ...prev,
        [initialSeasonData.seasonNumber]: initialSeasonData,
      }));
    }
  }

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

  const currentSeasonData =
    seasonsCache[seasonNum] ??
    (initialSeasonData?.seasonNumber === seasonNum ? initialSeasonData : null);
  const episodes: EpisodeItem[] = currentSeasonData?.episodes ?? [];
  const currentEpisodeData = episodes.find((ep) => ep.episodeNumber === episodeNum);
  const positiveSeasons = (media.seasons || []).filter((s) => s.seasonNumber > 0);

  const totalEpisodesInSeason = episodes.length;
  const hasPrevEpisode = isTv && episodeNum > 1;
  const hasNextEpisode =
    isTv && (totalEpisodesInSeason > 0 ? episodeNum < totalEpisodesInSeason : true);

  const filteredEpisodes = episodeSearch.trim()
    ? episodes.filter(
        (ep) =>
          (ep.name || "").toLowerCase().includes(episodeSearch.toLowerCase()) ||
          ep.episodeNumber.toString() === episodeSearch.trim() ||
          (ep.overview || "").toLowerCase().includes(episodeSearch.toLowerCase())
      )
    : episodes;

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

      // Smoothly scroll back up to player if it is scrolled out of view
      if (playerRef.current) {
        const rect = playerRef.current.getBoundingClientRect();
        if (rect.top < -50 || rect.bottom < 150) {
          playerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    },
    [media.id, seasonNum]
  );

  // Auto-scroll carousel to active episode when in carousel mode
  useEffect(() => {
    if (episodeViewMode === "carousel" && activeEpisodeRef.current && carouselRef.current) {
      activeEpisodeRef.current.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [episodeNum, seasonNum, episodeViewMode]);

  // Switch season
  const handleSelectSeason = (newSeasonNum: number) => {
    setSeasonNum(newSeasonNum);
    setEpisodeSearch("");
    handleSelectEpisode(1, newSeasonNum);
  };

  // Synchronize Cinema Mode with Document Body (hides floating navbar & auto-scrolls to top)
  useEffect(() => {
    if (cinemaMode) {
      document.body.setAttribute("data-cinema-mode", "true");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      document.body.removeAttribute("data-cinema-mode");
    }

    return () => {
      document.body.removeAttribute("data-cinema-mode");
    };
  }, [cinemaMode]);

  // Keyboard navigation for theater
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === "Escape") {
        if (lightsOff) setLightsOff(false);
        if (cinemaMode) setCinemaMode(false);
      }
      if (e.key === "c" || e.key === "C") {
        setCinemaMode((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cinemaMode, lightsOff]);

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

  // Reload player iframe with animation
  const handleReload = () => {
    setIsReloading(true);
    setIframeKey((prev) => prev + 1);
    setTimeout(() => setIsReloading(false), 700);
  };

  const detailHref = isTv ? `/tv/${media.id}` : `/movie/${media.id}`;
  const displayTitle = isTv
    ? `${media.title} — Season ${seasonNum}, Episode ${episodeNum}${
        currentEpisodeData?.name ? `: ${currentEpisodeData.name}` : ""
      }`
    : media.title;

  const scorePercent = Math.round((media.rating || 0) * 10);
  const voteCountFormatted = (media.voteCount || 0).toLocaleString("en-US");

  return (
    <div
      suppressHydrationWarning
      className={cn(
        "transition-all duration-300 min-h-screen text-white relative",
        cinemaMode ? "bg-black pt-4 sm:pt-6 pb-12" : "pt-20 sm:pt-24 pb-20"
      )}
    >
      {/* Lights Off Pitch-Black Curtain Overlay */}
      {lightsOff && (
        <div
          className="fixed inset-0 z-40 bg-black/95 backdrop-blur-md transition-opacity duration-500 cursor-pointer"
          onClick={() => setLightsOff(false)}
          title="Click to turn lights back ON"
          aria-hidden="true"
        />
      )}


      <div
        suppressHydrationWarning
        className={cn(
          "w-full transition-all duration-300 mx-auto",
          cinemaMode
            ? "max-w-[100vw] xl:max-w-[96vw] 2xl:max-w-[94vw] px-2 sm:px-4"
            : "max-w-[1720px] px-3 sm:px-6 md:px-8 lg:px-10 xl:px-12",
          lightsOff && "relative z-50"
        )}
      >
        {/* Top Control & Breadcrumb Header */}
        {!cinemaMode && (
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-2">
            <div className="flex items-center gap-3">
              <Link
                href={detailHref}
                className="btn-clean-secondary inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-medium text-gray-200 transition-colors cursor-pointer"
                title={`Back to ${media.title} details`}
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                  <Badge variant="quality" size="sm">
                    {media.quality}
                  </Badge>
                )}
              </div>
            </div>

            {/* Top Shortcut Badges */}
            <div className="hidden md:flex items-center gap-2 text-xs text-white/40 font-mono">
              <span>Press Esc to exit Cinema/Lights Off</span>
            </div>
          </div>
        )}

        {/* Master Video Screen Container with Dynamic Ambilight Glow */}
        <div className="relative">
          {/* Ambient Theater Ambilight Aura Reflection */}
          {ambilight && media.backdropUrl && (
            <div
              className={cn(
                "pointer-events-none absolute -inset-6 sm:-inset-16 z-0 transition-opacity duration-700 ease-out",
                lightsOff ? "opacity-65" : "opacity-35 sm:opacity-45"
              )}
              aria-hidden="true"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={media.backdropUrl}
                alt=""
                className="h-full w-full object-cover filter blur-3xl sm:blur-[110px] scale-105 transform-gpu"
              />
            </div>
          )}

          {/* Master Video Frame */}
          <div
            ref={playerRef}
            className={cn(
              "relative z-10 w-full overflow-hidden rounded-2xl bg-black border shadow-2xl transition-all duration-300",
              cinemaMode
                ? "aspect-video max-h-[88vh] border-white/25 ring-1 ring-white/10 shadow-[0_24px_70px_rgba(0,0,0,0.95)]"
                : "aspect-video border-white/15"
            )}
          >
            {/* Subtle Glass Reflection */}
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
        </div>

        {/* Futuristic Floating HUD Controls Bar */}
        <div className="mt-4 relative z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/15 bg-black/85 hover:bg-black/95 backdrop-blur-2xl p-2.5 sm:px-4 shadow-[0_8px_32px_rgba(0,0,0,0.7)] transition-all duration-200">
          {/* Left: Server Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              <span className="hidden sm:inline">Server:</span>
            </span>
            <div className="inline-flex rounded-xl bg-white/[0.04] p-1 border border-white/10 shadow-inner">
              <button
                type="button"
                onClick={() => setServer("vidfast")}
                className={cn(
                  "rounded-lg px-2.5 sm:px-3 py-1 text-xs font-semibold transition-all cursor-pointer",
                  server === "vidfast"
                    ? "bg-white text-black shadow-sm"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                VidFast (Fast)
              </button>
              <button
                type="button"
                onClick={() => setServer("backup")}
                className={cn(
                  "rounded-lg px-2.5 sm:px-3 py-1 text-xs font-semibold transition-all cursor-pointer",
                  server === "backup"
                    ? "bg-white text-black shadow-sm"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                Backup Stream
              </button>
            </div>
          </div>

          {/* Center: TV Navigation or Resolution badge */}
          {isTv ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => handleSelectEpisode(episodeNum - 1)}
                disabled={!hasPrevEpisode}
                className={cn(
                  "inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-medium transition-all active:scale-95",
                  hasPrevEpisode
                    ? "bg-white/10 hover:bg-white/20 text-white border border-white/15 cursor-pointer"
                    : "bg-white/[0.02] text-gray-600 border border-white/5 cursor-not-allowed"
                )}
                title="Previous Episode"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline">Prev</span>
              </button>

              <span className="text-xs font-mono text-white font-bold px-2.5 py-1 rounded-xl bg-white/15 border border-white/25 shadow-sm">
                S{seasonNum} : E{episodeNum}
              </span>

              <button
                type="button"
                onClick={() => handleSelectEpisode(episodeNum + 1)}
                disabled={!hasNextEpisode}
                className={cn(
                  "inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all active:scale-95",
                  hasNextEpisode
                    ? "bg-white text-black hover:bg-gray-200 cursor-pointer shadow-sm"
                    : "bg-white/[0.02] text-gray-600 border border-white/5 cursor-not-allowed"
                )}
                title="Next Episode"
              >
                <span>Next</span>
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2 text-xs text-gray-400 font-medium">
              <span>Cinematic 4K Ultra HD • Dolby Audio</span>
            </div>
          )}

          {/* Right: Ambient & Theater Controls */}
          <div className="flex items-center gap-1.5">
            {/* Ambilight Toggle */}
            {media.backdropUrl && (
              <button
                type="button"
                onClick={() => setAmbilight(!ambilight)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium transition-all active:scale-95 cursor-pointer border",
                  ambilight
                    ? "bg-white/15 text-white border-white/30"
                    : "bg-white/[0.04] text-white/50 border-white/10 hover:text-white"
                )}
                title={ambilight ? "Turn Ambilight glow OFF" : "Turn Ambilight glow ON"}
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <span className="hidden xl:inline">Glow</span>
              </button>
            )}

            {/* Lights Off Mode Toggle */}
            <button
              type="button"
              onClick={() => setLightsOff(!lightsOff)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium transition-all active:scale-95 cursor-pointer border",
                lightsOff
                  ? "bg-white text-black border-white shadow-sm font-semibold"
                  : "bg-white/[0.04] text-white/70 border-white/10 hover:text-white hover:bg-white/10"
              )}
              title={lightsOff ? "Turn Lights ON (Esc)" : "Turn Lights OFF for theater immersion"}
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              <span className="hidden sm:inline">{lightsOff ? "Lights On" : "Lights Off"}</span>
            </button>

            {/* Cinema Mode Toggle */}
            <button
              type="button"
              onClick={() => setCinemaMode(!cinemaMode)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium transition-all active:scale-95 cursor-pointer border",
                cinemaMode
                  ? "bg-white text-black border-white shadow-md font-semibold"
                  : "bg-white/[0.04] text-white/70 border-white/10 hover:text-white hover:bg-white/10"
              )}
              title={cinemaMode ? "Exit Cinema Mode (Esc or C)" : "Expand Cinema View (C)"}
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                />
              </svg>
              <span className="hidden sm:inline">Cinema</span>
            </button>

            {/* Reload Stream Button */}
            <button
              type="button"
              onClick={handleReload}
              className="inline-flex items-center justify-center h-8 w-8 rounded-xl bg-white/[0.04] hover:bg-white/15 border border-white/10 text-white/80 hover:text-white transition-all active:scale-95 cursor-pointer"
              title="Reload Stream"
              aria-label="Reload Stream"
            >
              <svg
                className={cn("h-3.5 w-3.5 transition-transform duration-700", isReloading && "rotate-180")}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
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
              className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium bg-white/[0.04] hover:bg-white/15 border border-white/10 text-white/80 hover:text-white transition-all active:scale-95 cursor-pointer"
              title="Copy stream link"
            >
              {copied ? (
                <>
                  <svg className="h-3.5 w-3.5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-emerald-400 font-medium">Copied</span>
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
                  <span className="hidden sm:inline">Share</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 1. EPISODES PLAYLIST SECTION (Directly Below Player) */}
        {isTv && (
          <section
            className="mt-6 sm:mt-8 rounded-xl sm:rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-3 sm:p-6 shadow-2xl relative overflow-hidden space-y-3.5 sm:space-y-5"
            aria-label="Episodes Playlist"
          >
            {/* Subtle top rim accent */}
            <div className="pointer-events-none absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Header: Title, Season Selector, Search & View Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 border-b border-white/[0.08] pb-3 sm:pb-4">
              {/* Left: Heading & Season Selector Tabs */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h2 className="text-sm sm:text-lg font-bold text-white tracking-tight">
                    Episodes
                  </h2>
                  <span className="text-[10px] sm:text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/10">
                    {episodes.length} Ep
                  </span>
                </div>

                {/* Season Tabs */}
                {positiveSeasons.length > 1 ? (
                  <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto pb-1 scrollbar-hide max-w-full">
                    {positiveSeasons.map((s) => {
                      const isCurrent = s.seasonNumber === seasonNum;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => handleSelectSeason(s.seasonNumber)}
                          className={cn(
                            "rounded-full px-2.5 sm:px-3.5 py-0.5 sm:py-1 text-[11px] sm:text-xs font-semibold shrink-0 transition-all cursor-pointer",
                            isCurrent
                              ? "bg-white text-black shadow-md font-bold"
                              : "bg-white/[0.05] border border-white/10 text-gray-300 hover:text-white hover:bg-white/[0.12]"
                          )}
                        >
                          Season {s.seasonNumber}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <span className="text-xs text-gray-400 font-medium px-1">
                    Season {seasonNum}
                  </span>
                )}
              </div>

              {/* Right: Search & View Controls */}
              <div className="flex items-center gap-2 self-stretch lg:self-auto w-full lg:w-auto">
                {/* Search in Season */}
                <div className="relative flex-1 lg:w-56">
                  <input
                    type="text"
                    value={episodeSearch}
                    onChange={(e) => setEpisodeSearch(e.target.value)}
                    placeholder="Search episode..."
                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-white/30"
                  />
                  {episodeSearch && (
                    <button
                      type="button"
                      onClick={() => setEpisodeSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs cursor-pointer"
                      title="Clear search"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Row / Grid Toggle (Row by default) */}
                <div className="inline-flex items-center p-0.5 rounded-xl bg-white/[0.04] border border-white/10 shrink-0">
                  <button
                    type="button"
                    onClick={() => setEpisodeViewMode("carousel")}
                    className={cn(
                      "flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg text-[11px] sm:text-xs font-medium transition-all cursor-pointer",
                      episodeViewMode === "carousel"
                        ? "bg-white text-black font-semibold shadow-sm"
                        : "text-gray-400 hover:text-white"
                    )}
                    title="Row / Carousel View"
                  >
                    <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M4 6h4v12H4zm6 0h4v12h-4zm6 0h4v12h-4z" />
                    </svg>
                    <span>Row</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEpisodeViewMode("grid")}
                    className={cn(
                      "flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg text-[11px] sm:text-xs font-medium transition-all cursor-pointer",
                      episodeViewMode === "grid"
                        ? "bg-white text-black font-semibold shadow-sm"
                        : "text-gray-400 hover:text-white"
                    )}
                    title="Grid View"
                  >
                    <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z" />
                    </svg>
                    <span>Grid</span>
                  </button>
                </div>

                {/* Carousel Navigation Arrows */}
                {episodeViewMode === "carousel" && (
                  <div className="hidden sm:flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => scrollCarousel("left")}
                      className="h-7 w-7 rounded-lg bg-white/[0.05] hover:bg-white/[0.15] border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer"
                      aria-label="Previous episodes"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollCarousel("right")}
                      className="h-7 w-7 rounded-lg bg-white/[0.05] hover:bg-white/[0.15] border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer"
                      aria-label="Next episodes"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Episodes List / Grid / Carousel */}
            {loadingSeason ? (
              <div className="flex flex-col items-center justify-center py-12 sm:py-16 space-y-3">
                <Spinner size="md" />
                <p className="text-xs text-gray-400">Loading season {seasonNum} episodes...</p>
              </div>
            ) : filteredEpisodes.length > 0 ? (
              episodeViewMode === "grid" ? (
                /* Grid View: 2 columns on mobile, 3 on lg, 4 on xl */
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-2 sm:gap-4">
                  {filteredEpisodes.map((ep) => {
                    const isPlaying = ep.episodeNumber === episodeNum;
                    return (
                      <div
                        key={ep.id}
                        ref={isPlaying ? activeEpisodeRef : undefined}
                      >
                        <EpisodeCard
                          ep={ep}
                          isPlaying={isPlaying}
                          onSelect={() => handleSelectEpisode(ep.episodeNumber)}
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Carousel / Row View: compact w-36 xs:w-44 on mobile, w-64+ on desktop */
                <div
                  ref={carouselRef}
                  className="flex gap-2.5 sm:gap-4 overflow-x-auto scrollbar-hide snap-x pb-2 pt-0.5"
                >
                  {filteredEpisodes.map((ep) => {
                    const isPlaying = ep.episodeNumber === episodeNum;
                    return (
                      <div
                        key={ep.id}
                        ref={isPlaying ? activeEpisodeRef : undefined}
                        className="w-36 xs:w-44 sm:w-64 md:w-72 lg:w-80 shrink-0 snap-start"
                      >
                        <EpisodeCard
                          ep={ep}
                          isPlaying={isPlaying}
                          onSelect={() => handleSelectEpisode(ep.episodeNumber)}
                        />
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              <div className="py-10 text-center text-xs text-gray-500 space-y-2">
                <p>No episodes found matching &ldquo;{episodeSearch}&rdquo;.</p>
                <button
                  type="button"
                  onClick={() => setEpisodeSearch("")}
                  className="text-xs text-white underline hover:no-underline cursor-pointer"
                >
                  Clear filter
                </button>
              </div>
            )}
          </section>
        )}

        {/* 2. MEDIA DETAILS & INTEL SECTION (Directly Below Episodes) */}
        <section className="mt-10 space-y-6 min-w-0" aria-label="Media Details">
            {/* 1. Official TMDB Score & Verification Header Card */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-3.5 sm:p-5 shadow-2xl relative overflow-hidden min-w-0">
              {/* Subtle top rim highlight with TMDB cyan accent */}
              <div className="pointer-events-none absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#01b4e4]/60 to-transparent" />

              <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 min-w-0">
                {/* TMDB Badge + Score Gauge + Community Votes */}
                <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
                  {/* Signature TMDB Circular Progress Ring */}
                  <div className="relative h-11 w-11 sm:h-13 sm:w-13 shrink-0 rounded-full bg-black/80 p-0.5 sm:p-1 border border-white/15 flex items-center justify-center shadow-lg">
                    <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 36 36">
                      <path
                        className="text-white/10"
                        strokeWidth="3.2"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className={cn(
                          scorePercent >= 70
                            ? "text-[#01b4e4]"
                            : scorePercent >= 50
                            ? "text-amber-400"
                            : "text-rose-400"
                        )}
                        strokeDasharray={`${scorePercent}, 100`}
                        strokeWidth="3.2"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center font-black text-[11px] sm:text-xs text-white">
                      {scorePercent > 0 ? `${scorePercent}%` : "NR"}
                    </div>
                  </div>

                  {/* Score & Community Rating */}
                  <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className="px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-black tracking-widest bg-[#01b4e4] text-black uppercase shadow-sm shrink-0">
                        TMDB
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-white tracking-wide truncate">
                        {scorePercent >= 75
                          ? "Universal Acclaim"
                          : scorePercent >= 60
                          ? "Favorable Audience"
                          : "TMDB Community Score"}
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-gray-400 truncate">
                      Based on <span className="text-white font-medium">{voteCountFormatted}</span> reviews
                      {media.rating > 0 && (
                        <span className="ml-1 text-gray-400">
                          (★ {media.rating.toFixed(1)} / 10)
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* External TMDB Link + Clean Status Pill */}
                <div className="flex items-center gap-2 shrink-0">
                  {media.status && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-semibold bg-white/5 border border-white/10 text-gray-300">
                      {media.status}
                    </span>
                  )}
                  <a
                    href={`https://www.themoviedb.org/${isTv ? "tv" : "movie"}/${media.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl px-2.5 sm:px-3 py-1.5 text-xs font-semibold bg-white/5 hover:bg-white/15 border border-white/10 text-white/90 hover:text-white transition-all cursor-pointer group"
                    title="View official entry on TMDB"
                  >
                    <span>TMDB Entry</span>
                    <svg
                      className="h-3 w-3 text-gray-400 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* 2. Main Title, Subtitle, Tagline & Badges */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <h1 className="text-2xl sm:text-3xl xl:text-4xl font-black tracking-tight text-white leading-tight">
                  {media.title}
                </h1>

                {isTv && (
                  <div className="flex flex-wrap items-center gap-2 text-sm sm:text-base text-gray-200">
                    <span className="font-bold text-white px-2 py-0.5 rounded bg-white/10 text-xs sm:text-sm">
                      Season {seasonNum} • Episode {episodeNum}
                    </span>
                    {currentEpisodeData?.name && (
                      <span className="text-gray-300 font-medium">
                        &ldquo;{currentEpisodeData.name}&rdquo;
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Tagline */}
              {media.tagline && (
                <blockquote className="border-l-2 border-white/30 pl-3 py-0.5 text-xs sm:text-sm italic text-gray-400">
                  &ldquo;{media.tagline}&rdquo;
                </blockquote>
              )}

              {/* Genre Badges */}
              {media.genres.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {media.genres.map((genre) => (
                    <Link
                      key={genre}
                      href={`/search?q=${encodeURIComponent(genre)}`}
                      className="rounded-lg px-2.5 py-1 text-[11px] font-medium bg-white/[0.04] hover:bg-white/[0.10] border border-white/10 text-gray-300 hover:text-white transition-colors"
                    >
                      {genre}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* 3. TMDB Technical & Production Bento Grid (4 Cards) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
              {/* Card 1: Production Status */}
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-2.5 sm:p-3 space-y-1 hover:border-white/20 transition-colors min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Status</p>
                <p className="text-xs sm:text-sm font-bold text-white break-words leading-snug">
                  {media.status || (isTv ? "Returning Series" : "Released")}
                </p>
                <p className="text-[10px] text-gray-400 break-words leading-tight">
                  {isTv ? "Television Series" : "Motion Picture"}
                </p>
              </div>

              {/* Card 2: Release Date */}
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-2.5 sm:p-3 space-y-1 hover:border-white/20 transition-colors min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Release Date</p>
                <p className="text-xs sm:text-sm font-bold text-white break-words leading-snug">
                  {media.releaseDate || media.releaseYear || "N/A"}
                </p>
                <p className="text-[10px] text-gray-400 break-words leading-tight">Worldwide Premiere</p>
              </div>

              {/* Card 3: Scope / Runtime */}
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-2.5 sm:p-3 space-y-1 hover:border-white/20 transition-colors min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {isTv ? "Series Content" : "Duration"}
                </p>
                <p className="text-xs sm:text-sm font-bold text-white break-words leading-snug">
                  {isTv
                    ? `${media.numberOfSeasons || 1} Seasons • ${media.numberOfEpisodes || episodes.length} Ep`
                    : media.duration || (media.runtimeMinutes ? `${media.runtimeMinutes} min` : "Feature")}
                </p>
                <p className="text-[10px] text-gray-400 break-words leading-tight">
                  {isTv ? `Streaming S${seasonNum} E${episodeNum}` : "Full Runtime"}
                </p>
              </div>

              {/* Card 4: Quality & Specs */}
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-2.5 sm:p-3 space-y-1 hover:border-white/20 transition-colors min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Master Audio & Video</p>
                <p className="text-xs sm:text-sm font-bold text-white break-words leading-snug">
                  {media.quality || "4K"} UHD • HDR10
                </p>
                <p className="text-[10px] text-gray-400 break-words leading-tight">Dolby 5.1 • Stereo</p>
              </div>
            </div>

            {/* 4. Dual Narrative Section: Active Episode Intel + Series Lore */}
            {isTv ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start">
                {/* Active Episode Intel Box */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-white">
                        Episode {episodeNum} Intel
                      </span>
                      {currentEpisodeData?.voteAverage ? (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20">
                          ★ {currentEpisodeData.voteAverage.toFixed(1)} TMDB
                        </span>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      {currentEpisodeData?.airDate && (
                        <span>Aired {currentEpisodeData.airDate}</span>
                      )}
                      {currentEpisodeData?.duration && (
                        <>
                          <span>•</span>
                          <span>{currentEpisodeData.duration}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {currentEpisodeData?.name || `Episode ${episodeNum}`}
                  </h3>

                  <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                    {currentEpisodeData?.overview || "No overview available for this episode."}
                  </p>

                  {/* Quick Next Episode Action */}
                  {hasNextEpisode && (
                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleSelectEpisode(episodeNum + 1)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                      >
                        <span>Next Episode (EP {episodeNum + 1})</span>
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                {/* Series Overview & Background Lore */}
                {media.overview && (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                        Series Storyline & Lore
                      </h2>
                      <span className="text-[10px] text-gray-500 font-mono">TMDB Synopsis</span>
                    </div>

                    <p
                      className={cn(
                        "text-sm text-gray-300 leading-relaxed",
                        !seriesOverviewExpanded && "line-clamp-3"
                      )}
                    >
                      {media.overview}
                    </p>

                    {(media.overview?.length ?? 0) > 200 && (
                      <button
                        type="button"
                        onClick={() => setSeriesOverviewExpanded(!seriesOverviewExpanded)}
                        className="text-xs font-semibold text-white hover:underline cursor-pointer pt-1"
                      >
                        {seriesOverviewExpanded ? "Show Less" : "Read Full Storyline"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Movie Synopsis */
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Movie Synopsis & Storyline
                  </h2>
                  <span className="text-[10px] text-gray-500 font-mono">TMDB Synopsis</span>
                </div>
                <p
                  className={cn(
                    "text-sm sm:text-base text-gray-300 leading-relaxed",
                    !overviewExpanded && "line-clamp-4"
                  )}
                >
                  {media.overview || "No overview available for this title."}
                </p>
                {(media.overview?.length ?? 0) > 200 && (
                  <button
                    type="button"
                    onClick={() => setOverviewExpanded(!overviewExpanded)}
                    className="text-xs font-semibold text-white hover:underline cursor-pointer pt-1"
                  >
                    {overviewExpanded ? "Show Less" : "Read Full Synopsis"}
                  </button>
                )}
              </div>
            )}

            {/* 5. Rich TMDB Top Billed Cast Showcase (Real Portraits) */}
            {media.cast && media.cast.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
                      Starring & Top Billed Cast
                    </h2>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
                      {media.cast.length} Cast Members
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono">TMDB Credits</span>
                </div>

                {/* Horizontal Scrollable Tray of Rich Portrait Cards */}
                <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-2 pt-1 snap-x">
                  {media.cast.slice(0, 10).map((actor) => (
                    <CastPortraitCard key={actor.id} actor={actor} />
                  ))}
                </div>
              </div>
            )}

            {/* 6. TMDB Legal & Attribution Ribbon */}
            <div className="flex items-center justify-between text-[11px] text-gray-500 pt-2 border-t border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-400">The Movie Database (TMDB)</span>
                <span>•</span>
                <span>Community Metadata & Artwork</span>
              </div>
              <span className="font-mono text-[10px]">ID: {media.id}</span>
            </div>
        </section>

        {/* 3. RECOMMENDED "MORE LIKE THIS" SECTION (Directly Below Details) */}
        {media.similar && media.similar.length > 0 && (
          <section className="mt-12 pt-8 border-t border-white/[0.08]" aria-label="More Like This">
            <ContentRow
              title="More Like This"
              subtitle={`Recommended titles similar to ${media.title}`}
              actionHref={`/search?q=${encodeURIComponent(media.genres[0] || media.title)}`}
              actionLabel="View More"
            >
              {media.similar.map((item) => (
                <div
                  key={item.id}
                  className="w-32 sm:w-40 md:w-44 lg:w-48 xl:w-52 shrink-0 snap-start"
                >
                  <ContentCard
                    id={item.id}
                    title={item.title}
                    posterUrl={item.posterUrl}
                    contentType={item.contentType}
                    releaseYear={item.releaseYear}
                    rating={item.rating}
                    quality={item.quality}
                  />
                </div>
              ))}
            </ContentRow>
          </section>
        )}
      </div>
    </div>
  );
}

function CastPortraitCard({ actor }: { actor: CastMember }) {
  const [imgError, setImgError] = useState(false);
  const initials =
    (actor?.name || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "NA";

  return (
    <div className="w-20 sm:w-24 md:w-28 shrink-0 min-w-0 flex flex-col items-center text-center group snap-start">
      <div className="relative h-16 w-16 sm:h-18 sm:w-18 md:h-20 md:w-20 rounded-full p-[1.5px] bg-gradient-to-b from-white/20 via-white/5 to-transparent group-hover:from-[#01b4e4]/70 transition-all duration-300 shadow-lg mb-2">
        <div className="h-full w-full rounded-full overflow-hidden bg-black/60">
          {actor.profileUrl && !imgError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={actor.profileUrl}
              alt={actor.name || "Cast member"}
              loading="lazy"
              onError={() => setImgError(true)}
              className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-white/[0.06] text-xs text-gray-300 font-bold">
              {initials}
            </div>
          )}
        </div>
      </div>
      <span
        className="text-[11px] sm:text-xs font-semibold text-white line-clamp-1 group-hover:text-gray-200 transition-colors w-full"
        title={actor.name || ""}
      >
        {actor.name || "Unknown"}
      </span>
      <span
        className="text-[10px] sm:text-[11px] text-gray-400 line-clamp-1 mt-0.5 w-full"
        title={actor.character || ""}
      >
        {actor.character ? `as ${actor.character}` : "Cast"}
      </span>
    </div>
  );
}

function EpisodeCard({
  ep,
  isPlaying,
  onSelect,
}: {
  ep: EpisodeItem;
  isPlaying: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group relative flex flex-col text-left rounded-xl sm:rounded-2xl border transition-all duration-200 overflow-hidden cursor-pointer min-w-0 w-full",
        isPlaying
          ? "bg-white/[0.12] border-white/50 ring-2 ring-white/60 shadow-xl shadow-white/5"
          : "border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/30 hover:shadow-lg"
      )}
      aria-label={`Play Episode ${ep.episodeNumber}: ${ep.name}`}
    >
      {/* 16:9 Thumbnail Header */}
      <div className="relative aspect-video w-full overflow-hidden bg-black/80">
        {/* Episode Index Badge */}
        <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-10 px-1.5 sm:px-2 py-0.5 rounded sm:rounded-md bg-black/85 backdrop-blur-md border border-white/20 text-[9px] sm:text-[11px] font-mono font-bold text-white shadow-sm">
          EP {ep.episodeNumber < 10 ? `0${ep.episodeNumber}` : ep.episodeNumber}
        </div>

        {/* Duration Badge */}
        {ep.duration && (
          <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 z-10 px-1 sm:px-2 py-0.5 rounded bg-black/85 backdrop-blur-md border border-white/15 text-[8px] sm:text-[10px] font-mono text-white/90">
            {ep.duration}
          </div>
        )}

        {/* Thumbnail Image */}
        {ep.stillUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={ep.stillUrl}
            alt={ep.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-white/[0.03] text-gray-500 font-mono text-[10px] sm:text-xs font-bold">
            EPISODE {ep.episodeNumber}
          </div>
        )}

        {/* Playing Overlay: Live Animated Equalizer */}
        {isPlaying ? (
          <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px] flex flex-col items-center justify-center gap-1 sm:gap-2">
            <div className="flex items-end gap-[2px] sm:gap-[3px] h-3.5 w-3.5 sm:h-5 sm:w-5">
              <span className="w-0.5 sm:w-1 bg-white rounded-full equalizer-bar-1" />
              <span className="w-0.5 sm:w-1 bg-white rounded-full equalizer-bar-2" />
              <span className="w-0.5 sm:w-1 bg-white rounded-full equalizer-bar-3" />
              <span className="w-0.5 sm:w-1 bg-white rounded-full equalizer-bar-4" />
            </div>
            <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-white bg-white/25 border border-white/40 px-1.5 sm:px-2.5 py-0.5 rounded-full shadow-sm">
              Playing
            </span>
          </div>
        ) : (
          /* Hover Play Button Overlay */
          <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="h-7 w-7 sm:h-10 sm:w-10 rounded-full bg-white/25 backdrop-blur-md border border-white/40 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <svg className="h-3 w-3 sm:h-4 sm:w-4 fill-white ml-0.5" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Episode Content Info */}
      <div className="p-2 sm:p-3 md:p-4 flex-1 flex flex-col justify-between space-y-1 sm:space-y-2">
        <div className="space-y-0.5 sm:space-y-1">
          <div className="flex items-start justify-between gap-1.5">
            <h4
              className={cn(
                "text-[11px] sm:text-xs md:text-sm font-semibold leading-tight line-clamp-1 transition-colors",
                isPlaying ? "text-white font-bold" : "text-gray-200 group-hover:text-white"
              )}
            >
              <span className="text-gray-400 font-mono mr-1">
                {ep.episodeNumber < 10 ? `0${ep.episodeNumber}` : ep.episodeNumber}.
              </span>
              {ep.name || `Episode ${ep.episodeNumber}`}
            </h4>
          </div>

          {ep.airDate && (
            <p className="text-[9px] sm:text-[11px] text-gray-400 font-mono">
              Aired {ep.airDate}
            </p>
          )}

          {ep.overview ? (
            <p className="text-[10px] sm:text-xs text-gray-400 line-clamp-1 sm:line-clamp-2 leading-snug pt-0.5">
              {ep.overview}
            </p>
          ) : (
            <p className="text-[10px] sm:text-xs text-gray-500 italic pt-0.5">
              No episode synopsis.
            </p>
          )}
        </div>
      </div>
    </button>
  );
}
