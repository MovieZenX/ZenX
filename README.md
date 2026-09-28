# StreamVault

A modern, cinematic movie and TV streaming web application with separated **Frontend** and **Backend** architecture.

---

## Project Structure

```
movie/
├── frontend/             # Next.js 16 Web Application (UI / Pages / Components / Tests)
│   ├── src/
│   │   ├── app/          # Next.js App Router (pages: /, /watch, /search, /login, etc.)
│   │   ├── components/   # UI components (watch, media, auth, layout, ui)
│   │   ├── config/       # Navigation, theme, constants
│   │   ├── hooks/        # React hooks (useAuth, etc.)
│   │   ├── lib/          # Utilities & API clients
│   │   ├── providers/    # Auth and global providers
│   │   └── types/        # TypeScript models & types
│   ├── public/           # Static assets & icons
│   ├── tests/            # Frontend unit & integration tests (39 tests)
│   ├── .env.local        # Frontend environment variables
│   ├── package.json      # Frontend dependencies & scripts
│   └── tsconfig.json     # Frontend TypeScript configuration
│
└── backend/              # Authentication & User Service (Auth / DB / API / Tests)
    ├── src/
    │   ├── auth/         # User auth, bcrypt hashing, AES-GCM sessions, validation
    │   ├── config/       # Backend environment configuration
    │   ├── db/           # Prisma SQLite database client singleton
    │   └── server.ts     # Standalone auth API server (port 5000)
    ├── prisma/           # Prisma schema (schema.prisma) & SQLite DB (dev.db)
    ├── docs/             # Project documentation & specs
    ├── tests/            # Backend auth tests (19 tests)
    ├── .env              # Backend environment variables
    ├── package.json      # Backend dependencies & scripts
    └── tsconfig.json     # Backend TypeScript configuration
```

---

## Getting Started

### Frontend (`cd frontend`)

```bash
cd frontend
npm run dev      # Starts Next.js frontend on http://localhost:3000
npm test         # Runs 39 frontend unit/integration tests
npm run build    # Builds production bundle
```

### Backend (`cd backend`)

```bash
cd backend
npm run dev      # Starts backend auth server on http://localhost:5000
npm test         # Runs 19 backend auth/db tests
npm run db:push  # Syncs Prisma schema with SQLite
```

