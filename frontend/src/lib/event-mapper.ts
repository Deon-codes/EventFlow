import { EventStatus, Prisma, RegistrationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { EVENT_CATEGORIES, type CampusEvent, type EventCategory } from "@/types";

type StoredEvent = Prisma.EventGetPayload<{ include: { _count: { select: { registrations: true } } } }>;

export function toCampusEvent(row: StoredEvent, activeRegistrations = row._count.registrations): CampusEvent {
  const category = (EVENT_CATEGORIES as readonly string[]).includes(row.category) ? row.category as EventCategory : "Academic";
  const status = row.status === EventStatus.DRAFT ? "draft" : row.status === EventStatus.CANCELLED ? "cancelled" : row.endsAt < new Date() ? "completed" : "published";
  return {
    id: row.id,
    title: row.title,
    summary: row.description.length > 160 ? `${row.description.slice(0, 157)}…` : row.description,
    description: row.description.split(/\n\s*\n/).filter(Boolean),
    category,
    status,
    startsAt: row.startsAt.toISOString(),
    endsAt: row.endsAt.toISOString(),
    registrationClosesAt: row.startsAt.toISOString(),
    venue: row.location,
    isOnline: false,
    capacity: row.capacity,
    registered: activeRegistrations,
    waitlisted: 0,
    priceUsd: 0,
    organizerId: row.organizerId,
    tags: [],
    featured: false,
    posterArt: "tech",
    createdAt: row.createdAt.toISOString(),
    highlights: [],
  };
}

export async function publishedEventsForUi() {
  const rows = await prisma.event.findMany({ where: { status: EventStatus.PUBLISHED }, orderBy: { startsAt: "asc" }, include: { _count: { select: { registrations: true } } } });
  if (!rows.length) return [];
  const counts = await prisma.registration.groupBy({ by: ["eventId"], where: { eventId: { in: rows.map((row) => row.id) }, status: { in: [RegistrationStatus.REGISTERED, RegistrationStatus.CHECKED_IN] } }, _count: { eventId: true } });
  const byEvent = new Map(counts.map((row) => [row.eventId, row._count.eventId]));
  return rows.map((row) => toCampusEvent(row, byEvent.get(row.id) ?? 0));
}

export async function publishedEventForUi(id: string) {
  const row = await prisma.event.findFirst({ where: { id, status: EventStatus.PUBLISHED }, include: { _count: { select: { registrations: true } } } });
  if (!row) return null;
  const registered = await prisma.registration.count({ where: { eventId: id, status: { in: [RegistrationStatus.REGISTERED, RegistrationStatus.CHECKED_IN] } } });
  return toCampusEvent(row, registered);
}
