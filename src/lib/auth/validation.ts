/**
 * Authentication input validation and sanitization utilities.
 * Complies with SECURITY.md for user input validation.
 */

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,30}$/;

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates an email address.
 */
export function validateEmail(email: unknown): ValidationResult {
  if (typeof email !== "string" || !email.trim()) {
    return { isValid: false, error: "Email address is required." };
  }
  const trimmed = email.trim();
  if (trimmed.length > 254) {
    return { isValid: false, error: "Email address is too long." };
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return { isValid: false, error: "Please enter a valid email address." };
  }
  return { isValid: true };
}

/**
 * Validates a username (3-30 characters, alphanumeric, underscores, hyphens).
 */
export function validateUsername(username: unknown): ValidationResult {
  if (typeof username !== "string" || !username.trim()) {
    return { isValid: false, error: "Username is required." };
  }
  const trimmed = username.trim();
  if (trimmed.length < 3) {
    return { isValid: false, error: "Username must be at least 3 characters long." };
  }
  if (trimmed.length > 30) {
    return { isValid: false, error: "Username cannot exceed 30 characters." };
  }
  if (!USERNAME_REGEX.test(trimmed)) {
    return {
      isValid: false,
      error: "Username can only contain letters, numbers, underscores, and hyphens.",
    };
  }
  return { isValid: true };
}

/**
 * Validates password strength (minimum 8 characters, at least 1 letter and 1 number).
 */
export function validatePassword(password: unknown): ValidationResult {
  if (typeof password !== "string" || !password) {
    return { isValid: false, error: "Password is required." };
  }
  if (password.length < 8) {
    return { isValid: false, error: "Password must be at least 8 characters long." };
  }
  if (password.length > 128) {
    return { isValid: false, error: "Password cannot exceed 128 characters." };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: "Password must contain at least one uppercase letter." };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: "Password must contain at least one lowercase letter." };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: "Password must contain at least one number." };
  }
  return { isValid: true };
}

/**
 * Validates full registration payload.
 */
export function validateRegistrationInput(data: {
  email?: unknown;
  username?: unknown;
  password?: unknown;
  confirmPassword?: unknown;
}): ValidationResult {
  const emailRes = validateEmail(data.email);
  if (!emailRes.isValid) return emailRes;

  const usernameRes = validateUsername(data.username);
  if (!usernameRes.isValid) return usernameRes;

  const passwordRes = validatePassword(data.password);
  if (!passwordRes.isValid) return passwordRes;

  if (data.confirmPassword !== undefined && data.password !== data.confirmPassword) {
    return { isValid: false, error: "Passwords do not match." };
  }

  return { isValid: true };
}
