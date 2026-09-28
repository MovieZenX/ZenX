# Features

## Home

### Featured Section

Display a highlighted movie/show with:

- Backdrop
- Poster
- Title
- Description
- Metadata
- Watch button

### Trending

Fetch trending content from the configured metadata API.

Display items in a horizontally scrollable section.

### Streaming Platforms

Display official streaming provider networks (Netflix, Prime Video, Disney+, Apple TV+, Max, Paramount+, Hulu, Peacock, Crunchyroll, Starz, Discovery+, AMC+, Tubi, Plex, MUBI, Shudder) in a horizontally scrollable glassmorphic carousel. Clicking any platform filters the catalog to titles streaming on that service.

### Popular by Platform

Interactive platform and series/movies switcher section positioned directly below the Streaming Platforms row. Dynamically updates popular catalog titles, platform logos, and media formats with live carousel navigation.

---

## Search

### Search Flow

1. User enters a query or selects a discovery category/genre/platform.
2. Frontend validates the query and syncs parameters with URL (`q`, `type`, `provider`, `page`).
3. Search API request is sent with debounce.
4. Loading state skeleton is displayed.
5. Results are displayed in the user's preferred layout (**Grid View** or **Detailed List View**).
6. In-result dynamic genre filters and sorting options (relevance, rating, release year, alphabetical).
7. Empty state with fallback trending recommendations is displayed when no direct results exist.
8. API errors are shown using a user-friendly error state.

### Discovery & Features
- **Pre-Search Discovery**: Server-hydrated trending spotlight titles, streaming service filters (Netflix, Disney+, Prime, Apple TV+, Max, Paramount+, Hulu, Crunchyroll), curated genre atmosphere cards, and recent search history saved in `localStorage`.
- **Keyboard Shortcuts**: `/` focuses search bar, `Escape` clears.
- **Detailed View**: Rich cards showing full synopsis, TMDB rating with vote count, genre chips, quality badges, and instant "Watch Now" action.

---

## Watchlist

Users can:

- Add content
- Remove content
- View watchlist

Watchlist state must persist between sessions.

---

## Continue Watching

Store:

- Content ID
- Season
- Episode
- Playback position
- Last watched timestamp

Resume playback from the previous position when possible.