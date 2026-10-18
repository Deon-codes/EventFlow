import { NextResponse } from "next/server";
import { originAllowed } from "@/lib/api-response";
import { currentUser } from "@/lib/session";
import { dbService } from "@/lib/db-service";

type Context = { params: Promise<{ id: string }> };

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: Context) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Invalid event ID." }, { status: 400 });

  try {
    const event = await dbService.getEventById(id);
    if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });
    return NextResponse.json(event);
  } catch (error) {
    console.error("GET /api/events/[id] error:", error);
    return NextResponse.json({ error: "Could not retrieve event." }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Context) {
  if (!originAllowed(request)) {
    return NextResponse.json({ error: "Request origin was rejected." }, { status: 403 });
  }

  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign-in is required." }, { status: 401 });
  if (user.role !== "ORGANIZER" && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Organizer access is required." }, { status: 403 });
  }

  const { id } = await params;
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const input = body as Record<string, unknown>;
  const title = typeof input.title === "string" ? input.title.trim() : undefined;
  const description = typeof input.description === "string" ? input.description.trim() : undefined;
  const category = typeof input.category === "string" ? input.category.trim() : undefined;
  const location = typeof input.location === "string" ? input.location.trim() : undefined;
  const startsAt = typeof input.startsAt === "string" ? new Date(input.startsAt) : undefined;
  const endsAt = typeof input.endsAt === "string" ? new Date(input.endsAt) : undefined;
  const capacity = typeof input.capacity === "number" ? input.capacity : undefined;
  const status = input.status === "published" ? "PUBLISHED" : input.status === "draft" ? "DRAFT" : undefined;
  const posterUrl = typeof input.posterKey === "string" && input.posterKey.trim() ? input.posterKey.trim() : undefined;

  try {
    const existing = await dbService.getEventById(id);
    if (!existing) return NextResponse.json({ error: "Event not found." }, { status: 404 });
    if (existing.organizerId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "You cannot edit this event." }, { status: 403 });
    }

    const updated = await dbService.updateEvent(id, user.id, {
      title,
      description,
      category,
      location,
      startsAt,
      endsAt,
      capacity,
      status,
      posterUrl,
    });
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PATCH /api/events/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to update event." }, { status: 500 });
  }
}
