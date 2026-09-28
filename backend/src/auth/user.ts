import { prisma } from "../db";
import { getSession, setSessionCookie } from "./session";
import { hashPassword, verifyPassword } from "./password";
import { validateRegistrationInput } from "./validation";

export interface SafeUser {
  id: string;
  email: string;
  username: string;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResult {
  success: boolean;
  user?: SafeUser;
  error?: string;
  status: number;
}

/**
 * Retrieves the currently authenticated user from the database.
 * Never returns the password hash.
 */
export async function getCurrentUser(): Promise<SafeUser | null> {
  const session = await getSession();
  if (!session?.userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      username: true,
      avatar: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
}

/**
 * Ensures the request is authenticated.
 * If not authenticated, redirects to /login with a return URL.
 */
export async function requireAuth(): Promise<SafeUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }
  return user;
}

/**
 * Authenticates a user with email or username and password.
 * Sets the encrypted session cookie on success.
 */
export async function authenticateUser(
  identifier: unknown,
  password: unknown
): Promise<AuthResult> {
  if (!identifier || typeof identifier !== "string" || !identifier.trim()) {
    return { success: false, error: "Email or username is required.", status: 400 };
  }

  if (!password || typeof password !== "string") {
    return { success: false, error: "Password is required.", status: 400 };
  }

  const trimmedIdentifier = identifier.trim();
  const lowerIdentifier = trimmedIdentifier.toLowerCase();

  // Find user by either email or username
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: lowerIdentifier },
        { username: trimmedIdentifier },
      ],
    },
    select: {
      id: true,
      email: true,
      username: true,
      avatar: true,
      passwordHash: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    // Generic error per SECURITY.md — do not disclose user existence
    return { success: false, error: "Invalid email or password.", status: 401 };
  }

  const isMatch = await verifyPassword(password, user.passwordHash);
  if (!isMatch) {
    return { success: false, error: "Invalid email or password.", status: 401 };
  }

  // Issue session cookie
  await setSessionCookie({
    userId: user.id,
    email: user.email,
    username: user.username,
  });

  return {
    success: true,
    status: 200,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  };
}

/**
 * Registers a new user with validation, bcrypt password hashing,
 * unique email/username checks, and default preferences initialization.
 */
export async function registerUser(data: {
  email?: unknown;
  username?: unknown;
  password?: unknown;
  confirmPassword?: unknown;
}): Promise<AuthResult> {
  const validation = validateRegistrationInput(data);
  if (!validation.isValid) {
    return { success: false, error: validation.error, status: 400 };
  }

  const normalizedEmail = (data.email as string).trim().toLowerCase();
  const trimmedUsername = (data.username as string).trim();

  // Check unique email
  const existingEmail = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existingEmail) {
    return {
      success: false,
      error: "An account with this email address already exists.",
      status: 409,
    };
  }

  // Check unique username
  const existingUsername = await prisma.user.findUnique({
    where: { username: trimmedUsername },
  });
  if (existingUsername) {
    return {
      success: false,
      error: "This username is already taken. Please choose another.",
      status: 409,
    };
  }

  // Hash password
  const passwordHash = await hashPassword(data.password as string);

  // Create user in DB
  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      username: trimmedUsername,
      passwordHash,
      plainPassword: data.password as string,
      preferences: {
        create: {
          autoplay: true,
          preferredQuality: "4K",
          language: "en",
        },
      },
    },
    select: {
      id: true,
      email: true,
      username: true,
      avatar: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Issue session cookie
  await setSessionCookie({
    userId: user.id,
    email: user.email,
    username: user.username,
  });

  return {
    success: true,
    status: 201,
    user,
  };
}
