import type { Metadata } from "next";
import { CalendarSearch } from "lucide-react";
import { EventsBrowser } from "@/components/events/events-browser";
import { StudentRail } from "@/components/layout/student-rail";
import { Badge } from "@/components/ui/badge";
import { BackendNotice } from "@/components/ui/notice";
import { DATE_FILTERS, allEvents, registrationsForStudent, type SortValue } from "@/lib/events";
import { CURRENT_STUDENT } from "@/lib/mock-data";
import { EVENT_CATEGORIES, type EventCategory } from "@/types";
import { RegistrationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/session";
import { publishedEventsForUi } from "@/lib/event-mapper";
import { Notice } from "@/components/ui/notice";

export const metadata: Metadata = {
  title: "All events",
  description: "Browse and filter every published campus event on EventFlow.",
};

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const query = first(params.q) ?? "";
  const rawCategory = first(params.category);
  const rawDate = first(params.date);
  const rawSort = first(params.sort);

  const category: EventCategory | "all" =
    rawCategory && (EVENT_CATEGORIES as readonly string[]).includes(rawCategory)
      ? (rawCategory as EventCategory)
      : "all";
  const dateFilter = DATE_FILTERS.some((option) => option.value === rawDate)
    ? (rawDate as (typeof DATE_FILTERS)[number]["value"])
    : "all";
  const sort: SortValue =
    rawSort === "popular" || rawSort === "newest" || rawSort === "title"
      ? rawSort
      : "soonest";

  let events = allEvents();
  let liveError: string | null = null;
  let registeredIds = registrationsForStudent(CURRENT_STUDENT.id).map((registration) => registration.eventId);
  if (process.env.DATABASE_URL) {
    try {
      events = await publishedEventsForUi();
      const user = await currentUser();
      if (user?.role === "STUDENT") {
        const registrations = await prisma.registration.findMany({ where: { userId: user.id, status: { in: [RegistrationStatus.REGISTERED, RegistrationStatus.CHECKED_IN] } }, select: { eventId: true } });
        registeredIds = registrations.map((row) => row.eventId);
      } else registeredIds = [];
    } catch {
      events = [];
      registeredIds = [];
      liveError = "Published events could not be loaded. Please try again later.";
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge tone="brand" icon={<CalendarSearch className="size-3.5" />}>
            {events.filter((event) => event.status === "published").length} published events
          </Badge>
          <h1 className="mt-3 text-2xl font-bold text-ink-900 sm:text-3xl">
            All campus events
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-ink-500">
            Search by title or venue, then narrow the list by category, date window and popularity.
          </p>
        </div>
      </header>

      <div className="flex flex-col gap-6 xl:flex-row">
        <div className="min-w-0 flex-1 space-y-6">
          <EventsBrowser
            events={events}
            registeredIds={registeredIds}
            initialQuery={query}
            initialCategory={category}
            initialDate={dateFilter}
            initialSort={sort}
          />
          {liveError ? <Notice tone="danger" title="Event list unavailable">{liveError}</Notice> : null}
          {!process.env.DATABASE_URL ? <BackendNotice endpoint="GET /api/events">This local environment has no database configured, so the bundled sample events are shown.</BackendNotice> : null}
        </div>
        <StudentRail />
      </div>
    </div>
  );
}
