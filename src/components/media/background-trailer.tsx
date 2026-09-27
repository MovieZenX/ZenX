"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface YTPlayerOptions {
  videoId: string;
  playerVars?: {
    autoplay?: 0 | 1;
    mute?: 0 | 1;
    controls?: 0 | 1;
    disablekb?: 0 | 1;
    fs?: 0 | 1;
    modestbranding?: 0 | 1;
    rel?: 0 | 1;
    iv_load_policy?: 1 | 3;
    playsinline?: 0 | 1;
    origin?: string;
  };
  events?: {
    onReady?: (event: { target: YTPlayerInstance }) => void;
    onStateChange?: (event: { data: number; target: YTPlayerInstance }) => void;
    onError?: () => void;
  };
}

interface YTPlayerInstance {
  playVideo: () => void;
  pauseVideo: () => void;
  mute: () => void;
  unMute: () => void;
  setVolume: (volume: number) => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  destroy: () => void;
}

interface YTNamespace {
  Player: new (element: HTMLElement | string, options: YTPlayerOptions) => YTPlayerInstance;
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export interface BackgroundTrailerProps {
  backdropUrl: string | null;
  trailerKey?: string | null;
  title: string;
}

/**
 * Full-Page Immersive Atmospheric Backdrop & Background Trailer Component.
 *
 * Professional Clean Player Architecture:
 * - Powered by the official YouTube IFrame Player API with strict TypeScript typing.
 * - Completely hides YouTube pause/play overlays and bezel animations.
 * - Click-shield overlay prevents accidental clicks or taps from pausing the video.
 * - Video is ONLY revealed after 2.2s of confirmed continuous playback.
 * - If paused or turned off, video immediately transitions to opacity-0 so
 *   the pause icon is NEVER visible on screen.
 * - Seamless automatic looping without playlist UI.
 * - Simple monochrome floating controls without distracting green colors.
 */
export function BackgroundTrailer({
  backdropUrl,
  trailerKey,
  title,
}: BackgroundTrailerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YTPlayerInstance | null>(null);
  const [showTrailer, setShowTrailer] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // Initialize YouTube IFrame Player API
  useEffect(() => {
    if (!trailerKey) return;

    let isMounted = true;
    let fadeTimer: NodeJS.Timeout | null = null;

    // Load YouTube IFrame API script tag if not present
    if (typeof window !== "undefined" && !window.YT) {
      const existingTag = document.getElementById("yt-iframe-api-script");
      if (!existingTag) {
        const tag = document.createElement("script");
        tag.id = "yt-iframe-api-script";
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
      }
    }

    const createPlayer = () => {
      if (!isMounted || !containerRef.current || !window.YT?.Player) return;

      try {
        // Destroy existing player instance if re-initializing
        if (playerRef.current) {
          try {
            playerRef.current.destroy();
          } catch {}
          playerRef.current = null;
        }

        playerRef.current = new window.YT.Player(containerRef.current, {
          videoId: trailerKey,
          playerVars: {
            autoplay: 1,
            mute: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            rel: 0,
            iv_load_policy: 3,
            playsinline: 1,
            origin: typeof window !== "undefined" ? window.location.origin : undefined,
          },
          events: {
            onReady: (event: { target: YTPlayerInstance }) => {
              if (!isMounted) return;
              event.target.mute();
              event.target.playVideo();
            },
            onStateChange: (event: { data: number; target: YTPlayerInstance }) => {
              if (!isMounted) return;
              // 1 = PLAYING
              if (event.data === 1) {
                // Wait 2.2s for any initial YouTube bezel overlay to finish fading out completely
                // before revealing the video on screen!
                if (fadeTimer) clearTimeout(fadeTimer);
                fadeTimer = setTimeout(() => {
                  if (isMounted) {
                    setIsVideoPlaying(true);
                  }
                }, 2200);
              } else if (event.data === 2) {
                // 2 = PAUSED -> Instantly hide video so YouTube pause icon is never visible
                if (fadeTimer) clearTimeout(fadeTimer);
                setIsVideoPlaying(false);
              } else if (event.data === 0) {
                // 0 = ENDED -> Seamlessly loop from start
                if (fadeTimer) clearTimeout(fadeTimer);
                setIsVideoPlaying(false);
                try {
                  event.target.seekTo(0, true);
                  event.target.playVideo();
                } catch {}
              }
            },
            onError: () => {
              if (isMounted) setIsVideoPlaying(false);
            },
          },
        });
      } catch (err) {
        console.warn("[BackgroundTrailer] Error initializing YouTube player:", err);
      }
    };

    if (typeof window !== "undefined" && window.YT?.Player) {
      createPlayer();
    } else {
      const prevHandler = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevHandler) prevHandler();
        createPlayer();
      };
    }

    return () => {
      isMounted = false;
      if (fadeTimer) clearTimeout(fadeTimer);
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {}
        playerRef.current = null;
      }
    };
  }, [trailerKey]);

  const toggleMute = useCallback(() => {
    if (!playerRef.current) return;
    try {
      if (isMuted) {
        playerRef.current.unMute();
        playerRef.current.setVolume(100);
        setIsMuted(false);
      } else {
        playerRef.current.mute();
        setIsMuted(true);
      }
    } catch {}
  }, [isMuted]);

  const toggleTrailer = useCallback(() => {
    setShowTrailer((prev) => {
      const next = !prev;
      if (!next) {
        setIsVideoPlaying(false);
        try {
          playerRef.current?.pauseVideo();
          playerRef.current?.mute();
        } catch {}
        setIsMuted(true);
      } else {
        try {
          playerRef.current?.playVideo();
        } catch {}
      }
      return next;
    });
  }, []);

  const hasTrailer = Boolean(trailerKey);

  // Trailer is ONLY visible when user enabled it AND video is confirmed actively playing with bezel faded out
  const isTrailerActive = showTrailer && hasTrailer && isVideoPlaying;

  return (
    <>
      {/* Full-Page Immersive Atmospheric Canvas */}
      <div
        className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-black"
        aria-hidden="true"
      >
        {/* Layer 1: Base Backdrop Image (Always present, smoothly hidden only when video is actively rolling) */}
        {backdropUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={backdropUrl}
            alt=""
            className={`absolute inset-0 h-full w-full object-cover object-top transform-gpu scale-105 transition-opacity duration-500 ease-out ${
              isTrailerActive ? "opacity-0 pointer-events-none" : "opacity-80 sm:opacity-90"
            }`}
          />
        ) : (
          <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-gray-900/40 via-surface to-background" />
        )}

        {/* Layer 2: Ambient Background Video Trailer (Solid 100% opacity, completely hidden when paused) */}
        {hasTrailer && (
          <div
            className={`absolute inset-0 overflow-hidden pointer-events-none transition-opacity duration-500 ease-out ${
              isTrailerActive ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <div
              ref={containerRef}
              title={`${title} Background Trailer`}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.78vh] scale-[1.35] pointer-events-none border-0"
            />
            {/* Click-shield overlay: captures all background clicks so YouTube iframe is never paused by mouse clicks */}
            <div className="absolute inset-0 z-10 pointer-events-auto bg-transparent select-none cursor-default" />
          </div>
        )}

        {/* Layer 3: Directional Protection & Atmospheric Scrims */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Subtle top navbar scrim */}
          <div className="absolute inset-x-0 top-0 h-20 sm:h-24 bg-gradient-to-b from-black/30 via-black/10 to-transparent" />

          {/* Left text-protection gradient: keeps hero text/badges razor sharp */}
          <div className="absolute inset-y-0 left-0 w-full sm:w-4/5 lg:w-3/5 bg-gradient-to-r from-black/95 via-black/75 to-transparent" />

          {/* Downward progressive atmospheric blend: softly deepens towards bottom of page */}
          <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black via-black/80 via-50% to-transparent" />

          {/* Subtle dark tint */}
          <div className="absolute inset-0 bg-black/15" />
        </div>
      </div>

      {/* Floating Simple Monochrome Trailer & Sound Controller (Bottom-Right) */}
      {hasTrailer && (
        <div
          className="absolute top-20 right-4 sm:fixed sm:top-auto sm:bottom-8 sm:right-8 z-40 pointer-events-auto flex items-center gap-1.5 p-1.5 bg-black/85 hover:bg-black/95 backdrop-blur-xl border border-white/15 hover:border-white/25 rounded-full shadow-2xl transition-all duration-200"
          role="toolbar"
          aria-label="Trailer controls"
        >
          {/* Trailer ON / OFF Toggle */}
          <button
            type="button"
            onClick={toggleTrailer}
            aria-label={showTrailer ? "Turn background trailer OFF" : "Turn background trailer ON"}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 cursor-pointer ${
              showTrailer
                ? "bg-white/20 text-white border border-white/30 shadow-sm"
                : "bg-white/[0.04] text-white/40 hover:text-white/70 border border-transparent"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <span>Trailer</span>
            <span
              className={`text-[10px] font-mono tracking-wide px-1.5 py-0.5 rounded-full ${
                showTrailer ? "bg-white/20 text-white font-semibold" : "bg-white/5 text-white/40"
              }`}
            >
              {showTrailer ? "ON" : "OFF"}
            </span>
          </button>

          {/* Sound Toggle (only when trailer is ON) */}
          {showTrailer && (
            <button
              type="button"
              onClick={toggleMute}
              aria-label={isMuted ? "Unmute trailer audio" : "Mute trailer audio"}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 cursor-pointer ${
                !isMuted
                  ? "bg-white/20 text-white border border-white/30"
                  : "bg-white/[0.04] text-white/70 hover:text-white border border-white/10"
              }`}
            >
              {isMuted ? (
                <>
                  <svg
                    className="w-3.5 h-3.5 text-white/70"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                    />
                  </svg>
                  <span className="hidden sm:inline">Unmute</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-3.5 h-3.5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                    />
                  </svg>
                  <span className="hidden sm:inline font-medium">Sound On</span>
                </>
              )}
            </button>
          )}
        </div>
      )}
    </>
  );
}
