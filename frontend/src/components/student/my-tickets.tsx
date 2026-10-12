"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  CalendarX2,
  Check,
  Clock,
  MapPin,
  QrCode,
  Ticket,
  X,
} from "lucide-react";
import { EventPoster } from "@/components/events/event-poster";
import { RegistrationStatusBadge } from "@/components/events/status-badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Notice } from "@/components/ui/notice";
import { PillTabs } from "@/components/ui/segmented";
import { MetricCard } from "@/components/ui/metric-card";
import { isPast } from "@/lib/format";
import {
  DEMO_TODAY,
  formatFullDate,
  formatShortDate,
  formatTimeRange,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CampusEvent, Registration } from "@/types";

type Filter = "upcoming" | "past" | "all";

/** Deterministic 5x5 code grid standing in for a scannable ticket QR code. */
function TicketCodeGrid({ code }: { code: string }) {
  const cells = useMemo(() => {
    const values: boolean[] = [];
    for (let index = 0; index < 25; index += 1) {
      const char = code.charCodeAt(index % code.length);
      values.push((char + index * 7) % 3 !== 0);
    }
    return values;
  }, [code]);

  return (
    <div
      aria-hidden="true"
      className="grid grid-cols-5 gap-1 rounded-2xl border border-cream-300 bg-white p-2"
    >
      {cells.map((filled, index) => (
        <span
          key={index}
          className={cn(
            "aspect-square rounded-[3px]",
            filled ? "bg-bark-800" : "bg-cream-200",
          )}
        />
      ))}
    </div>
  );
}

