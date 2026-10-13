import { dbService, type StoredEvent } from "@/lib/db-service";
import { EVENT_CATEGORIES, type CampusEvent, type EventCategory } from "@/types";

export function toCampusEvent(row: StoredEvent | any, activeRegistrations = row.registered ?? 0): CampusEvent {
  const category = (EVENT_CATEGORIES as readonly string[]).includes(row.category)
    ? (row.category as EventCategory)
    : "Technology";

  const endsDate = new Date(row.endsAt);
  const status =
    row.status === "DRAFT" || row.status === "draft"
      ? "draft"
      : row.status === "CANCELLED" || row.status === "cancelled"
      ? "cancelled"
      : endsDate < new Date()
      ? "completed"
      : "published";

  const startsIso = typeof row.startsAt === "string" ? row.startsAt : row.startsAt.toISOString();
  const endsIso = typeof row.endsAt === "string" ? row.endsAt : row.endsAt.toISOString();
  const desc = typeof row.description === "string" ? row.description : "";

  return {
    id: row.id,
    title: row.title,
    summary: desc.length > 160 ? `${desc.slice(0, 157)}…` : desc || row.title,
    description: desc.split(/\n\s*\n/).filter(Boolean),
    category,
    status,
    startsAt: startsIso,
    endsAt: endsIso,
    registrationClosesAt: startsIso,
    venue: row.location || row.venue || "Campus Main Auditorium",
    isOnline: false,
    capacity: row.capacity,
    registered: activeRegistrations,
    waitlisted: 0,
    priceUsd: 0,
    organizerId: row.organizerId,
    tags: [category, "Campus"],
    featured: true,
    posterArt: "tech",
    posterUrl: row.posterUrl || null,
    createdAt: typeof row.createdAt === "string" ? row.createdAt : row.createdAt.toISOString(),
    highlights: ["Official Campus Certificate", "Refreshments Provided", "Hands-on Experience"],
  };
}

export async function publishedEventsForUi(): Promise<CampusEvent[]> {
  try {
    const rows = await dbService.getPublishedEvents();
    if (!rows.length) return [];
    return rows.map((row) => toCampusEvent(row, row.registered ?? 0));
  } catch (err) {
    console.error("Failed to load published events:", err);
    return [];
  }
}

export async function publishedEventForUi(id: string): Promise<CampusEvent | null> {
  try {
    const row = await dbService.getEventById(id);
    if (!row) return null;
    return toCampusEvent(row, row.registered ?? 0);
  } catch (err) {
    console.error("Failed to load event by id:", err);
    return null;
  }
}
