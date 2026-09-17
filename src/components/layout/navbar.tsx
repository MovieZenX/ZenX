"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback, Suspense } from "react";
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
  { label: "Search", href: ROUTES.SEARCH, matchType: "exact" },
  { label: "Library", href: ROUTES.LIBRARY, matchType: "prefix" },
];

function NavbarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isLoading, logout } = useAuth();

  // Track scroll position to toggle backdrop blur and solid background
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

  const isLinkActive = (link: NavLinkItem) => {
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
  };

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-black/90 backdrop-blur-md border-b border-white/[0.08] shadow-lg shadow-black/30 py-3"
          : "bg-gradient-to-b from-black/90 via-black/40 to-transparent py-4 sm:py-5"
      )}
    >
      <nav
        aria-label="Main Navigation"
        className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
      >
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link
            href={ROUTES.HOME}
            className="group flex items-center gap-2.5 text-xl font-extrabold tracking-tight text-white transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-white rounded-lg"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white">
              <svg
                className="h-4 w-4 text-black fill-current ml-0.5"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
            <span className="text-white">
              StreamVault
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <ul className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const active = isLinkActive(link);
              return (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className={cn(
                      "rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all duration-150",
                      "focus-visible:outline-2 focus-visible:outline-white",
                      active
                        ? "bg-white/15 text-white font-semibold shadow-sm"
                        : "text-gray-400 hover:bg-white/[0.07] hover:text-white"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Right Area: Search & Auth/Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Search Button */}
          <Link
            href={ROUTES.SEARCH}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-400 transition-colors",
              "hover:bg-white/15 hover:text-white focus-visible:outline-2 focus-visible:outline-white"
            )}
            aria-label="Search movies and TV shows"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </Link>

          {/* Auth State in Navbar */}
          {isLoading ? (
            <div className="h-9 w-20 rounded-xl bg-white/5 animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-2">
              <Link
                href={ROUTES.PROFILE}
                className={cn(
                  "flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-1 sm:px-3 sm:py-1.5 text-sm text-gray-400 transition-colors",
                  "hover:bg-white/15 hover:text-white focus-visible:outline-2 focus-visible:outline-white",
                  pathname === ROUTES.PROFILE && "border-white/30 bg-white/10 text-white"
                )}
                aria-label={`User profile for ${user.username}`}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-xs font-bold text-black">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline font-medium text-xs max-w-[100px] truncate">
                  {user.username}
                </span>
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                title="Sign Out"
                aria-label="Sign Out"
                className="hidden sm:flex h-9 items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2.5 text-xs text-gray-500 transition-colors hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-300 focus-visible:outline-2 focus-visible:outline-white cursor-pointer"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <Link
              href={ROUTES.LOGIN}
              className="flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-semibold text-black transition-all hover:bg-gray-200 active:scale-95 focus-visible:outline-2 focus-visible:outline-white"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Sign In</span>
            </Link>
          )}

          {/* Mobile Menu Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-400 hover:bg-white/15 hover:text-white md:hidden cursor-pointer focus-visible:outline-2 focus-visible:outline-white"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Dropdown */}
      {mobileOpen && (
        <div className="border-b border-white/10 bg-black/95 backdrop-blur-xl px-4 py-4 md:hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <ul className="flex flex-col gap-1.5">
            {NAV_LINKS.map((link) => {
              const active = isLinkActive(link);
              return (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-white/15 text-white font-semibold"
                        : "text-gray-400 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <span>{link.label}</span>
                    {active && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
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
                      "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
                      pathname === ROUTES.PROFILE
                        ? "bg-white/15 text-white font-semibold"
                        : "text-gray-400 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-xs font-bold text-black">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-white font-medium">{user.username}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer"
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
                    className="flex items-center justify-center rounded-xl border border-white/10 bg-white/5 py-2.5 text-center text-sm font-medium text-white hover:bg-white/10 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href={ROUTES.REGISTER}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center rounded-xl bg-white py-2.5 text-center text-sm font-semibold text-black hover:bg-gray-200 transition-colors"
                  >
                    Register
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
        <header className="fixed top-0 z-50 w-full bg-black/80 backdrop-blur-md py-4 sm:py-5 border-b border-white/[0.05]">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="h-8 w-32 rounded-lg bg-white/10 animate-pulse" />
            <div className="h-8 w-24 rounded-lg bg-white/10 animate-pulse" />
          </div>
        </header>
      }
    >
      <NavbarContent />
    </Suspense>
  );
}
