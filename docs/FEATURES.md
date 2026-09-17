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

---

## Search

### Search Flow

1. User enters a query.
2. Frontend validates the query.
3. Search API request is sent.
4. Loading state is displayed.
5. Results are displayed.
6. Empty state is displayed when no results exist.
7. API errors are shown using a user-friendly error state.

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