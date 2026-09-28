"use client";

import Link from "next/link";
import { ROUTES } from "@/config";

/**
 * Minimalist Monochrome Glassmorphic Global Footer.
 * Pure frosted glass, invisible seamless atmospheric blend, zero glow, zero colored blinking badges.
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative mt-auto w-full overflow-hidden" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>

      {/* Invisible Seamless Atmospheric Fade (No harsh borders, no glow) */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black pointer-events-none" />

      {/* Main Glass Deck Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-8 sm:pt-14 pb-20 sm:pb-12">
        <div className="relative rounded-2xl sm:rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl p-4.5 sm:p-8 md:p-10 shadow-2xl">

          {/* Top Bar: Brand & Back-to-Top Button */}
          <div className="flex items-center justify-between gap-4 pb-5 sm:pb-8 border-b border-white/[0.06]">
            {/* Brand */}
            <Link
              href={ROUTES.HOME}
              className="group flex items-center gap-2.5 sm:gap-3 select-none"
              title="StreamVault Home"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.08] border border-white/15 text-white backdrop-blur-md group-hover:bg-white/[0.12] transition-colors">
                <svg className="h-3.5 w-3.5 fill-white ml-0.5" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-sm sm:text-base font-bold tracking-tight text-white">
                  StreamVault
                </span>
                <span className="text-[9px] sm:text-[10px] text-white/40 font-mono tracking-wider uppercase">
                  Cinematic Streaming
                </span>
              </div>
            </Link>

            {/* Back to Top Button */}
            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 border border-white/10 hover:border-white/20 text-xs font-medium text-white/70 hover:text-white transition-colors cursor-pointer touch-manipulation"
              aria-label="Scroll to top of page"
            >
              <span>Back to top</span>
              <svg
                className="h-3.5 w-3.5 stroke-current fill-none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
              </svg>
            </button>
          </div>

          {/* Navigation Columns */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8 pt-5 sm:pt-8">
            {/* Brand Summary */}
            <div className="space-y-2.5 sm:space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/90 font-mono">
                About
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                A cinematic movie and TV streaming experience with high-fidelity discovery, unified search, continuous playback, and personalized watchlists.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] text-[10px] font-mono text-white/60">
                  TMDB Live API
                </span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] text-[10px] font-mono text-white/60">
                  4K UHD
                </span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] text-[10px] font-mono text-white/60">
                  Ad-Free
                </span>
              </div>
            </div>

            {/* Discover & Personal: Side-by-side 2-col on mobile, separate columns on desktop */}
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:col-span-2">
              {/* Discover */}
              <div className="space-y-2 sm:space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white/90 font-mono">
                  Discover
                </h3>
                <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                  <li>
                    <Link href={ROUTES.HOME} className="inline-block py-0.5 text-gray-400 hover:text-white transition-colors touch-manipulation">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link href={ROUTES.MOVIES} className="inline-block py-0.5 text-gray-400 hover:text-white transition-colors touch-manipulation">
                      Movies
                    </Link>
                  </li>
                  <li>
                    <Link href={ROUTES.TV_SHOWS} className="inline-block py-0.5 text-gray-400 hover:text-white transition-colors touch-manipulation">
                      TV Shows
                    </Link>
                  </li>
                  <li>
                    <Link href={ROUTES.SEARCH} className="inline-block py-0.5 text-gray-400 hover:text-white transition-colors touch-manipulation">
                      Search &amp; Explore
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Personal */}
              <div className="space-y-2 sm:space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white/90 font-mono">
                  Personal
                </h3>
                <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                  <li>
                    <Link href={ROUTES.LIBRARY} className="inline-block py-0.5 text-gray-400 hover:text-white transition-colors touch-manipulation">
                      My Library
                    </Link>
                  </li>
                  <li>
                    <Link href={ROUTES.PROFILE} className="inline-block py-0.5 text-gray-400 hover:text-white transition-colors touch-manipulation">
                      Account Settings
                    </Link>
                  </li>
                  <li>
                    <Link href={ROUTES.PROFILE} className="inline-block py-0.5 text-gray-400 hover:text-white transition-colors touch-manipulation">
                      Playback Preferences
                    </Link>
                  </li>
                  <li>
                    <Link href={ROUTES.LOGIN} className="inline-block py-0.5 text-gray-400 hover:text-white transition-colors touch-manipulation">
                      Login
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Platform Specs */}
            <div className="space-y-2 sm:space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/90 font-mono">
                Experience
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 text-xs text-gray-400">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 sm:p-0 rounded-lg sm:rounded-none bg-white/[0.03] sm:bg-transparent border border-white/[0.05] sm:border-0">
                  <span className="text-[10px] sm:text-xs text-gray-500 sm:text-gray-400">Video Quality</span>
                  <span className="font-mono text-white/80 font-medium text-[11px] sm:text-xs">Up to 4K UHD</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 sm:p-0 rounded-lg sm:rounded-none bg-white/[0.03] sm:bg-transparent border border-white/[0.05] sm:border-0">
                  <span className="text-[10px] sm:text-xs text-gray-500 sm:text-gray-400">Dynamic Range</span>
                  <span className="font-mono text-white/80 font-medium text-[11px] sm:text-xs">HDR10 / Dolby</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 sm:p-0 rounded-lg sm:rounded-none bg-white/[0.03] sm:bg-transparent border border-white/[0.05] sm:border-0">
                  <span className="text-[10px] sm:text-xs text-gray-500 sm:text-gray-400">Multi-Device</span>
                  <span className="font-mono text-white/80 font-medium text-[11px] sm:text-xs">Cloud Sync</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 sm:p-0 rounded-lg sm:rounded-none bg-white/[0.03] sm:bg-transparent border border-white/[0.05] sm:border-0">
                  <span className="text-[10px] sm:text-xs text-gray-500 sm:text-gray-400">Live Index</span>
                  <span className="font-mono text-white/80 font-medium text-[11px] sm:text-xs">TMDB v3</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar: Disclaimer & Legal Copyright */}
          <div className="mt-6 sm:mt-10 pt-5 sm:pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
            <p className="text-center sm:text-left text-[11px] sm:text-xs text-gray-400/80 leading-relaxed max-w-2xl">
              StreamVault is a content discovery platform. All metadata and media rights belong to their respective copyright holders.
            </p>
            <p className="shrink-0 text-center sm:text-right text-[11px] sm:text-xs text-gray-400/70 font-mono">
              &copy; {currentYear} StreamVault. All rights reserved.
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}