export function MyTickets({
  registrations,
  events,
}: {
  registrations: Registration[];
  events: CampusEvent[];
}) {
  const [filter, setFilter] = useState<Filter>("upcoming");
  const [cancelled, setCancelled] = useState<string[]>([]);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const rows = registrations
    .map((registration) => ({
      registration,
      event: events.find((event) => event.id === registration.eventId),
    }))
    .filter((row): row is { registration: Registration; event: CampusEvent } =>
      Boolean(row.event),
    )
    .map((row) =>
      cancelled.includes(row.registration.id)
        ? { ...row, registration: { ...row.registration, status: "cancelled" as const } }
        : row,
    )
    .sort((a, b) => a.event.startsAt.localeCompare(b.event.startsAt));

  const filtered = rows.filter((row) => {
    if (filter === "all") return true;
    const past = isPast(row.event.endsAt, DEMO_TODAY);
    return filter === "past" ? past : !past;
  });

  const upcomingCount = rows.filter(
    (row) => !isPast(row.event.endsAt, DEMO_TODAY) && row.registration.status !== "cancelled",
  ).length;
  const waitlisted = rows.filter((row) => row.registration.status === "waitlisted").length;
  const attended = rows.filter((row) => row.registration.status === "attended").length;

  function cancel(registrationId: string) {
    setPendingId(registrationId);
    window.setTimeout(() => {
      setCancelled((current) => [...current, registrationId]);
      setPendingId(null);
    }, 650);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Tickets held"
          value={rows.filter((row) => row.registration.status !== "cancelled").length}
          hint="Across all campus events"
          icon={<Ticket className="size-5" />}
          tone="brand"
        />
        <MetricCard
          label="Upcoming"
          value={upcomingCount}
          hint="Still to attend"
          icon={<CalendarDays className="size-5" />}
          tone="leaf"
        />
        <MetricCard
          label="Waitlisted"
          value={waitlisted}
          hint="Seats open if someone cancels"
          icon={<Clock className="size-5" />}
          tone="plum"
        />
        <MetricCard
          label="Attended"
          value={attended}
          hint="Checked in at the door"
          icon={<Check className="size-5" />}
          tone="sky"
        />
      </div>

      <Notice tone="warning" className="text-xs">
        <span className="font-semibold">Preview data.</span> These tickets come from sample
        registrations. Cancelling updates this page in your browser only — the real wallet will
        read from <span className="font-mono">GET /api/me/registrations</span> on the
        RDS-backed API.
      </Notice>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <PillTabs
          label="Ticket filter"
          options={[
            { value: "upcoming" as Filter, label: "Upcoming" },
            { value: "past" as Filter, label: "Past" },
            { value: "all" as Filter, label: "All tickets" },
          ]}
          value={filter}
          onChange={setFilter}
        />
        <ButtonLink href="/events" variant="secondary" size="sm">
          Find more events
        </ButtonLink>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<CalendarX2 aria-hidden="true" className="size-6" />}
          title={
            filter === "past" ? "No past tickets yet" : "No tickets in this view"
          }
          description={
            filter === "past"
              ? "Once you attend an event, it moves here with its check-in record."
              : "Register for an upcoming event and your ticket will appear here instantly."
          }
          action={<ButtonLink href="/events">Browse upcoming events</ButtonLink>}
        />
      ) : (
        <ul className="space-y-4">
          {filtered.map(({ registration, event }) => {
            const isCancelled = registration.status === "cancelled";
            const past = isPast(event.endsAt, DEMO_TODAY);

            return (
              <li key={registration.id}>
                <Card
                  className={cn(
                    "overflow-hidden",
                    isCancelled && "opacity-75",
                  )}
                >
                  <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-stretch">
                    <EventPoster
                      event={event}
                      showWordmark={false}
                      className="h-36 w-full shrink-0 lg:h-auto lg:w-40"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <RegistrationStatusBadge status={registration.status} />
                        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-600">
                          {formatShortDate(event.startsAt)}
                        </span>
                        {past ? (
                          <span className="text-xs text-ink-400">Completed event</span>
                        ) : null}
                      </div>

                      <h2 className="mt-2 text-lg font-semibold text-ink-900">
                        <Link
                          href={`/events/${event.id}`}
                          className="transition-colors hover:text-brand-700"
                        >
                          {event.title}
                        </Link>
                      </h2>

                      <ul className="mt-3 grid gap-2 text-sm text-ink-700 sm:grid-cols-2">
                        <li className="inline-flex items-center gap-2">
                          <CalendarDays aria-hidden="true" className="size-4 text-brand-600" />
                          {formatFullDate(event.startsAt)}
                        </li>
                        <li className="inline-flex items-center gap-2">
                          <Clock aria-hidden="true" className="size-4 text-brand-600" />
                          {formatTimeRange(event.startsAt, event.endsAt)}
                        </li>
                        <li className="inline-flex items-center gap-2 sm:col-span-2">
                          <MapPin aria-hidden="true" className="size-4 text-brand-600" />
                          {event.venue} · {event.building}
                        </li>
                      </ul>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <ButtonLink
                          href={`/events/${event.id}`}
                          size="sm"
                          variant="secondary"
                          icon={<ArrowUpRight className="size-3.5" />}
                        >
                          Event details
                        </ButtonLink>
                        {!isCancelled ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-berry-500 hover:bg-berry-500/10"
                            loading={pendingId === registration.id}
                            icon={<X className="size-3.5" />}
                            onClick={() => cancel(registration.id)}
                          >
                            Cancel
                          </Button>
                        ) : (
                          <span className="text-xs text-ink-400">
                            Cancelled in this browser session
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 rounded-2xl border border-dashed border-cream-400 bg-cream-50 p-4 lg:w-52 lg:flex-col lg:items-center lg:justify-center">
                      <TicketCodeGrid code={registration.ticketCode} />
                      <div className="text-center">
                        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-ink-400">
                          Ticket code
                        </p>
                        <p className="font-mono text-sm font-semibold text-ink-900">
                          {registration.ticketCode}
                        </p>
                        <p className="mt-1 inline-flex items-center gap-1 text-[0.68rem] text-ink-500">
                          <QrCode aria-hidden="true" className="size-3" />
                          Scanned at the door
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      <Card>
        <CardHeader
          title="Ticket help"
          description="Common questions about campus tickets"
          icon={<Ticket className="size-4" />}
        />
        <dl className="grid gap-4 px-5 py-5 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-semibold text-ink-900">Can I transfer a ticket?</dt>
            <dd className="mt-1 text-sm text-ink-500">
              Transfers, refunds and waitlist promotions are part of the payments milestone and
              are not available in this preview.
            </dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-ink-900">What if an event is full?</dt>
            <dd className="mt-1 text-sm text-ink-500">
              Join the waitlist from the event page. You keep your place in line and organizers
              can promote you when a seat frees up.
            </dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
