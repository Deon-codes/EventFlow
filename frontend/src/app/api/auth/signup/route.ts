import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { apiError, originAllowed } from "@/lib/api-response";
import { createSession } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!originAllowed(request)) return NextResponse.json({ error: "Request origin was rejected." }, { status: 403 });
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  const input = body as Record<string, unknown>;
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  const password = typeof input.password === "string" ? input.password : "";
  // Public signup always creates a student. Organizer roles must be assigned by a trusted administrator.
  if (input.role === "organizer" || !name || name.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || password.length < 12 || Buffer.byteLength(password, "utf8") > 72) {
    return NextResponse.json({ error: "Provide a valid name and email, and a password between 12 characters and 72 bytes." }, { status: 400 });
  }
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) return NextResponse.json({ error: "Authentication is not configured." }, { status: 503 });
  try {
    const existing = await prisma.user.findFirst({ where: { email: { equals: email, mode: "insensitive" } }, select: { id: true } });
    if (existing) return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    const passwordHash = await hash(password, 12);
    const user = await prisma.user.create({ data: { name, email, passwordHash, role: "STUDENT" }, select: { id: true, name: true, email: true, role: true } });
    await createSession(user.id);
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    return apiError(error);
  }
}
