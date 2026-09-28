import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("[API /api/auth/register] Backend forward error:", (err as Error).message);
    return NextResponse.json(
      { error: "Backend authentication service unavailable." },
      { status: 503 }
    );
  }
}
