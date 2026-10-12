import type { Metadata } from "next";
import { CalendarSearch } from "lucide-react";
import { EventsBrowser } from "@/components/events/events-browser";
import { StudentRail } from "@/components/layout/student-rail";
import { Badge } from "@/components/ui/badge";
import { BackendNotice } from "@/components/ui/notice";
import { DATE_FILTERS, allEvents, registrationsForStudent, type SortValue } from "@/lib/events";
import { CURRENT_STUDENT } from "@/lib/mock-data";
import { EVENT_CATEGORIES, type EventCategory } from "@/types";

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

  const events = allEvents();
  const registeredIds = registrationsForStudent(CURRENT_STUDENT.id).map(
    (registration) => registration.eventId,
  );

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
            Search by title, venue or tag, then narrow the list by category, date window and
            popularity. Filters run instantly on the sample data set.
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
          <BackendNotice endpoint="GET /api/events?category=&from=&to=">
            Filters and search are applied in the browser over the bundled sample events.
            Server-side pagination and full-text search will replace them once the RDS-backed
            API is live.
          </BackendNotice>
        </div>
        <StudentRail />
      </div>
    </div>
  );
}
