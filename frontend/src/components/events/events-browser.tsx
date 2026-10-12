"use client";

import { useMemo, useState } from "react";
import { CalendarX2, LayoutGrid, Rows3, SearchX } from "lucide-react";
import { EventCard } from "@/components/events/event-card";
import { EventFilters } from "@/components/events/event-filters";
import { EventListItem } from "@/components/events/event-list-item";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PillTabs } from "@/components/ui/segmented";
import {
  filterEvents,
  type DateFilterValue,
  type SortValue,
} from "@/lib/events";
import { EVENT_CATEGORIES, type CampusEvent, type EventCategory } from "@/types";

type Layout = "grid" | "list";

const CATEGORY_TABS: ReadonlyArray<{ value: EventCategory | "all"; label: string }> = [
  { value: "all", label: "All" },
  ...EVENT_CATEGORIES.map((category) => ({ value: category, label: category })),
] as const;

export function EventsBrowser({
  events,
  registeredIds = [],
  initialQuery = "",
  initialCategory = "all",
  initialDate = "all",
  initialSort = "soonest",
}: {
  events: CampusEvent[];
  registeredIds?: string[];
  initialQuery?: string;
  initialCategory?: EventCategory | "all";
  initialDate?: DateFilterValue;
  initialSort?: SortValue;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<EventCategory | "all">(initialCategory);
  const [dateFilter, setDateFilter] = useState<DateFilterValue>(initialDate);
  const [sort, setSort] = useState<SortValue>(initialSort);
  const [layout, setLayout] = useState<Layout>("grid");

  const results = useMemo(
    () => filterEvents(events, { query, category, dateFilter, sort }),
    [events, query, category, dateFilter, sort],
  );

  const registered = useMemo(() => new Set(registeredIds), [registeredIds]);
  const filtersActive =
    query.trim().length > 0 || category !== "all" || dateFilter !== "all";

  function resetFilters() {
    setQuery("");
    setCategory("all");
    setDateFilter("all");
    setSort("soonest");
  }

  return (
    <div className="space-y-6">
      <EventFilters
        query={query}
        onQueryChange={setQuery}
        category={category}
        onCategoryChange={setCategory}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        sort={sort}
        onSortChange={setSort}
        resultCount={results.length}
        onReset={resetFilters}
        placeholder="Search by title, venue, category or tag"
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <PillTabs
          label="Event category"
          options={CATEGORY_TABS}
          value={category}
          onChange={setCategory}
          className="max-w-full"
        />
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-400">
            View
          </span>
          <div className="inline-flex items-center gap-1 rounded-2xl border border-cream-200 bg-white p-1 shadow-soft">
            <button
              type="button"
              aria-label="Grid view"
              aria-pressed={layout === "grid"}
              onClick={() => setLayout("grid")}
              className={
                layout === "grid"
                  ? "grid size-9 place-items-center rounded-xl bg-bark-800 text-white"
                  : "grid size-9 place-items-center rounded-xl text-ink-500 hover:bg-cream-200"
              }
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              type="button"
              aria-label="List view"
              aria-pressed={layout === "list"}
              onClick={() => setLayout("list")}
              className={
                layout === "list"
                  ? "grid size-9 place-items-center rounded-xl bg-bark-800 text-white"
                  : "grid size-9 place-items-center rounded-xl text-ink-500 hover:bg-cream-200"
              }
            >
              <Rows3 className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {results.length === 0 ? (
        <EmptyState
          icon={
            filtersActive ? (
              <SearchX aria-hidden="true" className="size-6" />
            ) : (
              <CalendarX2 aria-hidden="true" className="size-6" />
            )
          }
          title={filtersActive ? "No events match these filters" : "No events published yet"}
          description={
            filtersActive
              ? "Try a different category, widen the date range, or clear the filters to see every upcoming event."
              : "Once organizers publish their events they will appear here."
          }
          action={
            filtersActive ? (
              <Button variant="secondary" size="sm" onClick={resetFilters}>
                Clear filters
              </Button>
            ) : (
              <ButtonLink href="/dashboard" variant="secondary" size="sm">
                Open organizer dashboard
              </ButtonLink>
            )
          }
        />
      ) : layout === "grid" ? (
        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {results.map((event) => (
            <li key={event.id} className="h-full">
              <EventCard event={event} registered={registered.has(event.id)} />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="space-y-4">
          {results.map((event) => (
            <li key={event.id}>
              <EventListItem event={event} registered={registered.has(event.id)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
