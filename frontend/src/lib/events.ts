/**
 * Read helpers over the mock data set.
 *
 * In the AWS milestone each export here becomes a thin wrapper around a
 * server-side query (RDS via Prisma, or a route handler on EC2), so the UI
 * components never need to change.
 */

import {
  CURRENT_ORGANIZER,
  MOCK_EVENTS,
  MOCK_REGISTRATIONS,
} from "@/lib/mock-data";
import { DEMO_TODAY, daysBetween, percent } from "@/lib/format";
import type {
  AvatarTone,
  CampusEvent,
  EventCategory,
  EventStatus,
  OrganizerSummary,
  Registration,
  RegistrationStatus,
} from "@/types";

/* -------------------------------------------------------------- selectors */

export function allEvents(): CampusEvent[] {
  return MOCK_EVENTS;
}

export function getEventById(id: string): CampusEvent | undefined {
  return MOCK_EVENTS.find((event) => event.id === id);
}

export function organizerEvents(): CampusEvent[] {
  return MOCK_EVENTS.filter((event) => event.organizerId === CURRENT_ORGANIZER.id);
}

export function upcomingEvents(from: string = DEMO_TODAY): CampusEvent[] {
  return MOCK_EVENTS.filter(
    (event) => event.status === "published" && daysBetween(from, event.startsAt) >= 0,
  ).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export function featuredEvents(): CampusEvent[] {
  return upcomingEvents().filter((event) => event.featured).slice(0, 3);
}

export function relatedEvents(event: CampusEvent, limit = 3): CampusEvent[] {
  return upcomingEvents()
    .filter((candidate) => candidate.id !== event.id)
    .sort((a, b) => {
      const score = (candidate: CampusEvent) =>
        (candidate.category === event.category ? 2 : 0) +
        candidate.tags.filter((tag) => event.tags.includes(tag)).length;
      return score(b) - score(a);
    })
    .slice(0, limit);
}

export function registrationsForEvent(eventId: string): Registration[] {
  return MOCK_REGISTRATIONS.filter((registration) => registration.eventId === eventId);
}

export function registrationsForStudent(studentId: string): Registration[] {
  return MOCK_REGISTRATIONS.filter((registration) => registration.studentId === studentId);
}

export function registrationFor(
  eventId: string,
  studentId: string,
): Registration | undefined {
  return MOCK_REGISTRATIONS.find(
    (registration) =>
      registration.eventId === eventId &&
      registration.studentId === studentId &&
      registration.status !== "cancelled",
  );
}

/* ----------------------------------------------------------- filters/sort */

export const DATE_FILTERS = [
  { value: "all", label: "Any date" },
  { value: "week", label: "This week" },
  { value: "month", label: "Next 30 days" },
  { value: "semester", label: "Next 90 days" },
] as const;

export type DateFilterValue = (typeof DATE_FILTERS)[number]["value"];

export const SORT_OPTIONS = [
  { value: "soonest", label: "Soonest first" },
  { value: "popular", label: "Most registered" },
  { value: "newest", label: "Recently added" },
  { value: "title", label: "Title A–Z" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export interface EventQuery {
  query?: string;
  category?: EventCategory | "all";
  dateFilter?: DateFilterValue;
  sort?: SortValue;
  /** Organizer views also surface drafts and completed events. */
  includeUnpublished?: boolean;
  from?: string;
}

export function searchEvents(
  events: CampusEvent[],
  query: string,
): CampusEvent[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return events;
  return events.filter((event) =>
    [event.title, event.summary, event.venue, event.building ?? "", event.category, ...event.tags]
      .join(" ")
      .toLowerCase()
      .includes(needle),
  );
}

export function filterEvents(events: CampusEvent[], options: EventQuery): CampusEvent[] {
  const {
    query = "",
    category = "all",
    dateFilter = "all",
    sort = "soonest",
    includeUnpublished = false,
    from = DEMO_TODAY,
  } = options;

  const windowInDays = { week: 7, month: 30, semester: 90 } as const;

  let result = events.filter((event) => {
    if (!includeUnpublished && event.status !== "published") return false;
    if (category !== "all" && event.category !== category) return false;

    const offset = daysBetween(from, event.startsAt);
    if (includeUnpublished) {
      // Organizer lists show drafts and past events regardless of the window.
      if (dateFilter !== "all") {
        const window = windowInDays[dateFilter as keyof typeof windowInDays];
        if (offset < 0 || offset > window) return false;
      }
    } else {
      if (offset < 0) return false;
      if (dateFilter !== "all") {
        const window = windowInDays[dateFilter as keyof typeof windowInDays];
        if (offset > window) return false;
      }
    }
    return true;
  });

  result = searchEvents(result, query);

  result = [...result].sort((a, b) => {
    switch (sort) {
      case "popular":
        return b.registered - a.registered;
      case "newest":
        return b.createdAt.localeCompare(a.createdAt);
      case "title":
        return a.title.localeCompare(b.title);
      default:
        return a.startsAt.localeCompare(b.startsAt);
    }
  });

  return result;
}

/* --------------------------------------------------------------- capacity */

export function spotsLeft(event: CampusEvent): number {
  return Math.max(event.capacity - event.registered, 0);
}

export function fillRate(event: CampusEvent): number {
  return percent(event.registered, event.capacity);
}

export function isSoldOut(event: CampusEvent): boolean {
  return spotsLeft(event) === 0;
}

export function isRegistrationClosed(
  event: CampusEvent,
  from: string = DEMO_TODAY,
): boolean {
  return daysBetween(from, event.registrationClosesAt) < 0;
}

/* ------------------------------------------------------------ org summary */

export function organizerSummary(
  events: CampusEvent[] = organizerEvents(),
  registrations: Registration[] = MOCK_REGISTRATIONS,
): OrganizerSummary {
  const published = events.filter((event) => event.status === "published");
  const upcoming = published.filter(
    (event) => daysBetween(DEMO_TODAY, event.startsAt) >= 0,
  );
  const completed = events.filter((event) => event.status === "completed");
  const ids = new Set(events.map((event) => event.id));
  const scoped = registrations.filter((registration) => ids.has(registration.eventId));

  const totalCapacity = events.reduce((total, event) => total + event.capacity, 0);
  const activeRegistrations = scoped.filter(
    (registration) => registration.status !== "cancelled",
  ).length;

  // Attendance is only meaningful for events that already happened.
  const completedIds = new Set(completed.map((event) => event.id));
  const completedRegistrations = scoped.filter((registration) =>
    completedIds.has(registration.eventId),
  );
  const attended = completedRegistrations.filter(
    (registration) => registration.status === "attended",
  ).length;

  return {
    totalEvents: events.length,
    publishedEvents: published.length,
    upcomingEvents: upcoming.length,
    draftEvents: events.filter((event) => event.status === "draft").length,
    completedEvents: completed.length,
    totalRegistrations: activeRegistrations,
    waitlisted: scoped.filter((registration) => registration.status === "waitlisted")
      .length,
    averageFillRate: percent(
      events.reduce((total, event) => total + event.registered, 0),
      totalCapacity,
    ),
    checkedInRate: percent(attended, completedRegistrations.length),
  };
}

/* ---------------------------------------------------- visual metadata maps */

export interface CategoryTone {
  badge: string;
  poster: {
    bg: string;
    blob: string;
    accent: string;
    ink: string;
  };
}

export const CATEGORY_TONES: Record<EventCategory, CategoryTone> = {
  Technology: {
    badge: "bg-sky-100 text-sky-500",
    poster: { bg: "#e3ebfb", blob: "#c9d9f7", accent: "#8fb0ee", ink: "#2f5aa6" },
  },
  Workshops: {
    badge: "bg-brand-100 text-brand-700",
    poster: { bg: "#fbe7d3", blob: "#f7d3b0", accent: "#eba06a", ink: "#a9552b" },
  },
  "Arts & Culture": {
    badge: "bg-plum-100 text-plum-500",
    poster: { bg: "#efe1f8", blob: "#ddc4f0", accent: "#b689dd", ink: "#743f9f" },
  },
  Sports: {
    badge: "bg-mint-100 text-mint-500",
    poster: { bg: "#ddf3ec", blob: "#bfe8dd", accent: "#7fd0bb", ink: "#1f7c68" },
  },
  Career: {
    badge: "bg-leaf-100 text-leaf-500",
    poster: { bg: "#e0f2e8", blob: "#c2e6d2", accent: "#7fc7a0", ink: "#24734f" },
  },
  Music: {
    badge: "bg-brand-100 text-berry-500",
    poster: { bg: "#fbe1e6", blob: "#f6c6d1", accent: "#e58da3", ink: "#9c2b45" },
  },
  Academic: {
    badge: "bg-cream-200 text-ink-700",
    poster: { bg: "#fdf0cd", blob: "#f8e0a2", accent: "#dab75c", ink: "#8d6a12" },
  },
  Social: {
    badge: "bg-clay-100 text-clay-500",
    poster: { bg: "#fbe6dc", blob: "#f6cebd", accent: "#e79d80", ink: "#a54a28" },
  },
};

export function categoryTone(category: EventCategory): CategoryTone {
  return CATEGORY_TONES[category];
}

interface StatusMeta {
  label: string;
  badge: string;
  dot: string;
}

export const STATUS_META: Record<EventStatus, StatusMeta> = {
  published: {
    label: "Published",
    badge: "bg-leaf-100 text-leaf-500",
    dot: "bg-leaf-500",
  },
  draft: {
    label: "Draft",
    badge: "bg-brand-100 text-brand-700",
    dot: "bg-brand-500",
  },
  completed: {
    label: "Completed",
    badge: "bg-cream-200 text-ink-700",
    dot: "bg-ink-400",
  },
  cancelled: {
    label: "Cancelled",
    badge: "bg-berry-500/10 text-berry-500",
    dot: "bg-berry-500",
  },
};

export const REGISTRATION_STATUS_META: Record<RegistrationStatus, StatusMeta> = {
  confirmed: {
    label: "Confirmed",
    badge: "bg-leaf-100 text-leaf-500",
    dot: "bg-leaf-500",
  },
  pending: {
    label: "Pending",
    badge: "bg-brand-100 text-brand-700",
    dot: "bg-brand-500",
  },
  waitlisted: {
    label: "Waitlisted",
    badge: "bg-plum-100 text-plum-500",
    dot: "bg-plum-500",
  },
  attended: {
    label: "Attended",
    badge: "bg-sky-100 text-sky-500",
    dot: "bg-sky-500",
  },
  cancelled: {
    label: "Cancelled",
    badge: "bg-berry-500/10 text-berry-500",
    dot: "bg-berry-500",
  },
};

export const REGISTRATION_STATUS_FILTERS = [
  { value: "all", label: "All statuses" },
  { value: "confirmed", label: "Confirmed" },
  { value: "pending", label: "Pending" },
  { value: "waitlisted", label: "Waitlisted" },
  { value: "attended", label: "Attended" },
  { value: "cancelled", label: "Cancelled" },
] as const;

const AVATAR_TONES: AvatarTone[] = ["brand", "berry", "mint", "plum", "sky", "clay"];

export const AVATAR_TONE_CLASSES: Record<AvatarTone, string> = {
  brand: "bg-brand-500 text-white",
  berry: "bg-berry-500 text-white",
  mint: "bg-mint-500 text-white",
  plum: "bg-plum-500 text-white",
  sky: "bg-sky-500 text-white",
  clay: "bg-clay-500 text-white",
};

export function toneForSeed(seed: string): AvatarTone {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 33 + seed.charCodeAt(index)) % 997;
  }
  return AVATAR_TONES[hash % AVATAR_TONES.length];
}
