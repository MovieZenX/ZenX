# StreamVault Backend Architecture

This directory houses all backend and server-side business logic, security algorithms, and data persistence layers.

## Directory Structure

```
src/backend/
├── auth/
│   ├── password.ts     # Bcrypt password hashing (12 rounds) & verification
│   ├── session.ts      # AES-256-GCM encrypted session cookies (30-day expiry)
│   ├── validation.ts   # Input validation (Email, Username, Password, Registration)
│   ├── user.ts         # User auth service (Login, Registration, SafeUser queries)
│   └── index.ts        # Unified auth exports
├── db/
│   └── index.ts        # Prisma client singleton instance (`prisma`, `db`)
├── services/
│   └── metadata.ts     # TMDB metadata proxy & normalization services
└── index.ts            # Root backend module export
```

## Security & Rules

- **Zero Plaintext Passwords**: All credentials hashed with 12-round bcrypt before database insertion.
- **Sealed Session Tokens**: AES-256-GCM encryption with 96-bit random IVs and integrity tags.
- **Generic Auth Errors**: Per `SECURITY.md`, authentication errors do not reveal account existence.
