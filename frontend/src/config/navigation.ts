/**
 * Frontend Navigation & Routing Configuration.
 * Defines all route paths, navigation bar menus, user profile dropdown items, and footer links.
 */

export const ROUTES = {
  HOME: "/",
  SEARCH: "/search",
  MOVIES: "/search?type=movie",
  TV_SHOWS: "/search?type=tv",
  MOVIE: "/movie", // /movie/[id]
  TV: "/tv", // /tv/[id]
  WATCH: "/watch", // /watch/[id]
  LIBRARY: "/library",
  PROFILE: "/profile",
  LOGIN: "/login",
  REGISTER: "/register",
} as const;

export interface NavItem {
  label: string;
  href: string;
  badge?: string;
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  { label: "Home", href: ROUTES.HOME },
  { label: "Movies", href: ROUTES.MOVIES },
  { label: "TV Shows", href: ROUTES.TV_SHOWS },
  { label: "Search", href: ROUTES.SEARCH },
  { label: "Library", href: ROUTES.LIBRARY },
];

export const USER_MENU_ITEMS: NavItem[] = [
  { label: "Profile & Settings", href: ROUTES.PROFILE },
  { label: "My Watchlist", href: ROUTES.LIBRARY },
];
