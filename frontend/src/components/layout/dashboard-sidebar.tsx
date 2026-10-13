"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BadgeCheck,
  BarChart3,
  CalendarPlus,
  Compass,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  Settings,
  Users,
  X,
} from "lucide-react";
import { BrandLogo } from "@/components/layout/brand-logo";
import { Avatar } from "@/components/ui/avatar";
import { PromoArt } from "@/components/illustrations/illustrations";
import { CURRENT_ORGANIZER } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/events", label: "Manage events", icon: ListChecks, exact: false },
  { href: "/dashboard/attendees", label: "Attendees", icon: Users, exact: false },
] as const;

const SECONDARY = [
  { href: "/dashboard?view=insights", label: "Reports", icon: BarChart3 },
  { href: "/dashboard?view=settings", label: "Settings", icon: Settings },
] as const;

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Organizer navigation" className="space-y-1">
      {NAV.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-colors",
              active
                ? "bg-bark-700 text-white"
                : "text-white/60 hover:bg-bark-800 hover:text-white",
            )}
          >
            {active ? (
              <span
                aria-hidden="true"
                className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-brand-500"
              />
            ) : null}
            <Icon
              className={cn("size-4", active ? "text-brand-500" : "text-white/50")}
              aria-hidden="true"
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function RailContent({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter();
  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex items-center justify-between">
        <BrandLogo onDark href="/dashboard" subtitle="Organizer studio" />
        {onNavigate ? (
          <button
            type="button"
            onClick={onNavigate}
            aria-label="Close navigation"
            className="grid size-9 place-items-center rounded-full bg-bark-800 text-white/70 lg:hidden"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>

      <Link
        href="/dashboard/events/new"
        onClick={onNavigate}
        className="flex h-12 items-center justify-center gap-2 rounded-full bg-brand-500 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
      >
        <CalendarPlus className="size-4" />
        Create event
      </Link>

      <div className="flex-1 space-y-6 overflow-y-auto scrollbar-warm">
        <NavList onNavigate={onNavigate} />

        <div className="space-y-1 border-t border-white/10 pt-4">
          <p className="px-3.5 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-white/35">
            Workspace
          </p>
          {SECONDARY.map((item) => (
            <span
              key={item.label}
              className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-white/35"
              title="Available in a later milestone"
            >
              <item.icon aria-hidden="true" className="size-4" />
              {item.label}
              <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide">
                Soon
              </span>
            </span>
          ))}
        </div>

        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-white/60 transition-colors hover:bg-bark-800 hover:text-white"
        >
          <Compass aria-hidden="true" className="size-4 text-white/50" />
          Student view
        </Link>

        <div className="rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 p-4">
          <div className="flex items-center gap-2 text-white">
            <BadgeCheck aria-hidden="true" className="size-4" />
            <p className="text-sm font-semibold">Event API connected</p>
          </div>
          <div className="my-3 h-20">
            <PromoArt />
          </div>
          <p className="text-xs leading-relaxed text-white/85">
            Event edits and private poster uploads use the API. Dashboard metrics and attendee
            tables still show sample records.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-2xl bg-bark-800 p-3">
        <Avatar name={CURRENT_ORGANIZER.name} tone={CURRENT_ORGANIZER.avatarTone} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{CURRENT_ORGANIZER.name}</p>
          <p className="truncate text-xs text-white/50">{CURRENT_ORGANIZER.year}</p>
        </div>
        <button
          type="button"
          aria-label="Sign out"
          title="Sign out of EventFlow"
          className="grid size-9 place-items-center rounded-full bg-white/10 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/login");
          }}
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </div>
  );
}

/** Reference A's dark navigation rail with the amber highlight bar. */
export function DashboardSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 bg-bark-900 p-5 shadow-rail lg:block">
        <RailContent />
      </aside>

      <button
        type="button"
        aria-label="Open organizer navigation"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 left-5 z-40 grid size-12 place-items-center rounded-full bg-bark-900 text-white shadow-rail lg:hidden"
      >
        <Menu className="size-5" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close organizer navigation"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 left-0 w-[86%] max-w-sm bg-bark-900 p-5 shadow-rail">
            <RailContent onNavigate={() => setOpen(false)} />
          </div>
        </div>
      ) : null}
    </>
  );
}
