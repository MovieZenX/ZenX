# StreamVault

A modern, cinematic movie and TV streaming web application built with **Next.js (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS**.

---

## Project Documentation (`docs/`)

All architectural specifications, database schemas, APIs, and design guidelines are organized in the [`docs/`](./docs) folder:

| Document | Description |
|---|---|
| [**PROJECT.md**](./docs/PROJECT.md) | Vision, scope, core features, and non-functional requirements |
| [**REQUIREMENTS.md**](./docs/REQUIREMENTS.md) | Detailed functional & system requirements |
| [**FEATURES.md**](./docs/FEATURES.md) | Feature matrix, pages, and planned releases |
| [**TECH_STACK.md**](./docs/TECH_STACK.md) | Technology choices, frameworks, and database stack |
| [**ARCHITECTURE.md**](./docs/ARCHITECTURE.md) | System architecture, frontend/backend separation, and auth flow |
| [**API.md**](./docs/API.md) | TMDB metadata integration, internal proxy routes, and auth endpoints |
| [**DATABASE.md**](./docs/DATABASE.md) | SQLite schema (Prisma models: User, Watchlist, WatchHistory, UserPreferences) |
| [**SECURITY.md**](./docs/SECURITY.md) | Password hashing (bcrypt), AES-GCM session tokens, and sanitized responses |
| [**UI_UX.md**](./docs/UI_UX.md) | Dark cinematic design system, tokens, and UX guidelines |
| [**PLAYER.md**](./docs/PLAYER.md) | Video player specification (HLS streaming, controls) |
| [**TESTING.md**](./docs/TESTING.md) | Test plan, coverage strategy, and test commands |
| [**DEPLOYMENT.md**](./docs/DEPLOYMENT.md) | Production build, environment configuration, and hosting guidelines |
| [**TASKS.md**](./docs/TASKS.md) | Implementation roadmap and phase checklist |
| [**CHANGELOG.md**](./docs/CHANGELOG.md) | Detailed historical log of all features and architectural additions |

---

## Getting Started

### Prerequisites
- Node.js 20+
- npm

### Installation
```bash
npm install
```

### Environment Setup
Create a `.env.local` file with the required environment variables:
```env
TMDB_API_KEY=your_tmdb_api_key
AUTH_SECRET=your_32_byte_random_auth_secret
DATABASE_URL="file:./dev.db"
```

### Database Migration
```bash
npm run db:push
```

### Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Test Suite
```bash
npm test
```
