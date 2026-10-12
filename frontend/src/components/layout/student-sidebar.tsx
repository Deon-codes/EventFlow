"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarPlus,
  Compass,
  LayoutGrid,
  Ticket,
  User,
  Users,
} from "lucide-react";
import { BrandLogo } from "@/components/layout/brand-logo";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { CURRENT_STUDENT } from "@/lib/mock-data";

export const STUDENT_NAV = [
  { href: "/", label: "Discover", icon: Compass },
  { href: "/events", label: "All events", icon: LayoutGrid },
  { href: "/registrations", label: "My tickets", icon: Ticket },
  { href: "/profile", label: "Profile", icon: User },
] as const;

export function StudentNavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Student navigation" className="space-y-1">
      {STUDENT_NAV.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors",
              active
                ? "bg-white text-ink-900 shadow-soft"
                : "text-ink-500 hover:bg-white/70 hover:text-ink-900",
            )}
          >
            <span
              className={cn(
                "grid size-8 place-items-center rounded-xl",
                active ? "bg-brand-100 text-brand-700" : "text-ink-400",
              )}
            >
              <Icon className="size-4" />
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Reference B's left rail: wordmark, nav pills, amber CTA and account card. */
export function StudentSidebar() {
  return (
    <aside className="sticky top-6 hidden w-64 shrink-0 self-start lg:block">
      <div className="flex h-[calc(100dvh-3rem)] flex-col overflow-y-auto rounded-panel border border-cream-200 bg-cream-50 p-5 shadow-soft scrollbar-warm">
        <BrandLogo subtitle="Campus ticketing" />

        <div className="mt-8 flex-1 space-y-6">
          <StudentNavLinks />

          <div className="space-y-1 border-t border-cream-300 pt-5">
            <p className="px-4 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-ink-400">
              Organizer
            </p>
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-ink-500 transition-colors hover:bg-white/70 hover:text-ink-900"
            >
              <span className="grid size-8 place-items-center rounded-xl text-ink-400">
                <Users className="size-4" />
              </span>
              Dashboard
            </Link>
          </div>

          <Link
            href="/dashboard/events/new"
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-brand-500 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-brand-600"
          >
            <CalendarPlus className="size-4" />
            Create event
          </Link>
        </div>

        <Link
          href="/profile"
          className="mt-6 flex items-center gap-3 rounded-2xl border border-cream-200 bg-white p-3 transition-colors hover:border-brand-300"
        >
          <Avatar name={CURRENT_STUDENT.name} tone={CURRENT_STUDENT.avatarTone} />
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-ink-900">
              {CURRENT_STUDENT.name}
            </span>
            <span className="block truncate text-xs text-ink-500">
              {CURRENT_STUDENT.email}
            </span>
          </span>
        </Link>
      </div>
    </aside>
  );
}
