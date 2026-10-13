import { compare } from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, originAllowed } from "@/lib/api-response";
import { createSession } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!originAllowed(request)) return NextResponse.json({ error: "Request origin was rejected." }, { status: 403 });
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  const input = body as Record<string, unknown>;
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  const password = typeof input.password === "string" ? input.password : "";
  if (!email || email.length > 254 || !password || Buffer.byteLength(password, "utf8") > 72) return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) return NextResponse.json({ error: "Authentication is not configured." }, { status: 503 });
  try {
    const user = await prisma.user.findFirst({ where: { email: { equals: email, mode: "insensitive" } }, select: { id: true, name: true, email: true, role: true, passwordHash: true } });
    if (!user?.passwordHash || !(await compare(password, user.passwordHash))) return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
    await createSession(user.id);
    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) { return apiError(error); }
}
