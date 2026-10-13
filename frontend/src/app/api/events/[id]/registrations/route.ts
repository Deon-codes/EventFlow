import { NextResponse } from "next/server";
import { EventStatus, RegistrationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { apiError, originAllowed } from "@/lib/api-response";
import { currentUser } from "@/lib/session";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign-in is required." }, { status: 401 });
  const { id } = await params;
  try {
    const event = await prisma.event.findUnique({ where: { id }, select: { organizerId: true } });
    if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });
    if (user.role === "STUDENT") {
      const own = await prisma.registration.findUnique({ where: { userId_eventId: { userId: user.id, eventId: id } }, select: { id: true, eventId: true, ticketCode: true, status: true, createdAt: true } });
      return NextResponse.json(own);
    }
    if (user.role !== "ADMIN" && event.organizerId !== user.id) return NextResponse.json({ error: "You cannot view this attendee list." }, { status: 403 });
    const registrations = await prisma.registration.findMany({ where: { eventId: id }, orderBy: { createdAt: "desc" }, select: { id: true, ticketCode: true, status: true, checkedInAt: true, createdAt: true, user: { select: { id: true, name: true, email: true } } } });
    return NextResponse.json(registrations);
  } catch (error) { return apiError(error); }
}

export async function POST(request: Request, { params }: Context) {
  if (!originAllowed(request)) return NextResponse.json({ error: "Request origin was rejected." }, { status: 403 });
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign-in is required." }, { status: 401 });
  if (user.role !== "STUDENT") return NextResponse.json({ error: "Student access is required to register." }, { status: 403 });
  const { id } = await params;
  try {
    const registration = await prisma.$transaction(async (tx) => {
      const rows = await tx.$queryRaw<Array<{ id: string }>>`SELECT "id" FROM "Event" WHERE "id" = ${id} FOR UPDATE`;
      if (rows.length === 0) return { error: "not-found" as const };
      const event = await tx.event.findUnique({ where: { id } });
      if (!event || event.status !== EventStatus.PUBLISHED || event.startsAt <= new Date()) return { error: "closed" as const };
      const existing = await tx.registration.findUnique({ where: { userId_eventId: { userId: user.id, eventId: id } } });
      if (existing && existing.status !== RegistrationStatus.CANCELLED) return { error: "duplicate" as const };
      const count = await tx.registration.count({ where: { eventId: id, status: { in: [RegistrationStatus.REGISTERED, RegistrationStatus.CHECKED_IN] } } });
      if (count >= event.capacity) return { error: "full" as const };
      if (existing) return tx.registration.update({ where: { id: existing.id }, data: { status: RegistrationStatus.REGISTERED, checkedInAt: null }, select: { id: true, eventId: true, ticketCode: true, status: true, createdAt: true } });
      return tx.registration.create({ data: { eventId: id, userId: user.id }, select: { id: true, eventId: true, ticketCode: true, status: true, createdAt: true } });
    });
    if ("error" in registration) {
      const status = registration.error === "not-found" ? 404 : registration.error === "full" || registration.error === "closed" ? 409 : 400;
      const message = registration.error === "not-found" ? "Event not found." : registration.error === "full" ? "This event is full; waitlists are not supported." : registration.error === "duplicate" ? "You are already registered." : "Registration is closed.";
      return NextResponse.json({ error: message }, { status: registration.error === "duplicate" ? 409 : status });
    }
    return NextResponse.json(registration, { status: 201 });
  } catch (error) { return apiError(error); }
}
