import { NextResponse } from "next/server";
import { originAllowed } from "@/lib/api-response";
import { currentUser } from "@/lib/session";
import { dbService } from "@/lib/db-service";

export const runtime = "nodejs";

export async function GET() {
  try {
    const events = await dbService.getPublishedEvents();
    return NextResponse.json(events);
  } catch (error) {
    console.error("GET /api/events error:", error);
    return NextResponse.json({ error: "Could not retrieve events." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!originAllowed(request)) {
    return NextResponse.json({ error: "Request origin was rejected." }, { status: 403 });
  }

  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign-in is required." }, { status: 401 });
  }

  if (user.role !== "ORGANIZER" && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Organizer access is required to create events." }, { status: 403 });
  }

  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const input = body as Record<string, unknown>;
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const description = typeof input.description === "string" ? input.description.trim() : "";
  const category = typeof input.category === "string" ? input.category.trim() : "";
  const location = typeof input.location === "string" ? input.location.trim() : "";
  const startsAt = typeof input.startsAt === "string" ? new Date(input.startsAt) : new Date(NaN);
  const endsAt = typeof input.endsAt === "string" ? new Date(input.endsAt) : new Date(NaN);
  const capacity = Number(input.capacity) || 100;
  const status = input.status === "published" ? "PUBLISHED" : "DRAFT";

  if (!title || !description || !category || !location || Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
    return NextResponse.json({ error: "Please fill in all required event details." }, { status: 400 });
  }

  try {
    const event = await dbService.createEvent({
      title,
      description,
      category,
      location,
      startsAt,
      endsAt,
      capacity,
      status,
      organizerId: user.id,
    });
    return NextResponse.json(event, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/events error:", error);
    return NextResponse.json({ error: error.message || "Failed to create event." }, { status: 500 });
  }
}
