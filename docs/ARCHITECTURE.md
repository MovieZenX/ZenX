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

## Frontend

The frontend handles:

- UI
- Routing
- Search UI
- Movie pages
- Player UI
- Authentication state
- Watchlist UI
- Watch history

## Backend

The backend handles:

- Authentication
- User data
- Watch history
- Watchlist
- API proxying where required
- Rate limiting
- Validation

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