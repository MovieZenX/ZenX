"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/config";
import { useAuth } from "@/components/providers/auth-provider";

interface NavLinkItem {
  label: string;
  href: string;
  matchType?: "exact" | "prefix" | "query";
  queryKey?: string;
  queryValue?: string;
}

const NAV_LINKS: NavLinkItem[] = [
  { label: "Home", href: ROUTES.HOME, matchType: "exact" },
  { label: "Movies", href: ROUTES.MOVIES, matchType: "query", queryKey: "type", queryValue: "movie" },
  { label: "TV Shows", href: ROUTES.TV_SHOWS, matchType: "query", queryKey: "type", queryValue: "tv" },
  { label: "Library", href: ROUTES.LIBRARY, matchType: "prefix" },
];

function NavbarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isLoading, logout } = useAuth();

  // Sliding Nav Indicator State
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState<{
    left: number;
    width: number;
    opacity: number;
  }>({ left: 0, width: 0, opacity: 0 });
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Track scroll position to subtly deepen frosted blur
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Keyboard escape key to close mobile menu
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileOpen) {
        setMobileOpen(false);
      }
    },
    [mobileOpen]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const isLinkActive = useCallback(
    (link: NavLinkItem) => {
      if (link.matchType === "exact") {
        return pathname === link.href && (!searchParams.get("type") || link.href !== "/search");
      }
      if (link.matchType === "query" && link.queryKey && link.queryValue) {
        return pathname === "/search" && searchParams.get(link.queryKey) === link.queryValue;
      }
      if (link.matchType === "prefix") {
        return pathname.startsWith(link.href);
      }
      return pathname === link.href;
    },
    [pathname, searchParams]
  );

  // Determine active index
  const activeIndex = NAV_LINKS.findIndex((link) => isLinkActive(link));

  // Update sliding indicator position
  const updateIndicator = useCallback(
    (index: number | null) => {
      const targetIndex = index !== null ? index : activeIndex;
      if (targetIndex !== -1 && itemRefs.current[targetIndex]) {
        const el = itemRefs.current[targetIndex]!;
        setIndicatorStyle({
          left: el.offsetLeft,
          width: el.offsetWidth,
          opacity: 1,
        });
      } else {
        setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
      }
    },
    [activeIndex]
  );

  useEffect(() => {
    updateIndicator(hoveredIdx);
  }, [activeIndex, hoveredIdx, updateIndicator]);

  useEffect(() => {
    const handleResize = () => updateIndicator(hoveredIdx);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateIndicator, hoveredIdx]);

  return (
    <header className="fixed top-3 sm:top-4 inset-x-0 z-50 flex flex-col items-center px-3 sm:px-6 pointer-events-none transition-all duration-400 ease-out">
      {/* Compact Floating Soft Glass Capsule */}
      <nav
        aria-label="Main Navigation"
        className={cn(
          "pointer-events-auto transition-all duration-300 ease-out select-none",
          "w-fit max-w-[95vw] sm:max-w-2xl rounded-full",
          "flex items-center justify-between gap-2 sm:gap-3 px-3 sm:px-3.5 h-10",
          "border border-white/10 backdrop-blur-md shadow-lg shadow-black/20",
          scrolled
            ? "bg-black/50 border-white/15"
            : "bg-black/25 hover:bg-black/35"
        )}
      >
        {/* Left: Brand Circular Logo Badge */}
        <Link
          href={ROUTES.HOME}
          className="group flex items-center gap-2 rounded-full focus-visible:outline-2 focus-visible:outline-white select-none shrink-0"
          title="StreamVault Home"
        >
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-white group-hover:bg-white/15 transition-colors">
            <svg
              className="h-2.5 w-2.5 fill-current ml-0.5"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <span className="hidden md:inline-block text-[11.5px] font-semibold tracking-tight text-white/90 group-hover:text-white transition-colors">
            StreamVault
          </span>
        </Link>

        {/* Center: Sliding Navigation Pill Cluster */}
        <ul
          onMouseLeave={() => setHoveredIdx(null)}
          className="relative hidden md:flex items-center gap-0.5 h-7"
        >
          {/* Soft Sliding Active Indicator */}
          <div
            className="pointer-events-none absolute top-0 bottom-0 rounded-full bg-white/10 transition-all duration-200 ease-out"
            style={{
              transform: `translateX(${indicatorStyle.left}px)`,
              width: `${indicatorStyle.width}px`,
              opacity: indicatorStyle.opacity,
            }}
          />

          {NAV_LINKS.map((link, idx) => {
            const active = isLinkActive(link);
            return (
              <li
                key={link.label}
                ref={(el) => {
                  itemRefs.current[idx] = el;
                }}
                onMouseEnter={() => setHoveredIdx(idx)}
                className="relative z-10 flex items-center h-7"
              >
                <Link
                  href={link.href}
                  className={cn(
                    "rounded-full px-2.5 h-7 flex items-center justify-center text-[11.5px] font-medium tracking-normal transition-colors duration-200 select-none whitespace-nowrap",
                    "focus-visible:outline-2 focus-visible:outline-white",
                    active ? "text-white" : "text-white/60 hover:text-white"
                  )}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Right Dock: Search, Auth, and Mobile Menu */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Compact Quick Search */}
          <Link
            href={ROUTES.SEARCH}
            className={cn(
              "group relative flex items-center gap-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors",
              "focus-visible:outline-2 focus-visible:outline-white",
              "px-2.5 h-7 text-[11px] font-medium"
            )}
            aria-label="Search movies and TV shows"
            title="Search"
          >
            <svg
              className="h-3 w-3 transition-transform duration-200 group-hover:scale-105"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <span className="hidden sm:inline">Search</span>
          </Link>

          {/* Auth State */}
          {isLoading ? (
            <div className="h-6 w-14 rounded-full bg-white/10 animate-pulse" />
          ) : user ? (
            /* Authenticated User Capsule */
            <div className="flex items-center gap-0.5">
              <Link
                href={ROUTES.PROFILE}
                className={cn(
                  "group flex items-center gap-1.5 rounded-full p-0.5 sm:pr-2.5 h-7 transition-colors",
                  "hover:bg-white/10 text-white/80 hover:text-white",
                  "focus-visible:outline-2 focus-visible:outline-white",
                  pathname === ROUTES.PROFILE && "bg-white/10 text-white"
                )}
                aria-label={`User profile for ${user.username}`}
                title="Profile & Settings"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-black text-[9.5px] font-bold">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline text-[11px] font-medium max-w-[65px] truncate">
                  {user.username}
                </span>
              </Link>

              <button
                type="button"
                onClick={() => logout()}
                title="Sign Out"
                aria-label="Sign Out"
                className="flex h-7 w-7 items-center justify-center rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </div>
          ) : (
            /* Unauthenticated: Soft minimalist links */
            <div className="flex items-center gap-0.5">
              <Link
                href={ROUTES.LOGIN}
                className="rounded-full px-2.5 h-7 flex items-center justify-center text-[10.5px] font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                Login
              </Link>
              <Link
                href={ROUTES.REGISTER}
                className="rounded-full px-3 h-6.5 flex items-center justify-center text-[10.5px] font-medium text-white bg-white/15 hover:bg-white/20 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Menu Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white md:hidden cursor-pointer focus-visible:outline-2 focus-visible:outline-white transition-colors touch-manipulation"
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
          >
            <svg
              className="h-4 w-4 transition-transform duration-200"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Dropdown Pill */}
      {mobileOpen && (
        <div className="pointer-events-auto mt-2 w-full max-w-sm rounded-2xl border border-white/10 bg-black/85 backdrop-blur-2xl shadow-2xl p-3 md:hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => {
              const active = isLinkActive(link);
              return (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors touch-manipulation",
                      active
                        ? "bg-white/15 text-white font-semibold"
                        : "text-white/70 hover:bg-white/10 hover:text-white active:bg-white/15"
                    )}
                  >
                    <span>{link.label}</span>
                    {active && <span className="h-1.5 w-1.5 rounded-full bg-white shadow-sm" />}
                  </Link>
                </li>
              );
            })}

            <li className="pt-2 mt-1 border-t border-white/10">
              {user ? (
                <div className="space-y-1.5">
                  <Link
                    href={ROUTES.PROFILE}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors touch-manipulation",
                      pathname === ROUTES.PROFILE
                        ? "bg-white/20 text-white font-semibold"
                        : "text-gray-300 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-bold text-black shadow-sm">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-white text-sm font-medium">{user.username}</div>
                      <div className="text-[11px] text-gray-400">{user.email}</div>
                    </div>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer touch-manipulation"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href={ROUTES.LOGIN}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center rounded-full border border-white/15 bg-white/5 py-2 text-center text-xs font-medium text-white hover:bg-white/10 active:bg-white/15 transition-colors touch-manipulation"
                  >
                    Login
                  </Link>
                  <Link
                    href={ROUTES.REGISTER}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center rounded-full bg-white py-2 text-center text-xs font-semibold text-black hover:bg-gray-200 active:bg-gray-300 transition-colors touch-manipulation"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}

/**
 * Main application navigation bar wrapped in Suspense for useSearchParams.
 */
export function Navbar() {
  return (
    <Suspense
      fallback={
        <header className="fixed top-3 sm:top-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
          <div className="w-full max-w-2xl h-11 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 animate-pulse" />
        </header>
      }
    >
      <NavbarContent />
    </Suspense>
  );
}
