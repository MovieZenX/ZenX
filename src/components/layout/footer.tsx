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
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-8 sm:pb-12">
        <div className="relative rounded-2xl sm:rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl p-6 sm:p-8 md:p-10 shadow-2xl">

          {/* Top Bar: Brand & Back-to-Top Button */}
          <div className="flex items-center justify-between gap-4 pb-6 sm:pb-8 border-b border-white/[0.06]">
            {/* Brand */}
            <Link
              href={ROUTES.HOME}
              className="group flex items-center gap-3 select-none"
              title="StreamVault Home"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.08] border border-white/15 text-white backdrop-blur-md group-hover:bg-white/[0.12] transition-colors">
                <svg className="h-3.5 w-3.5 fill-white ml-0.5" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-white">
                  StreamVault
                </span>
                <span className="text-[10px] text-white/40 font-mono tracking-wider uppercase">
                  Cinematic Streaming
                </span>
              </div>
            </Link>

            {/* Back to Top Button */}
            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 border border-white/10 hover:border-white/20 text-xs font-medium text-white/70 hover:text-white transition-colors cursor-pointer"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pt-8">
            {/* Brand Summary */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/90 font-mono">
                About
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                A cinematic movie and TV streaming experience with high-fidelity discovery, unified search, continuous playback, and personalized watchlists.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
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

            {/* Discover */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/90 font-mono">
                Discover
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li>
                  <Link href={ROUTES.HOME} className="text-gray-400 hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href={ROUTES.MOVIES} className="text-gray-400 hover:text-white transition-colors">
                    Movies
                  </Link>
                </li>
                <li>
                  <Link href={ROUTES.TV_SHOWS} className="text-gray-400 hover:text-white transition-colors">
                    TV Shows
                  </Link>
                </li>
                <li>
                  <Link href={ROUTES.SEARCH} className="text-gray-400 hover:text-white transition-colors">
                    Search &amp; Explore
                  </Link>
                </li>
              </ul>
            </div>

            {/* Personal */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/90 font-mono">
                Personal
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li>
                  <Link href={ROUTES.LIBRARY} className="text-gray-400 hover:text-white transition-colors">
                    My Library
                  </Link>
                </li>
                <li>
                  <Link href={ROUTES.PROFILE} className="text-gray-400 hover:text-white transition-colors">
                    Account Settings
                  </Link>
                </li>
                <li>
                  <Link href={ROUTES.PROFILE} className="text-gray-400 hover:text-white transition-colors">
                    Playback Preferences
                  </Link>
                </li>
                <li>
                  <Link href={ROUTES.LOGIN} className="text-gray-400 hover:text-white transition-colors">
                    Sign In
                  </Link>
                </li>
              </ul>
            </div>

            {/* Platform Specs */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/90 font-mono">
                Experience
              </h3>
              <ul className="space-y-2 text-xs text-gray-400">
                <li className="flex items-start justify-between">
                  <span>Video Quality</span>
                  <span className="font-mono text-white/70">Up to 4K UHD</span>
                </li>
                <li className="flex items-start justify-between">
                  <span>Dynamic Range</span>
                  <span className="font-mono text-white/70">HDR10 / Dolby</span>
                </li>
                <li className="flex items-start justify-between">
                  <span>Multi-Device</span>
                  <span className="font-mono text-white/70">Cloud Sync</span>
                </li>
                <li className="flex items-start justify-between">
                  <span>Live Index</span>
                  <span className="font-mono text-white/70">TMDB v3</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar: Disclaimer & Legal Copyright */}
          <div className="mt-8 sm:mt-10 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <p className="text-center sm:text-left text-[11px] sm:text-xs text-gray-400/80 leading-relaxed max-w-2xl">
              StreamVault is a content discovery platform. All metadata and media rights belong to their respective copyright holders.
            </p>
            <p className="shrink-0 text-[11px] sm:text-xs text-gray-400/70 font-mono">
              &copy; {currentYear} StreamVault. All rights reserved.
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}
