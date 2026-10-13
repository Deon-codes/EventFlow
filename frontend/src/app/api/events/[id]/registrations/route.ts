import { NextResponse } from "next/server";
import { originAllowed } from "@/lib/api-response";
import { currentUser } from "@/lib/session";
import { dbService } from "@/lib/db-service";

type Context = { params: Promise<{ id: string }> };

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: Context) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign-in is required." }, { status: 401 });
  const { id } = await params;

  try {
    const event = await dbService.getEventById(id);
    if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });

    if (user.role === "STUDENT") {
      const allStudentRegs = await dbService.getStudentRegistrations(user.id);
      const own = allStudentRegs.find((r: any) => (r.event?.id || r.eventId) === id);
      return NextResponse.json(own || null);
    }

    if (user.role !== "ADMIN" && event.organizerId !== user.id) {
      return NextResponse.json({ error: "You cannot view this attendee list." }, { status: 403 });
    }

    const registrations = await dbService.getEventRegistrations(id);
    return NextResponse.json(registrations);
  } catch (error) {
    console.error("GET /api/events/[id]/registrations error:", error);
    return NextResponse.json({ error: "Could not retrieve registrations." }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: Context) {
  if (!originAllowed(request)) {
    return NextResponse.json({ error: "Request origin was rejected." }, { status: 403 });
  }

  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign-in is required to register for events." }, { status: 401 });
  }

  if (user.role !== "STUDENT") {
    return NextResponse.json({ error: "Only student accounts can book event tickets." }, { status: 403 });
  }

  const { id } = await params;
  try {
    const registration = await dbService.createRegistration(id, user.id);
    return NextResponse.json(registration, { status: 201 });
  } catch (error: any) {
    const message = error.message || "Registration could not be completed.";
    const status = message.includes("already registered") || message.includes("full") ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
