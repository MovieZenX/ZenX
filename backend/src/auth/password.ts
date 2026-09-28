import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

/**
 * Hashes a plaintext password securely using bcrypt with 12 salt rounds.
 * Complies with SECURITY.md: passwords are never stored or logged in plaintext.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verifies a plaintext password against a stored bcrypt hash.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!password || !hash) return false;
  return bcrypt.compare(password, hash);
}
