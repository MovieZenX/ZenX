# Video Player & Theater Architecture

## Overview

StreamVault features an ultra-premium, cinematic Watch Theater designed for distraction-free movie and TV streaming, powered by the VidFast API and modern client orchestration.

## Embed URL Specifications

### Movies
- **Endpoint Pattern**: `https://vidfast.vc/movie/{id}?autoPlay=true`
- **Identifier**: TMDB Movie ID (numeric string, e.g., `27205` for Inception)
- **Example**: `https://vidfast.vc/movie/27205?autoPlay=true`

### TV Shows
- **Endpoint Pattern**: `https://vidfast.vc/tv/{id}/{season}/{episode}?autoPlay=true`
- **Identifier**: TMDB TV ID, Season number, Episode number
- **Example**: `https://vidfast.vc/tv/1399/1/1?autoPlay=true`

## Theater Components & Capabilities

### 1. `WatchTheater` Client Component (`src/components/watch/watch-theater.tsx`)
- **Immersive Widescreen Frame**: 16:9 master video frame with ambient backdrop blur reflection at low opacity.
- **Cinema Mode (Theater Expansion)**: One-click toggle that expands the player across the full viewport width and minimizes background distractions (keyboard shortcut: `Escape` to exit).
- **Server / Stream Switcher**: Allows seamless toggling between primary fast streaming (`VidFast`) and backup streaming sources directly beneath the player frame without leaving the page.
- **Quick Controls Bar**:
  - `← Prev Ep` and `Next Ep →` quick navigation with active episode index (`S{season} : E{episode}`).
  - Stream reload button to refresh stalled player instances without page reloads.
  - Share button to copy the direct episode/movie link to the clipboard with temporary visual feedback.
- **TV Episode Playlist Drawer**:
  - Scrollable episode drawer alongside the theater screen.
  - Displays episode thumbnail, episode number, episode name, runtime, air date, and synopsis.
  - Real-time "NOW PLAYING" pulsing indicator on the active episode.
  - Instant client-side episode switching with URL synchronization.
  - Season tabs to toggle between seasons on multi-season series with on-demand API caching (`/api/metadata/tv/[id]/season/[seasonNumber]`).
- **Rich Media Info & Cast**:
  - Full title, tagline, star ratings, genres, and expandable synopsis.
  - Top-billed cast members rendered as clean tactile pills.

### 2. Continuous Recommendations
- Below the theater view, `WatchPage` dynamically displays a "More Like This" carousel powered by `ContentRow` and `ContentCard`, allowing users to discover similar titles seamlessly.

## Security & Reliability Standards
- Enforces strict numeric ID validation (`/^\d+$/`) in compliance with `SECURITY.md`.
- Handles missing or invalid routes gracefully via `notFound()`.
- Zero artificial glow effects and zero emojis throughout the UI.