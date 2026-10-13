import { NextResponse } from "next/server";
import { originAllowed } from "@/lib/api-response";
import { currentUser } from "@/lib/session";
import { dbService } from "@/lib/db-service";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; registrationId: string }> }
) {
  if (!originAllowed(request)) {
    return NextResponse.json({ error: "Request origin was rejected." }, { status: 403 });
  }

  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign-in is required." }, { status: 401 });
  if (user.role !== "ORGANIZER" && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Organizer access is required." }, { status: 403 });
  }

  const { id, registrationId } = await params;
  try {
    const updated = await dbService.checkInRegistration(registrationId, id);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to check in attendee." }, { status: 400 });
  }
}
