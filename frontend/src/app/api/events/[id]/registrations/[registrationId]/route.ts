import { NextResponse } from "next/server";
import { RegistrationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { apiError, originAllowed } from "@/lib/api-response";
import { currentUser } from "@/lib/session";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; registrationId: string }> }) {
  if (!originAllowed(request)) return NextResponse.json({ error: "Request origin was rejected." }, { status: 403 });
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign-in is required." }, { status: 401 });
  if (user.role !== "ORGANIZER" && user.role !== "ADMIN") return NextResponse.json({ error: "Organizer access is required." }, { status: 403 });
  const { id, registrationId } = await params;
  try {
    const row = await prisma.registration.findUnique({ where: { id: registrationId }, select: { id: true, eventId: true, status: true, event: { select: { organizerId: true } } } });
    if (!row || row.eventId !== id) return NextResponse.json({ error: "Registration not found." }, { status: 404 });
    if (row.event.organizerId !== user.id && user.role !== "ADMIN") return NextResponse.json({ error: "You cannot check in this attendee." }, { status: 403 });
    if (row.status !== RegistrationStatus.REGISTERED) return NextResponse.json({ error: "Only active registrations can be checked in." }, { status: 409 });
    const updated = await prisma.registration.update({ where: { id: row.id }, data: { status: RegistrationStatus.CHECKED_IN, checkedInAt: new Date() }, select: { id: true, status: true, checkedInAt: true, ticketCode: true } });
    return NextResponse.json(updated);
  } catch (error) { return apiError(error); }
}
