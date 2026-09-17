import { cookies } from "next/headers";
import crypto from "crypto";
import { serverEnv } from "@/config/env";

export const SESSION_COOKIE_NAME = "streamvault_session";
const SESSION_DURATION_SECONDS = 30 * 24 * 60 * 60; // 30 days

export interface SessionPayload {
  userId: string;
  email: string;
  username: string;
  createdAt: number;
  expiresAt: number;
}

// Derive a 32-byte encryption key from AUTH_SECRET
function getKey(): Buffer {
  const secret = serverEnv.AUTH_SECRET || "fallback-secret-for-development-mode-only";
  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Encrypts and signs a session payload using AES-256-GCM.
 */
export function encryptSession(payload: SessionPayload): string {
  const key = getKey();
  const iv = crypto.randomBytes(12); // 96-bit IV for GCM
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const jsonStr = JSON.stringify(payload);
  const encrypted = Buffer.concat([cipher.update(jsonStr, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Combine iv + authTag + encrypted into base64 url-safe string
  const combined = Buffer.concat([iv, authTag, encrypted]);
  return combined.toString("base64url");
}

/**
 * Decrypts and verifies a sealed session token.
 * Returns null if tampering is detected or if token has expired.
 */
export function decryptSession(token: string): SessionPayload | null {
  try {
    const key = getKey();
    const combined = Buffer.from(token, "base64url");

    if (combined.length < 28) return null; // 12 bytes IV + 16 bytes Tag = 28 min

    const iv = combined.subarray(0, 12);
    const authTag = combined.subarray(12, 28);
    const encrypted = combined.subarray(28);

    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    const payload = JSON.parse(decrypted.toString("utf8")) as SessionPayload;

    // Check expiration timestamp
    if (!payload || !payload.expiresAt || payload.expiresAt < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    // Tampered token or invalid structure
    return null;
  }
}

/**
 * Retrieves the current session from incoming request cookies.
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  return decryptSession(sessionCookie.value);
}

/**
 * Sets an encrypted, HTTP-only session cookie in the response.
 */
export async function setSessionCookie(
  data: Omit<SessionPayload, "createdAt" | "expiresAt">
): Promise<void> {
  const now = Date.now();
  const payload: SessionPayload = {
    ...data,
    createdAt: now,
    expiresAt: now + SESSION_DURATION_SECONDS * 1000,
  };

  const encryptedToken = encryptSession(payload);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, encryptedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

/**
 * Clears the session cookie on logout.
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
