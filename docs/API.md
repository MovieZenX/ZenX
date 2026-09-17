# API Integration

## Metadata API (TMDB)

The application integrates with **The Movie Database (TMDB) v3 API** for all movie and TV show discovery, details, cast, and search functionality.

All requests are executed **strictly server-side** (via Next.js Server Components or `/api/metadata/*` proxy routes). Private API credentials are never exposed to the client bundle.

### Environment Configuration

```env
TMDB_API_KEY=your_tmdb_api_key
TMDB_BASE_URL="https://api.themoviedb.org/3"
TMDB_IMAGE_BASE_URL="https://image.tmdb.org/t/p"
```

### Server Service Functions (`src/lib/metadata/tmdb.ts`)

| Function | Endpoint | Description | Cache Duration |
|---|---|---|---|
| `getTrendingAll(window)` | `GET /trending/all/{day\|week}` | Trending movies and TV series | 1 hour (3600s) |
| `getTrendingMovies(window)` | `GET /trending/movie/{window}` | Trending movies | 1 hour (3600s) |
| `getPopularMovies(page)` | `GET /movie/popular` | Most popular movies | 1 hour (3600s) |
| `getPopularTv(page)` | `GET /tv/popular` | Top TV shows | 1 hour (3600s) |
| `getNowPlayingMovies()` | `GET /movie/now_playing` | In theaters & latest releases | 1 hour (3600s) |
| `searchMedia(q, page, type)` | `GET /search/{multi\|movie\|tv}` | Catalog search with pagination | 5 minutes (300s) |
| `getMovieDetails(id)` | `GET /movie/{id}?append_to_response=credits,similar` | Full movie details, cast, similar | 24 hours (86400s) |
| `getTvDetails(id)` | `GET /tv/{id}?append_to_response=credits,similar` | Full TV details, seasons, cast, similar | 24 hours (86400s) |
| `getTvSeason(id, season)` | `GET /tv/{id}/season/{season}` | TV season episodes breakdown | 24 hours (86400s) |
| `getGenreMap()` | `GET /genre/{movie\|tv}/list` | Genre names indexed by ID | 7 days (604800s) |

### Internal API Proxy Routes

#### Search Proxy
- **Path**: `GET /api/metadata/search`
- **Query Parameters**:
  - `q` (string, required): Search query
  - `type` (`"all"` \| `"movie"` \| `"tv"`, optional, default: `"all"`): Filter media type
  - `page` (number, optional, default: `1`): Results page
- **Response Format**:
  ```json
  {
    "page": 1,
    "results": [
      {
        "id": "27205",
        "title": "Inception",
        "overview": "Cobb, a skilled thief...",
        "posterUrl": "https://image.tmdb.org/t/p/w500/...",
        "backdropUrl": "https://image.tmdb.org/t/p/original/...",
        "contentType": "movie",
        "releaseYear": 2010,
        "rating": 8.4,
        "voteCount": 35000,
        "genres": ["Action", "Science Fiction"],
        "quality": "4K"
      }
    ],
    "totalPages": 1,
    "totalResults": 14
  }
  ```

---

## Authentication Endpoints

Internal App Router API endpoints managing user registration, login sessions, session verification, and logout.

### Register Account
- **Path**: `POST /api/auth/register`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "username": "cinemafan",
    "password": "ValidPassword123!",
    "confirmPassword": "ValidPassword123!"
  }
  ```
- **Response**: `201 Created` with `user` object and sets `streamvault_session` HTTP-only cookie.
  ```json
  {
    "user": {
      "id": "cuid...",
      "email": "user@example.com",
      "username": "cinemafan",
      "createdAt": "2026-09-17T..."
    }
  }
  ```

### User Login
- **Path**: `POST /api/auth/login`
- **Request Body**:
  ```json
  {
    "identifier": "user@example.com",
    "password": "ValidPassword123!"
  }
  ```
- **Response**: `200 OK` with safe `user` object and sets `streamvault_session` cookie. On failure, returns `401 Unauthorized` with generic message: `"Invalid email or password."`.

### User Logout
- **Path**: `POST /api/auth/logout`
- **Response**: `200 OK` with `{ "success": true }`, invalidates and deletes the `streamvault_session` cookie.

### Current User Session
- **Path**: `GET /api/auth/me`
- **Response**: `200 OK` with `{ "user": SafeUser | null }`.

---

## Existing Streaming API

The streaming API is externally hosted and already available.

The application must consume this API.

### Base URL

ENV:

```env
STREAMING_API_URL=
```

### Authentication

If required:

```env
STREAMING_API_KEY=
```

Never expose private API credentials in the browser.

---

### Endpoints

#### Get Streaming Source

`GET /...`

Parameters:

- `id`
- `type`
- `season`
- `episode`

Example response:

```json
{
  "sources": [
    {
      "url": "...",
      "type": "hls",
      "quality": "1080p"
    }
  ]
}
```