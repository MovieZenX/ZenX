import Link from "next/link";
import { ROUTES } from "@/config";

/**
 * Production-ready global footer with navigation categories, disclaimer, and copyright.
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-white/[0.08] bg-surface-card/60 backdrop-blur-md">
      <div className="w-full px-4 py-12 sm:px-6 md:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:gap-12">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-2">
            <Link
              href={ROUTES.HOME}
              className="flex items-center gap-2 text-xl font-bold tracking-tight text-white transition-opacity hover:opacity-90"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white">
                <svg className="h-3.5 w-3.5 fill-current text-black ml-0.5" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
              <span>StreamVault</span>
            </Link>
            <p className="max-w-sm text-sm text-gray-400 leading-relaxed">
              A cinematic movie and TV streaming experience with high-fidelity discovery, continuous playback, and personalized watchlists.
            </p>
          </div>

          {/* Navigation Col */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-300">
              Discover
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
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
                  Search & Explore
                </Link>
              </li>
            </ul>
          </div>

          {/* Personal Col */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-300">
              Personal
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
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
            </ul>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="mt-10 border-t border-white/[0.06] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>
            StreamVault is a content discovery and streaming platform. All metadata and media rights belong to their respective owners.
          </p>
          <p className="shrink-0">
            © {currentYear} StreamVault. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
