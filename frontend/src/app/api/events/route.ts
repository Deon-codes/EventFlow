import { NextResponse } from "next/server";
import { EventStatus, RegistrationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { apiError, originAllowed } from "@/lib/api-response";
import { currentUser } from "@/lib/session";

export const runtime = "nodejs";

export async function GET() {
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  try {
    const events = await prisma.event.findMany({
      where: { status: EventStatus.PUBLISHED }, orderBy: { startsAt: "asc" },
      select: { id: true, title: true, description: true, category: true, location: true, startsAt: true, endsAt: true, capacity: true, posterUrl: true, status: true, organizerId: true, createdAt: true, updatedAt: true },
    });
    const counts = events.length ? await prisma.registration.groupBy({ by: ["eventId"], where: { eventId: { in: events.map((event) => event.id) }, status: { in: [RegistrationStatus.REGISTERED, RegistrationStatus.CHECKED_IN] } }, _count: { eventId: true } }) : [];
    const byEvent = new Map(counts.map((row) => [row.eventId, row._count.eventId]));
    return NextResponse.json(events.map((event) => ({ ...event, registered: byEvent.get(event.id) ?? 0 })));
  } catch (error) { return apiError(error); }
}

export async function POST(request: Request) {
  if (!originAllowed(request)) return NextResponse.json({ error: "Request origin was rejected." }, { status: 403 });
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign-in is required." }, { status: 401 });
  if (user.role !== "ORGANIZER" && user.role !== "ADMIN") return NextResponse.json({ error: "Organizer access is required." }, { status: 403 });
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  const input = body as Record<string, unknown>;
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const description = typeof input.description === "string" ? input.description.trim() : "";
  const category = typeof input.category === "string" ? input.category.trim() : "";
  const location = typeof input.location === "string" ? input.location.trim() : "";
  const startsAt = typeof input.startsAt === "string" ? new Date(input.startsAt) : new Date(NaN);
  const endsAt = typeof input.endsAt === "string" ? new Date(input.endsAt) : new Date(NaN);
  const capacity = input.capacity;
  const status = input.status === "published" ? EventStatus.PUBLISHED : input.status === "draft" ? EventStatus.DRAFT : null;
  if (!title || title.length > 160 || !description || description.length > 12000 || !category || category.length > 80 || !location || location.length > 200 || Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime()) || endsAt <= startsAt || !Number.isInteger(capacity) || (capacity as number) < 1 || (capacity as number) > 100000 || !status) {
    return NextResponse.json({ error: "Event fields are invalid." }, { status: 400 });
  }
  try {
    const event = await prisma.event.create({ data: { title, description, category, location, startsAt, endsAt, capacity: capacity as number, status, organizerId: user.id } });
    return NextResponse.json(event, { status: 201 });
  } catch (error) { return apiError(error); }
}
