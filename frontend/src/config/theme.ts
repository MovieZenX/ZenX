/**
 * Frontend UI/UX Theme & Design Configuration.
 * Centralizes UI appearance tokens, transitions, and streaming player presets.
 */

export const UI_THEME = {
  appName: "StreamVault",
  tagline: "Ultra-Premium Cinematic Streaming",
  colors: {
    background: "#000000",
    surface: "#080808",
    surfaceCard: "#0a0a0a",
    surfaceElevated: "#161616",
    borderSubtle: "rgba(255, 255, 255, 0.06)",
    borderDefault: "rgba(255, 255, 255, 0.10)",
    borderStrong: "rgba(255, 255, 255, 0.22)",
    accentTMDB: "#01b4e4",
  },
  player: {
    aspectRatio: "16/9",
    autoPlay: true,
    defaultServer: "vidfast",
  },
  animations: {
    durationFast: "150ms",
    durationNormal: "250ms",
    durationSlow: "400ms",
  },
} as const;

export const DEFAULT_META = {
  title: UI_THEME.appName,
  description:
    "Discover and stream movies and TV shows with a modern cinematic experience.",
} as const;
