import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { originAllowed } from "@/lib/api-response";
import { createSession } from "@/lib/session";
import { dbService } from "@/lib/db-service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!originAllowed(request)) {
    return NextResponse.json({ error: "Request origin was rejected." }, { status: 403 });
  }

  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const input = body as Record<string, unknown>;
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  const password = typeof input.password === "string" ? input.password : "";
  const roleInput = typeof input.role === "string" ? input.role.toLowerCase() : "student";
  const role = roleInput === "organizer" ? "ORGANIZER" : "STUDENT";

  if (!name || name.length < 2) {
    return NextResponse.json({ error: "Please enter your full name." }, { status: 400 });
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
  }

  if (!password || password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  }

  try {
    const existing = await dbService.findUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const passwordHash = await hash(password, 10);
    const user = await dbService.createUser({
      name,
      email,
      passwordHash,
      role,
    });

    await createSession({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as any,
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error: any) {
    console.error("Signup error:", error?.message || error);
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }
    return NextResponse.json(
      { error: error.message || "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}
