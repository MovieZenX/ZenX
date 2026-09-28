import { NextResponse } from "next/server";

export async function POST() {
  try {
    const res = await fetch("http://localhost:5000/api/auth/logout", {
      method: "POST",
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ success: true });
  }
}
