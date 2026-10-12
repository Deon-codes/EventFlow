import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarClock,
  CalendarPlus,
  ClipboardList,
  ListChecks,
  Plus,
  Ticket,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { CalendarCard } from "@/components/dashboard/calendar-card";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { EventsTable } from "@/components/dashboard/events-table";
import { RecentRegistrations } from "@/components/dashboard/recent-registrations";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { Notice } from "@/components/ui/notice";
import { organizerEvents, organizerSummary } from "@/lib/events";
import { MOCK_ACTIVITY, MOCK_REGISTRATIONS } from "@/lib/mock-data";
import { DEMO_TODAY, daysBetween, formatDateTimeStamp, relativeDayLabel } from "@/lib/format";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Organizer overview: events, registrations, capacity and attendance.",
};

const TONE_CLASSES: Record<string, string> = {
  brand: "bg-brand-100 text-brand-700",
  berry: "bg-berry-500/10 text-berry-500",
  mint: "bg-mint-100 text-mint-500",
  sky: "bg-sky-100 text-sky-500",
  plum: "bg-plum-100 text-plum-500",
  clay: "bg-clay-100 text-clay-500",
  leaf: "bg-leaf-100 text-leaf-500",
};

export default function DashboardPage() {
  const events = organizerEvents();
  const summary = organizerSummary(events);
  const upcoming = events
    .filter(
      (event) =>
        event.status === "published" && daysBetween(DEMO_TODAY, event.startsAt) >= 0,
    )
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const nextEvent = upcoming[0];

  const openTasks = [
    { label: `${upcoming.length} published events on the calendar`, done: true },
    { label: `${summary.draftEvents} drafts waiting to publish`, done: false },
    {
      label: `${summary.waitlisted} students on waitlists`,
      done: summary.waitlisted === 0,
    },
    { label: "Poster art for 2 draft events pending", done: false },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge tone="brand" icon={<Zap className="size-3.5" />}>
            Semester at a glance
          </Badge>
          <h1 className="mt-3 text-2xl font-bold text-ink-900 sm:text-3xl">Dashboard</h1>
          <p className="mt-1 max-w-2xl text-sm text-ink-500">
            Capacity, registrations and attendance for every event your office is running this
            semester.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ButtonLink
            href="/dashboard/attendees"
            variant="secondary"
            icon={<Users className="size-4" />}
          >
            Attendees
          </ButtonLink>
          <ButtonLink href="/dashboard/events/new" icon={<CalendarPlus className="size-4" />}>
            Create event
          </ButtonLink>
        </div>
      </header>

      <DashboardHero
        upcomingCount={summary.upcomingEvents}
        draftCount={summary.draftEvents}
        nextEventTitle={nextEvent?.title}
        nextEventWhen={nextEvent ? relativeDayLabel(nextEvent.startsAt) : undefined}
        openTasks={openTasks}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total events"
          value={summary.totalEvents}
          hint={`${summary.publishedEvents} published · ${summary.completedEvents} completed`}
          icon={<ListChecks className="size-5" />}
          tone="brand"
          trend={{ value: "+2 this month" }}
        />
        <MetricCard
          label="Upcoming events"
          value={summary.upcomingEvents}
          hint={nextEvent ? `Next: ${nextEvent.title}` : "Nothing scheduled"}
          icon={<CalendarClock className="size-5" />}
          tone="sky"
        />
        <MetricCard
          label="Registrations"
          value={summary.totalRegistrations}
          hint={`${summary.waitlisted} on waitlists`}
          icon={<Ticket className="size-5" />}
          tone="plum"
          trend={{ value: `${summary.averageFillRate}% fill`, positive: true }}
        />
        <MetricCard
          label="Attendance rate"
          value={`${summary.checkedInRate}%`}
          hint="Checked-in across completed events"
          icon={<TrendingUp className="size-5" />}
          tone="leaf"
          trend={{ value: "+6 pts", positive: true }}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Upcoming events"
              description="Published events ordered by start time"
              icon={<CalendarClock className="size-4" />}
              action={
                <Link
                  href="/dashboard/events"
                  className="rounded-full bg-brand-500 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-600"
                >
                  View all
                </Link>
              }
            />
            <EventsTable
              events={upcoming.slice(0, 5)}
              caption="Upcoming organizer events"
              actions={(event) => (
                <div className="flex items-center justify-end gap-1.5">
                  <Link
                    href={`/dashboard/events/${event.id}/edit`}
                    className="rounded-full border border-cream-300 px-3 py-1.5 text-xs font-semibold text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-700"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/dashboard/attendees?event=${event.id}`}
                    className="rounded-full bg-cream-200 px-3 py-1.5 text-xs font-semibold text-ink-700 transition-colors hover:bg-cream-300"
                  >
                    Attendees
                  </Link>
                </div>
              )}
            />
          </Card>

          <RecentRegistrations registrations={MOCK_REGISTRATIONS} limit={6} />
        </div>

        <div className="space-y-6">
          <CalendarCard events={events} />

          <Card>
            <CardHeader
              title="Quick actions"
              description="The three things organizers do most"
              icon={<Zap className="size-4" />}
            />
            <div className="grid gap-2 px-5 py-5">
              <ButtonLink
                href="/dashboard/events/new"
                variant="primary"
                className="w-full"
                icon={<Plus className="size-4" />}
              >
                Create a new event
              </ButtonLink>
              <ButtonLink
                href="/dashboard/events?status=draft"
                variant="secondary"
                className="w-full"
                icon={<ClipboardList className="size-4" />}
              >
                Finish {summary.draftEvents} draft events
              </ButtonLink>
              <ButtonLink
                href="/dashboard/attendees"
                variant="secondary"
                className="w-full"
                icon={<Users className="size-4" />}
              >
                Manage attendees
              </ButtonLink>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Recent activity"
              description="Sample feed — no audit log yet"
              icon={<TrendingUp className="size-4" />}
            />
            <ul className="space-y-4 px-5 py-5">
              {MOCK_ACTIVITY.map((item) => (
                <li key={item.id} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className={`mt-1.5 size-2.5 shrink-0 rounded-full ${
                      TONE_CLASSES[item.tone] ?? "bg-cream-300"
                    }`}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink-900">{item.label}</p>
                    <p className="text-xs text-ink-500">{item.detail}</p>
                    <p className="mt-0.5 text-[0.68rem] text-ink-400">
                      {formatDateTimeStamp(item.at)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Notice tone="warning" className="text-xs">
            <span className="font-semibold">Metrics are sample-based.</span> Every number here is
            computed from bundled mock events and registrations. The production dashboard will
            aggregate from Amazon RDS through{" "}
            <span className="font-mono">GET /api/organizer/summary</span>.
          </Notice>

          <Card className="p-5">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-ink-900">
              <ArrowUpRight className="size-4 text-brand-600" />
              Looking for the student view?
            </p>
            <p className="mt-1.5 text-sm text-ink-500">
              The discovery feed, event pages and ticket wallet are all linked from the student
              workspace.
            </p>
            <ButtonLink href="/" variant="secondary" size="sm" className="mt-3">
              Open student view
            </ButtonLink>
          </Card>
        </div>
      </div>
    </div>
  );
}
