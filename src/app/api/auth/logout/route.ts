import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

/**
 * Logout API Endpoint.
 * POST /api/auth/logout
 *
 * Invalidate session by clearing the HTTP-only cookie.
 */
export async function POST() {
  await clearSessionCookie();
  return NextResponse.json({ success: true });
}
