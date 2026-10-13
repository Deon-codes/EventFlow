import type { Metadata } from "next";
import { CalendarSearch } from "lucide-react";
import { EventsBrowser } from "@/components/events/events-browser";
import { Badge } from "@/components/ui/badge";
import { DATE_FILTERS, allEvents, type SortValue } from "@/lib/events";
import { EVENT_CATEGORIES, type EventCategory } from "@/types";
import { currentUser } from "@/lib/session";
import { publishedEventsForUi } from "@/lib/event-mapper";
import { dbService } from "@/lib/db-service";

export const metadata: Metadata = {
  title: "Explore Events",
  description: "Browse and register for campus events on EventFlow.",
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

  let events = await publishedEventsForUi();
  if (!events.length) {
    events = allEvents();
  }

  const user = await currentUser();
  let registeredIds: string[] = [];
  if (user && user.role === "STUDENT") {
    const registrations = await dbService.getStudentRegistrations(user.id);
    registeredIds = registrations.map((row) => (row.event?.id || (row as any).eventId));
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
            <CalendarSearch className="size-3.5" />
            {events.length} Live Campus Events
          </span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Explore Campus Events
          </h1>
          <p className="mt-1 text-sm text-slate-500 max-w-2xl">
            Discover technical symposiums, cultural nights, sports tournaments, and professional workshops happening across campus.
          </p>
        </div>
      </header>

      <EventsBrowser
        events={events}
        registeredIds={registeredIds}
        initialQuery={query}
        initialCategory={category}
        initialDate={dateFilter}
        initialSort={sort}
      />
    </div>
  );
}
