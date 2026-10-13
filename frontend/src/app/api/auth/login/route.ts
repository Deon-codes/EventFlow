import { compare } from "bcryptjs";
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
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  const password = typeof input.password === "string" ? input.password : "";

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  try {
    const user = await dbService.findUserByEmail(email);
    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
    }

    const isValid = await compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
    }

    await createSession({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as any,
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed. Please try again." }, { status: 500 });
  }
}
