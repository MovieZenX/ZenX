# Security

## API Keys

Never expose private API keys in frontend source code.

Secrets must be stored using environment variables.

## Input Validation

Validate:

- Search queries
- Content IDs
- User input
- API parameters

## Authentication & User Sessions
 
- **Passwords**: Never stored in plaintext. Hashed with bcrypt using 12 salt rounds (`bcryptjs`).
- **Session Tokens**: Sealed using authenticated AES-256-GCM encryption with derived 32-byte key from `AUTH_SECRET`.
- **Cookies**: HTTP-only, `SameSite=Lax`, `path=/`, `secure` in production mode to prevent XSS session theft.
- **Credential Sanitization**: Passwords and password hashes are never logged, serialized to client responses, or exposed in error messages.
- **Generic Error Responses**: Failed authentication attempts return generic sanitized messages ("Invalid email or password.") without revealing account existence.
- **Input Validation**: Strict email, username (alphanumeric, 3-30 chars), and password complexity (min 8 chars, uppercase, lowercase, number) enforced before processing.
- **Open Redirect Protection**: Redirect query parameters on login and registration validate against open redirects.
- **Secrets Management**: `AUTH_SECRET` kept strictly server-side in `.env.local` / `.env`.

Protected endpoints and server operations verify authentication via server-side session checks.

## Rate Limiting

Apply rate limiting to:

- Login
- Search where appropriate
- User API endpoints
- Sensitive endpoints

## Error Handling

Never expose:

- Stack traces
- Secrets
- Internal server information
- Database errors

to users.