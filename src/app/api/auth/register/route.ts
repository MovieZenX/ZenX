import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  validateRegistrationInput,
  hashPassword,
  setSessionCookie,
} from "@/lib/auth";

/**
 * Registration API Endpoint.
 * POST /api/auth/register
 *
 * Complies with SECURITY.md: Validates input, hashes password with bcrypt, and never stores plaintext.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, username, password, confirmPassword } = body || {};

    // Validate registration inputs
    const validation = validateRegistrationInput({
      email,
      username,
      password,
      confirmPassword,
    });

    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const normalizedEmail = (email as string).trim().toLowerCase();
    const trimmedUsername = (username as string).trim();

    // Check for existing user with same email
    const existingEmail = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existingEmail) {
      return NextResponse.json(
        { error: "An account with this email address already exists." },
        { status: 409 }
      );
    }

    // Check for existing user with same username
    const existingUsername = await prisma.user.findUnique({
      where: { username: trimmedUsername },
    });
    if (existingUsername) {
      return NextResponse.json(
        { error: "This username is already taken. Please choose another." },
        { status: 409 }
      );
    }

    // Securely hash password
    const passwordHash = await hashPassword(password as string);

    // Create user and initialize default preferences in database
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        username: trimmedUsername,
        passwordHash,
        preferences: {
          create: {},
        },
      },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
      },
    });

    // Automatically establish authenticated session upon registration
    await setSessionCookie({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[API /api/auth/register] Error:", (err as Error).message);
    return NextResponse.json(
      { error: "An unexpected error occurred during registration. Please try again." },
      { status: 500 }
    );
  }
}
