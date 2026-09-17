# Changelog

All notable changes to this project will be documented here.

## [Unreleased]

### Added
- Native secure production authentication system with AES-256-GCM encrypted HTTP-only session cookies (`streamvault_session`) and bcrypt password hashing (12 salt rounds)
- User registration API (`POST /api/auth/register`) with strict email, username, and password complexity validation, uniqueness enforcement, and automatic session establishment
- User login API (`POST /api/auth/login`) with generic sanitized error messaging to prevent user enumeration
- User logout API (`POST /api/auth/logout`) and current session user endpoint (`GET /api/auth/me`)
- Core authentication security library: `src/lib/auth/password.ts`, `src/lib/auth/session.ts`, `src/lib/auth/validation.ts`, and `src/lib/auth/index.ts`
- Client AuthProvider (`src/components/providers/auth-provider.tsx`) with server-side pre-hydration in RootLayout and reactive `useAuth()` hook
- Production Login page (`src/app/login/page.tsx` & `src/app/login/login-form.tsx`) with sanitized feedback, loading states, password visibility toggle, and open redirect protection
- Production Registration page (`src/app/register/page.tsx` & `src/app/register/register-form.tsx`) with client validation, confirm password matching, and automatic profile redirection
- Auth-aware Navbar (`src/components/layout/navbar.tsx`) displaying user avatar with first initial, username, and Sign Out action on desktop and mobile drawer
- Auth-aware Profile page (`src/app/profile/page.tsx`) with unauthenticated sign-in prompt and authenticated account details and database playback preferences
- Added `password_hash` column to `User` model in `prisma/schema.prisma` and updated SQLite schema
- Added `AUTH_SECRET` environment variable to `.env.example`, `.env.local`, `.env`, and `src/config/env.ts`
- Comprehensive authentication test suite (`tests/auth.test.ts`) with 16 automated tests covering bcrypt hashing, validation rules, AES-GCM encryption/tamper-detection, and database unique constraints
- Production Movie details page (`src/app/movie/[id]/page.tsx`) with real TMDB metadata, tagline, release date, runtime, rating, vote count, status, genres, and overview
- Production TV series details page (`src/app/tv/[id]/page.tsx`) with real TMDB metadata, seasons list, episode counts, status, and genres
- Interactive Season & Episode viewer (`src/components/media/tv-episodes-viewer.tsx`) with dynamic season switching, client-side caching, and responsive episode cards
- Server-side TV season API endpoint at `GET /api/metadata/tv/[id]/season/[seasonNumber]` with route validation and caching headers
- Reusable cast presentation component (`src/components/media/cast-list.tsx`) featuring circular actor avatars with initial fallbacks and role labels
- Dedicated loading skeleton states in `src/app/movie/[id]/loading.tsx` and `src/app/tv/[id]/loading.tsx` preventing layout shifts
- Route validation for `/movie/[id]` and `/tv/[id]` ensuring non-numeric or missing IDs trigger Next.js `notFound()` 404 response
- Dynamic SEO and OpenGraph metadata generation for movie and TV detail pages with title, description, and high-res media images
- Comprehensive unit test suite in `tests/details.test.ts` covering normalization, fallbacks, and ID validation
- Production Search experience (`src/app/search/search-client.tsx` and `src/app/search/page.tsx`) with bidirectional URL query synchronization (`q`, `type`, `page`)
- Real-time debounced search input (350ms) with immediate Enter submission, Escape clear, and visual spinner indicator
- Media type filter tabs supporting "All Titles", "Movies", and "TV Shows" with URL synchronization
- Discovery empty state with popular search suggestions ("Inception", "Breaking Bad", etc.) and quick genre filters
- Pagination controls with previous/next navigation, page bounds protection, and smooth scroll to results
- Screen-reader accessible live announcement region (`aria-live="polite"`) announcing search results and pagination status
- Search API proxy validation in `src/app/api/metadata/search/route.ts` with 100-character query limit, 1-500 page clamping, and HTTP cache headers
- Unit test suite in `tests/search.test.ts` covering search validation, normalization, and pagination bounds
- Production Home Page polish with fault-isolated parallel fetching (`Promise.allSettled`) ensuring partial upstream failures never break the entire page
- Enriched Hero banner displaying real TMDB backdrop, title, overview, rating, release year, runtime/duration, genres, and accessible primary Watch & secondary Details actions
- Curated Action & Adventure spotlight row synthesized from loaded metadata without redundant API requests
- Full-page cinematic loading state in `src/app/loading.tsx` using `HeroSkeleton` and `RowSkeleton`s
- Home page SEO and OpenGraph metadata tags configured in `src/app/page.tsx`
- Graceful catalog failure fallback in `src/app/page.tsx` rendering `ErrorState` with retry action
- Reusable UI polish: `SectionHeading` accessible ID support and `Hero` region role with descriptive ARIA labels
- TMDB (The Movie Database) metadata API integration with server-side caching layer
- Server-side metadata client in `src/lib/metadata/tmdb.ts` with Next.js ISR data caching (trending, popular, latest, search, movie/TV details, cast credits, seasons/episodes)
- Data normalization layer in `src/lib/metadata/normalize.ts` converting raw TMDB responses into consistent domain models (`MediaItem`, `MediaDetail`, `SeasonItem`, `EpisodeItem`, `CastMember`)
- Raw TMDB types in `src/types/tmdb.ts` and normalized metadata types in `src/types/metadata.ts`
- Server-side search proxy endpoint at `GET /api/metadata/search` with input validation, sanitization, and pagination
- Home page connected to live TMDB metadata (featured Hero banner, Trending Today carousel, Popular Movies, Trending TV Series, Now Playing releases)
- Search page connected to live TMDB search API with real-time debounced query, media type filtering (Movies vs TV vs All), and pagination
- Movie details page (`/movie/[id]`) connected to live TMDB metadata with backdrop, poster, rating, runtime, cast credits with headshots, and similar movies carousel
- TV details page (`/tv/[id]`) connected to live TMDB metadata with seasons breakdown, episode counts, cast, and similar series
- Watch page shell (`/watch/[id]`) connected to live media metadata
- Comprehensive unit test suite in `tests/metadata.test.ts` for normalization utilities and error edge cases
- Removed mock data from all production flows
- Configured `image.tmdb.org` in `next.config.ts` for Next.js image loading
- Documented full metadata API specification in `API.md`
- Initial Next.js 16 App Router setup with React 19 and TypeScript 5 (strict mode)
- Tailwind CSS v4 setup with custom cinematic dark theme tokens
- Base application layout with responsive navigation bar, mobile menu, and footer
- Error boundary (`error.tsx`), Suspense loading (`loading.tsx`), and custom 404 (`not-found.tsx`)
- Core routing structure: `/`, `/search`, `/library`, `/profile`, `/movie/[id]`, `/tv/[id]`, `/watch/[id]`
- Reusable UI primitives: `Button`, `Badge`, `Card`, `Input`, `Select`, `Modal`, `Tabs`, `Container`, `SectionHeading`, `EmptyState`, `ErrorState`, `Skeleton`, `Spinner`
- Media components: `Hero` (cinematic banner with multi-directional vignettes), `ContentCard` (2:3 poster with rating and quick play), `ContentRow` (horizontally scrollable carousel)
- Production-ready responsive Navbar with scroll detection, active states, search trigger, profile access, and keyboard-accessible mobile drawer
- Extended global footer with discover categories, library links, disclaimer notice, and copyright
- Visual mock data module (`src/lib/mock-data.ts`) isolated from production services
- Home page showcase with hero banner, trending carousel, TV series row, genre browse grid, and client-side watchlist toggle
- Prisma ORM 6 with SQLite for local development (`prisma/schema.prisma`) mapping all entities from `DATABASE.md` (`users`, `watchlist`, `watch_history`, `user_preferences`)
- Prisma client singleton in `src/lib/db.ts`
- Environment variables configuration (`.env.example`, `.env.local`, `.env`)
- Centralized application constants and typed config in `src/config`
- TypeScript domain entities and API contract types in `src/types`
- ESLint and Turbopack build pipeline verified

### Changed
- None

### Fixed
- None