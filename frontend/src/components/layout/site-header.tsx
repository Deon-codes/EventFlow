"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  CalendarPlus,
  Menu,
  Search,
  SlidersHorizontal,
  Ticket,
  X,
} from "lucide-react";
import { BrandLogo } from "@/components/layout/brand-logo";
import { StudentNavLinks } from "@/components/layout/student-sidebar";
import { Avatar } from "@/components/ui/avatar";
import { ButtonLink } from "@/components/ui/button";
import { CURRENT_STUDENT } from "@/lib/mock-data";

/** Reference B's top bar: rounded search, quick filters, alerts, account. */
export function SiteHeader() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  function submitSearch(value: string) {
    const trimmed = value.trim();
    router.push(trimmed ? `/events?q=${encodeURIComponent(trimmed)}` : "/events");
    setDrawerOpen(false);
  }

  return (
    <header className="space-y-3">
      <div className="flex items-center gap-3 lg:hidden">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open navigation menu"
          className="grid size-11 place-items-center rounded-2xl border border-cream-200 bg-white text-ink-700 shadow-soft"
        >
          <Menu className="size-5" />
        </button>
        <BrandLogo className="flex-1" />
        <Link
          href="/profile"
          aria-label="Your profile"
          className="rounded-full ring-2 ring-white"
        >
          <Avatar name={CURRENT_STUDENT.name} tone={CURRENT_STUDENT.avatarTone} />
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <form
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            submitSearch(query);
          }}
          className="relative flex-1"
        >
          <label htmlFor="site-search" className="sr-only">
            Search campus events
          </label>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-400"
          />
          <input
            id="site-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search events, workshops, clubs…"
            className="h-12 w-full rounded-full border border-cream-200 bg-white pl-11 pr-4 text-sm text-ink-900 shadow-soft placeholder:text-ink-400 focus:border-brand-400 focus:outline-none"
          />
        </form>

        <ButtonLink
          href="/events?sort=soonest"
          variant="secondary"
          size="icon"
          aria-label="Open all events with filters"
          className="size-12 rounded-full"
          icon={<SlidersHorizontal className="size-4" />}
        />

        <button
          type="button"
          aria-label="Notifications (available after the backend milestone)"
          title="Notifications arrive with the backend milestone"
          className="relative hidden size-12 place-items-center rounded-full border border-cream-200 bg-white text-ink-700 shadow-soft transition-colors hover:border-brand-300 hover:text-brand-600 sm:grid"
        >
          <Bell className="size-4" />
          <span className="absolute right-3 top-3 size-2 rounded-full bg-berry-500" />
        </button>

        <ButtonLink
          href="/dashboard"
          variant="primary"
          className="hidden lg:inline-flex"
          icon={<CalendarPlus className="size-4" />}
        >
          Organizer mode
        </ButtonLink>

        <Link
          href="/profile"
          className="hidden items-center gap-3 rounded-full border border-cream-200 bg-white py-1.5 pl-1.5 pr-4 shadow-soft transition-colors hover:border-brand-300 lg:flex"
        >
          <Avatar name={CURRENT_STUDENT.name} tone={CURRENT_STUDENT.avatarTone} />
          <span className="leading-tight">
            <span className="block text-sm font-semibold text-ink-900">
              {CURRENT_STUDENT.name}
            </span>
            <span className="block text-xs text-ink-500">Student account</span>
          </span>
        </Link>
      </div>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 left-0 flex w-[85%] max-w-sm flex-col gap-4 overflow-y-auto bg-cream-50 p-5 shadow-rail">
            <div className="flex items-center justify-between">
              <BrandLogo />
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close navigation menu"
                className="grid size-10 place-items-center rounded-full border border-cream-300 bg-white text-ink-700"
              >
                <X className="size-4" />
              </button>
            </div>

            <form
              role="search"
              onSubmit={(event) => {
                event.preventDefault();
                submitSearch(query);
              }}
              className="relative"
            >
              <label htmlFor="drawer-search" className="sr-only">
                Search campus events
              </label>
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-400"
              />
              <input
                id="drawer-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search events"
                className="h-12 w-full rounded-full border border-cream-300 bg-white pl-11 pr-4 text-sm focus:border-brand-400 focus:outline-none"
              />
            </form>

            <StudentNavLinks onNavigate={() => setDrawerOpen(false)} />

            <div className="mt-auto space-y-3">
              <ButtonLink
                href="/dashboard"
                variant="primary"
                className="w-full"
                icon={<CalendarPlus className="size-4" />}
              >
                Organizer dashboard
              </ButtonLink>
              <div className="flex items-center gap-3 rounded-2xl border border-cream-200 bg-white p-3">
                <Avatar name={CURRENT_STUDENT.name} tone={CURRENT_STUDENT.avatarTone} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink-900">
                    {CURRENT_STUDENT.name}
                  </p>
                  <p className="truncate text-xs text-ink-500">{CURRENT_STUDENT.email}</p>
                </div>
                <Link
                  href="/registrations"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="My tickets"
                  className="ml-auto grid size-9 place-items-center rounded-full bg-brand-50 text-brand-700"
                >
                  <Ticket className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
