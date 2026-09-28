# Architecture

## High-Level

User
 ↓
Frontend
 ↓
Application API / Backend
 ├── Metadata API
 ├── Streaming API
 └── Database
       ↓
    User Data

## Frontend (`src/frontend`)

The frontend handles:

- UI & Page layout presentation
- Reusable components (`src/frontend/components/`)
  - Media cards, rows, trailers, hero (`@/frontend/components/media`)
  - Player theater (`@/frontend/components/watch`)
  - Navigation & Footer (`@/frontend/components/layout`)
  - Core UI widgets (`@/frontend/components/ui`)
- Client context providers & state (`src/frontend/providers/auth-provider.tsx`)
- Custom UI hooks (`src/frontend/hooks/use-auth.ts`)
- Client-side navigation & search routing

## Backend (`src/backend`)

The backend handles:

- Authentication & User service (`src/backend/auth/`)
  - User registration & login services (`user.ts`)
  - Bcrypt password hashing (`password.ts`)
  - AES-256-GCM encrypted session tokens & cookies (`session.ts`)
  - User input validation schemas (`validation.ts`)
- Database client singleton (`src/backend/db/`)
  - Prisma client connection (`prisma`, `db`)
- Service orchestration (`src/backend/services/`)
  - Metadata TMDB proxies & normalizers
- API Route controllers (`src/app/api/`) delegating directly to `@/backend/*`

## Authentication & Session Architecture

- **Password Security**: Bcrypt with 12 salt rounds (via `bcryptjs`). Passwords are never stored in plaintext or returned to the client.
- **Session Tokens**: Authenticated AES-256-GCM encrypted tokens containing user ID, email, and expiration timestamp.
- **Cookie Security**: HTTP-only, SameSite=Lax, Secure in production (`streamvault_session`). 30-day session lifetime.
- **Auth Provider & Hydration**: RootLayout pre-hydrates user state server-side via `getCurrentUser()` to prevent layout shift; client-side `useAuth()` provides reactive state, login, and logout.
- **Protected Actions & Endpoints**: Verified server-side via `getCurrentUser()` and `getSession()`. Public catalog routes remain accessible anonymously.

## Database

Stores:

- Users
- Watchlist
- Watch history
- Playback progress
- User preferences