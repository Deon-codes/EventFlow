import type { Metadata } from "next";
import { ListChecks } from "lucide-react";
import { ManageEventsView } from "@/components/dashboard/manage-events-view";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { organizerEvents, organizerSummary, type SortValue } from "@/lib/events";
import { EVENT_CATEGORIES, type EventCategory, type EventStatus } from "@/types";

export const metadata: Metadata = {
  title: "Manage events",
  description: "Search, filter and update every event your office runs.",
};

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ManageEventsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const events = organizerEvents();
  const summary = organizerSummary(events);

  const rawStatus = first(params.status);
  const status: "all" | EventStatus =
    rawStatus === "published" || rawStatus === "draft" || rawStatus === "completed"
      ? rawStatus
      : "all";

  const rawCategory = first(params.category);
  const category: EventCategory | "all" =
    rawCategory && (EVENT_CATEGORIES as readonly string[]).includes(rawCategory)
      ? (rawCategory as EventCategory)
      : "all";

  const rawSort = first(params.sort);
  const sort: SortValue =
    rawSort === "popular" || rawSort === "newest" || rawSort === "title"
      ? rawSort
      : "soonest";

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge tone="brand" icon={<ListChecks className="size-3.5" />}>
            {summary.totalEvents} events · {summary.draftEvents} drafts
          </Badge>
          <h1 className="mt-3 text-2xl font-bold text-ink-900 sm:text-3xl">Manage events</h1>
          <p className="mt-1 max-w-2xl text-sm text-ink-500">
            Every event your workspace owns, with live capacity. Filter by status, search by
            title or venue, then edit details or jump into the attendee list.
          </p>
        </div>
        <ButtonLink href="/dashboard/events/new">Create event</ButtonLink>
      </header>

      <ManageEventsView
        events={events}
        initialQuery={first(params.q) ?? ""}
        initialStatus={status}
        initialCategory={category}
        initialSort={sort}
      />
    </div>
  );
}
