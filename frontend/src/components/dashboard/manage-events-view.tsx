"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarX2,
  CircleCheckBig,
  Copy,
  Pencil,
  SearchX,
  Users,
} from "lucide-react";
import { EventsTable } from "@/components/dashboard/events-table";
import { EventFilters } from "@/components/events/event-filters";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Notice } from "@/components/ui/notice";
import { SegmentedControl } from "@/components/ui/segmented";
import type { CampusEvent, EventCategory, EventStatus } from "@/types";
import { filterEvents, organizerSummary, type SortValue } from "@/lib/events";

type StatusFilter = "all" | EventStatus;

const STATUS_TABS: ReadonlyArray<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "completed", label: "Completed" },
];

export function ManageEventsView({
  events,
  initialQuery = "",
  initialStatus = "all",
  initialCategory = "all",
  initialSort = "soonest",
}: {
  events: CampusEvent[];
  initialQuery?: string;
  initialStatus?: StatusFilter;
  initialCategory?: EventCategory | "all";
  initialSort?: SortValue;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [status, setStatus] = useState<StatusFilter>(initialStatus);
  const [category, setCategory] = useState<EventCategory | "all">(initialCategory);
  const [sort, setSort] = useState<SortValue>(initialSort);
  const [overrides, setOverrides] = useState<Record<string, EventStatus>>({});
  const [message, setMessage] = useState<string | null>(null);

  const withOverrides = useMemo(
    () => events.map((event) => (overrides[event.id] ? { ...event, status: overrides[event.id] } : event)),
    [events, overrides],
  );

  const counts = useMemo(() => organizerSummary(withOverrides), [withOverrides]);

  const results = useMemo(() => {
    const filtered = filterEvents(withOverrides, {
      query,
      category,
      sort,
      includeUnpublished: true,
    });
    return status === "all" ? filtered : filtered.filter((event) => event.status === status);
  }, [withOverrides, query, category, sort, status]);

  const filtersActive = query.trim().length > 0 || category !== "all" || status !== "all";

  function resetFilters() {
    setQuery("");
    setCategory("all");
    setStatus("all");
    setSort("soonest");
  }

  function changeStatus(event: CampusEvent, next: EventStatus) {
    setOverrides((current) => ({ ...current, [event.id]: next }));
    setMessage(
      `“${event.title}” marked as ${next} in this browser session only. Publishing status changes is not wired to PATCH /api/events/${event.id} yet.`,
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl
          label="Filter by status"
          options={STATUS_TABS.map((tab) => ({
            ...tab,
            count:
              tab.value === "all"
                ? counts.totalEvents
                : tab.value === "published"
                  ? counts.publishedEvents
                  : tab.value === "draft"
                    ? counts.draftEvents
                    : counts.completedEvents,
          }))}
          value={status}
          onChange={setStatus}
        />
        <ButtonLink
          href="/dashboard/events/new"
          size="sm"
          className="ml-auto"
          icon={<CalendarX2 className="size-3.5" />}
        >
          New event
        </ButtonLink>
      </div>

      <EventFilters
        query={query}
        onQueryChange={setQuery}
        category={category}
        onCategoryChange={setCategory}
        sort={sort}
        onSortChange={setSort}
        resultCount={results.length}
        resultLabel="events in this workspace"
        onReset={resetFilters}
        placeholder="Search your events by title, venue or tag"
      />

      {message ? (
        <Notice tone="info" action={<Button size="sm" variant="ghost" onClick={() => setMessage(null)}>Dismiss</Button>}>
          {message}
        </Notice>
      ) : null}

      <div className="overflow-hidden rounded-card border border-cream-200 bg-white shadow-soft">
        {results.length === 0 ? (
          <EmptyState
            className="border-0 bg-transparent"
            icon={
              filtersActive ? (
                <SearchX aria-hidden="true" className="size-6" />
              ) : (
                <CalendarX2 aria-hidden="true" className="size-6" />
              )
            }
            title={filtersActive ? "No events in this view" : "No events yet"}
            description={
              filtersActive
                ? "Adjust the status, category or search term to find the event you are looking for."
                : "Create your first campus event and it will show up here as a draft until you publish it."
            }
            action={
              filtersActive ? (
                <Button variant="secondary" size="sm" onClick={resetFilters}>
                  Clear filters
                </Button>
              ) : (
                <ButtonLink href="/dashboard/events/new" size="sm">
                  Create event
                </ButtonLink>
              )
            }
          />
        ) : (
          <EventsTable
            events={results}
            caption="All organizer events"
            actions={(event) => (
              <div className="flex items-center justify-end gap-1.5">
                <Link
                  href={`/dashboard/events/${event.id}/edit`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-cream-300 px-3 py-1.5 text-xs font-semibold text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-700"
                >
                  <Pencil aria-hidden="true" className="size-3.5" />
                  Edit
                </Link>
                <Link
                  href={`/dashboard/attendees?event=${event.id}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-cream-200 px-3 py-1.5 text-xs font-semibold text-ink-700 transition-colors hover:bg-cream-300"
                >
                  <Users aria-hidden="true" className="size-3.5" />
                  Attendees
                </Link>
                {event.status === "draft" ? (
                  <button
                    type="button"
                    onClick={() => changeStatus(event, "published")}
                    className="inline-flex items-center gap-1.5 rounded-full bg-leaf-100 px-3 py-1.5 text-xs font-semibold text-leaf-500 transition-colors hover:bg-leaf-500 hover:text-white"
                  >
                    <CircleCheckBig aria-hidden="true" className="size-3.5" />
                    Publish
                  </button>
                ) : event.status === "published" ? (
                  <button
                    type="button"
                    onClick={() => changeStatus(event, "completed")}
                    className="inline-flex items-center gap-1.5 rounded-full bg-cream-200 px-3 py-1.5 text-xs font-semibold text-ink-700 transition-colors hover:bg-cream-300"
                  >
                    <Copy aria-hidden="true" className="size-3.5" />
                    Mark done
                  </button>
                ) : (
                  <span className="text-xs text-ink-400">Archived</span>
                )}
              </div>
            )}
          />
        )}
      </div>

      <Notice tone="warning" className="text-xs">
        <span className="font-semibold">Status changes are local.</span> Publishing, archiving and
        duplicating events only update this browser view. The AWS milestone writes them through
        the events API into Amazon RDS, with posters uploaded to Amazon S3.
      </Notice>
    </div>
  );
}
