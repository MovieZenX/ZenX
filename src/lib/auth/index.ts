import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "./session";

export * from "./password";
export * from "./validation";
export * from "./session";

export interface SafeUser {
  id: string;
  email: string;
  username: string;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
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
export async function requireAuth(returnUrl?: string): Promise<SafeUser> {
  const user = await getCurrentUser();
  if (!user) {
    const destination = returnUrl
      ? `/login?returnUrl=${encodeURIComponent(returnUrl)}`
      : "/login";
    redirect(destination);
  }
  return user;
}
