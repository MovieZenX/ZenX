import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, setSessionCookie } from "@/lib/auth";

/**
 * Login API Endpoint.
 * POST /api/auth/login
 *
 * Complies with SECURITY.md: Returns generic user-facing messages on failure.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier, password } = body || {};

    if (!identifier || typeof identifier !== "string" || !identifier.trim()) {
      return NextResponse.json(
        { error: "Email or username is required." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Password is required." },
        { status: 400 }
      );
    }

    const trimmedIdentifier = identifier.trim();
    const lowerIdentifier = trimmedIdentifier.toLowerCase();

    // Query user by either email or username
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
        passwordHash: true,
      },
    });

    if (!user) {
      // Generic error per SECURITY.md — do not disclose whether user exists
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Set secure HTTP-only session cookie
    await setSessionCookie({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (err) {
    console.error("[API /api/auth/login] Error:", (err as Error).message);
    return NextResponse.json(
      { error: "An unexpected error occurred during login. Please try again." },
      { status: 500 }
    );
  }
}
