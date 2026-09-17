# AI Agent Development Rules

## Before Coding

Always read:

1. docs/PROJECT.md
2. docs/REQUIREMENTS.md
3. docs/FEATURES.md
4. docs/ARCHITECTURE.md
5. docs/API.md
6. docs/PLAYER.md
7. docs/DATABASE.md
8. docs/SECURITY.md
9. docs/TASKS.md

Before modifying a specific module, read its relevant documentation.

---

## Development Rules

- Do not invent API endpoints.
- Do not invent API response structures.
- Do not replace existing APIs without instruction.
- Do not introduce unnecessary dependencies.
- Do not rewrite working code without a reason.
- Do not remove existing features without explicit instruction.
- Preserve existing functionality when adding new features.

---

## API Rules

The existing streaming API is authoritative.

Always use the documented API contract.

If an API response does not match the documentation:

1. Inspect the actual response.
2. Identify the mismatch.
3. Do not hallucinate fields.
4. Update API.md only after confirming the real structure.

---

## Code Changes

Before modifying code:

- Inspect existing implementation.
- Identify affected components.
- Check dependencies.
- Check for existing utilities before creating new ones.

---

## Testing

After every major change:

1. Run tests.
2. Run lint.
3. Run type checking.
4. Run production build where applicable.
5. Fix errors before moving forward.

---

## Documentation

Update documentation when:

- API changes
- Database schema changes
- Architecture changes
- New major feature is added
- Player behavior changes

---

## Completion Rule

Do not mark a task complete until:

- Implementation exists
- Tests pass
- No obvious runtime errors remain
- Documentation is updated

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
