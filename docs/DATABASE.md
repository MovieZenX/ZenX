# Database

## users

- id
- email
- username
- password_hash
- avatar
- created_at
- updated_at

## watchlist

- id
- user_id
- content_id
- content_type
- created_at

## watch_history

- id
- user_id
- content_id
- content_type
- season
- episode
- progress
- duration
- last_watched

## user_preferences

- id
- user_id
- language
- autoplay
- preferred_quality
- subtitles_enabled