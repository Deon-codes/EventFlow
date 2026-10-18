"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CalendarPlus, ChevronDown, Search } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { ButtonLink } from "@/components/ui/button";

/** Reference A's workspace top bar. */
export function DashboardTopbar({
  organizer,
}: {
  organizer?: { name: string; email: string; role?: string };
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const name = organizer?.name || "Organizer";
  const roleLabel = organizer?.role === "ADMIN" ? "Administrator" : "Event Organizer";

  return (
    <div className="sticky top-0 z-30 border-b border-cream-200 bg-cloud-100/95 backdrop-blur">
      <div className="flex items-center gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
        <form
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            const trimmed = query.trim();
            router.push(
              trimmed
                ? `/dashboard/events?q=${encodeURIComponent(trimmed)}`
                : "/dashboard/events",
            );
          }}
          className="relative min-w-0 flex-1 lg:max-w-md"
        >
          <label htmlFor="dashboard-search" className="sr-only">
            Search events and attendees
          </label>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-400"
          />
          <input
            id="dashboard-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search events, attendee names or ticket codes"
            className="h-11 w-full rounded-full border border-cream-200 bg-white pl-11 pr-4 text-sm shadow-soft placeholder:text-ink-400 focus:border-brand-400 focus:outline-none"
          />
        </form>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <ButtonLink
            href="/dashboard/events/new"
            variant="primary"
            size="sm"
            className="hidden sm:inline-flex"
            icon={<CalendarPlus className="size-4" />}
          >
            New event
          </ButtonLink>

          <button
            type="button"
            aria-label="Notifications (available after the backend milestone)"
            title="Notification centre arrives with the backend milestone"
            className="relative grid size-11 place-items-center rounded-full border border-cream-200 bg-white text-ink-700 shadow-soft transition-colors hover:border-brand-300 hover:text-brand-600"
          >
            <Bell className="size-4" />
            <span className="absolute right-3 top-3 size-2 rounded-full bg-berry-500" />
          </button>

          <Link
            href="/profile"
            className="flex items-center gap-2.5 rounded-full border border-cream-200 bg-white py-1.5 pl-1.5 pr-3 shadow-soft transition-colors hover:border-brand-300"
          >
            <Avatar name={name} tone="brand" size="sm" />
            <span className="hidden leading-tight sm:block">
              <span className="block text-sm font-semibold text-ink-900">
                {name}
              </span>
              <span className="block text-[0.68rem] text-ink-500">
                {roleLabel}
              </span>
            </span>
            <ChevronDown aria-hidden="true" className="size-4 text-ink-400" />
          </Link>
        </div>
      </div>
    </div>
  );
}
