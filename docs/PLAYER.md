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
- **Immersive Widescreen Frame with Dynamic Ambilight**: 16:9 master video frame with an atmospheric Ambilight backdrop aura (`filter: blur(110px)`) projecting movie backdrop colors behind the screen. Toggleable via Ambilight button.
- **"Lights Off" Theater Immersion Mode**: One-click mode (or `Esc` key) that plunges surrounding page elements into deep pitch-black (`bg-black/95 backdrop-blur-md`), focusing 100% of viewer attention on the glowing cinema screen with Ambilight backlighting.
- **Cinema Mode (Theater Expansion)**: One-click toggle that expands the player across the full viewport width and minimizes distractions (keyboard shortcut: `Escape` to exit).
- **Futuristic Floating HUD Controls Bar**:
  - Docked frosted glass toolbar (`bg-black/85 backdrop-blur-2xl border border-white/15`) directly under the player.
  - Multi-server toggle pills (`VidFast (Fast)` and `Backup Stream`).
  - Ambilight Aura toggle (`Glow ON/OFF`).
  - Lights Off mode toggle (`Lights On/Off`).
  - Quick episode navigation (`Prev`, `S{season} : E{episode}`, `Next`).
  - Animated 360-degree stream reload button.
  - Link sharing with instant clipboard copy confirmation.
- **Netflix-Style Interactive Episode Drawer**:
  - Scrollable episode drawer alongside the theater screen.
  - Interactive season tabs and instant in-season search/filter input.
  - 16:9 thumbnails with episode runtime tags and hover zoom effects.
  - Real-time animated 4-bar equalizer (`equalizer-bar-1` through `4`) and "STREAMING" badge on the active playing episode.
  - Instant client-side episode switching with URL synchronization.
  - On-demand season API caching (`/api/metadata/tv/[id]/season/[seasonNumber]`).
- **Rich TMDB Media Info Hub & Cast**:
  - **TMDB Verified Score & Community Hub**: Signature TMDB circular score gauge ring (color-coded approval percentage), verified vote count counter, series production status pill, and direct external TMDB entry button (`https://www.themoviedb.org/...`).
  - **4-Card Production Bento Grid**: Compact frosted cards showing Production Status (Television Series / Motion Picture), Original Premiere Date, Series Scope / Feature Runtime, and Master Audio & Video specs (4K UHD HDR10, Dolby 5.1).
  - **Dual Narrative Intel Architecture**: Active Episode Intel Card (episode air date, runtime, TMDB episode rating, synopsis, and quick next episode navigation) alongside full Series Lore & Storyline (`media.overview`) with expandable controls so the theater info column never appears empty.
  - **Visual Cast Showcase**: High-definition circular actor portraits (`profileUrl`) with glowing ring hover effects, character attribution (`as {character}`), and initials fallback.
  - **Clickable Genre Chips & Attribution**: Direct genre search integration and official TMDB metadata attribution footer.

### 2. Continuous Recommendations
- Below the theater view, `WatchPage` dynamically displays a "More Like This" carousel powered by `ContentRow` and `ContentCard`, allowing users to discover similar titles seamlessly.

## Security & Reliability Standards
- Enforces strict numeric ID validation (`/^\d+$/`) in compliance with `SECURITY.md`.
- Handles missing or invalid routes gracefully via `notFound()`.
- Clean monochrome styling with high performance hardware-accelerated animations.