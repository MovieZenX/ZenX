# Tasks

## Phase 1 - Project Setup

- [x] Initialize repository
- [x] Configure frontend
- [x] Configure backend
- [x] Configure environment variables
- [x] Setup database
- [x] Setup routing

## Phase 2 - Core UI

- [x] Navbar
- [x] Home page
- [x] Movie cards
- [x] Hero section
- [x] Search page
- [x] Movie details page

## Phase 3 - API Integration

- [x] Integrate metadata API
- [ ] Integrate existing streaming API
- [ ] Implement source handling
- [ ] Implement error handling

## Phase 4 - Production Home Page

- [x] Production Hero section with real TMDB metadata & runtime
- [x] Trending Today carousel with multi-type support
- [x] Popular Movies carousel
- [x] Popular TV Series carousel
- [x] Now In Theaters & Recent Releases carousel
- [x] Curated Genre Spotlight (Action & Adventure)
- [x] Explore by Genre category grid
- [x] Streaming Platforms section with official TMDB logos and provider filtering (primeshows.org style)
- [x] Popular by Platform interactive section with network & series/movies switchers (primeshows.org style)
- [x] Fault-tolerant section fetching (`Promise.allSettled`)
- [x] Cinematic loading skeletons (`loading.tsx`)
- [x] SEO & OpenGraph metadata
- [x] Cross-device responsive & accessibility verification

## Phase 5 - Production Search Experience

- [x] Full search input with debouncing, Enter execution, Escape clear, and reset
- [x] Multi-type filtering (All, Movies, TV Shows)
- [x] Bidirectional URL query synchronization (`q`, `type`, `page`)
- [x] Discovery empty state with popular search suggestions and categories
- [x] No results state with user query feedback
- [x] Pagination controls with boundary guards and state preservation
- [x] Responsive 2-to-6 column grid across mobile, tablet, laptop, and desktop
- [x] Loading skeleton grid and sanitized error handling
- [x] SEO & OpenGraph search page metadata
- [x] Search unit tests and cross-device browser verification
- [x] Mobile ergonomics, iOS viewport zoom prevention (16px base font), and edge-to-edge touch gestures

## Phase 6 - Production Movie & TV Details Pages

- [x] Production movie details page with real TMDB metadata, tagline, runtime, and ratings
- [x] Production TV details page with seasons, episodes, air dates, and status
- [x] Interactive Season/Episode viewer (`TvEpisodesViewer`) with dynamic season switching
- [x] Dedicated TV season API proxy (`/api/metadata/tv/[id]/season/[seasonNumber]`)
- [x] Reusable cast presentation component (`CastList`) with avatar fallbacks
- [x] Similar content rows linking properly to respective detail routes
- [x] Route validation guarding against invalid/malformed IDs with graceful 404 handling
- [x] Detail loading skeletons (`loading.tsx`) for movie and TV routes
- [x] Dynamic SEO & OpenGraph metadata generation for content detail pages
- [x] Unit test suite (`tests/details.test.ts`) and browser verification across viewports

## Phase 7 - Production Authentication & User Sessions

- [x] Prisma User schema update with `password_hash` column
- [x] Secure password hashing using bcrypt (12 salt rounds via `bcryptjs`)
- [x] AES-256-GCM authenticated encrypted session tokens with 30-day lifetime
- [x] HTTP-only, SameSite=Lax, Secure cookie session management (`streamvault_session`)
- [x] User registration API (`POST /api/auth/register`) with strict input validation
- [x] User login API (`POST /api/auth/login`) with sanitized generic error responses
- [x] User logout API (`POST /api/auth/logout`) and current user endpoint (`GET /api/auth/me`)
- [x] Auth Provider with server-side pre-hydration in RootLayout and client `useAuth()`
- [x] Auth-aware Navbar reflecting authenticated user avatar, username, and Sign Out action
- [x] Production Registration Page (`/register`) with client validation and loading states
- [x] Production Login Page (`/login`) with loading states, error banner, and safe redirect protection
- [x] Auth-aware Profile Page (`/profile`) displaying unauthenticated prompt or user account & preferences
- [x] Comprehensive test suite (`tests/auth.test.ts`) covering hashing, validation, encryption, and database uniqueness
- [x] Complete browser verification of registration, login, session persistence, and logout

## Phase 8 - Player & Streaming Integration

- [ ] Video player
- [ ] HLS support
- [ ] Controls
- [ ] Subtitle support
- [ ] Quality selection
- [ ] Resume playback

## Phase 6 - Testing

- [ ] Unit tests
- [ ] API tests
- [ ] Player tests
- [ ] Responsive testing
- [ ] Production build

## Phase 7 - Deployment

- [ ] Production environment
- [ ] Backend deployment
- [ ] Frontend deployment
- [ ] Domain configuration
- [ ] HTTPS
- [ ] Monitoring