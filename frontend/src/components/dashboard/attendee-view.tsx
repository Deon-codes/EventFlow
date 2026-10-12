"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CircleCheckBig,
  Download,
  Hourglass,
  Mail,
  SearchX,
  Ticket,
  UserPlus,
  Users,
} from "lucide-react";
import { RegistrationStatusBadge } from "@/components/events/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/field";
import { MetricCard } from "@/components/ui/metric-card";
import { Notice } from "@/components/ui/notice";
import { CapacityMeter, ProgressBar } from "@/components/ui/progress";
import { REGISTRATION_STATUS_FILTERS, fillRate, spotsLeft } from "@/lib/events";
import { formatDateTimeStamp, formatTableStamp, percent } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CampusEvent, Registration, RegistrationStatus } from "@/types";

type StatusFilter = "all" | RegistrationStatus;

export function AttendeeView({
  events,
  registrations,
  initialEventId,
}: {
  events: CampusEvent[];
  registrations: Registration[];
  initialEventId?: string;
}) {
  const [eventId, setEventId] = useState(
    initialEventId && events.some((event) => event.id === initialEventId)
      ? initialEventId
      : (events[0]?.id ?? ""),
  );
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [checkedIn, setCheckedIn] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const event = events.find((candidate) => candidate.id === eventId) ?? events[0];

  const rows = useMemo(() => {
    if (!event) return [];
    return registrations
      .filter((registration) => registration.eventId === event.id)
      .map((registration) =>
        checkedIn.includes(registration.id)
          ? { ...registration, status: "attended" as RegistrationStatus }
          : registration,
      );
  }, [checkedIn, event, registrations]);

  const filtered = rows.filter((registration) => {
    if (status !== "all" && registration.status !== status) return false;
    if (!query.trim()) return true;
    const needle = query.trim().toLowerCase();
    return [registration.studentName, registration.studentEmail, registration.ticketCode, registration.programme]
      .join(" ")
      .toLowerCase()
      .includes(needle);
  });

  if (!event) {
    return (
      <EmptyState
        icon={<Users aria-hidden="true" className="size-6" />}
        title="No events in this workspace yet"
        description="Create an event first — attendee registrations will appear here once students start signing up."
        action={<ButtonLink href="/dashboard/events/new">Create event</ButtonLink>}
      />
    );
  }

  const attended = rows.filter((registration) => registration.status === "attended").length;
  const waitlisted = rows.filter((registration) => registration.status === "waitlisted").length;
  const pending = rows.filter((registration) => registration.status === "pending").length;

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader
          title="Event"
          description="Switch between the events you manage to review their registrations"
          icon={<Ticket className="size-4" />}
          action={
            <Badge tone="outline">
              {events.length} events in this workspace
            </Badge>
          }
        />
        <div className="grid gap-4 px-5 py-5 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <label
              htmlFor="attendee-event"
              className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-500"
            >
              Selected event
            </label>
            <Select
              id="attendee-event"
              value={event.id}
              onChange={(changed) => {
                setEventId(changed.target.value);
                setMessage(null);
              }}
              className="mt-1.5"
            >
              {events.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.title} · {formatTableStamp(option.startsAt)}
                </option>
              ))}
            </Select>
            <p className="mt-2 text-xs text-ink-500">
              {event.venue} · {formatDateTimeStamp(event.startsAt)}
            </p>
          </div>
          <div className="space-y-3">
            <CapacityMeter
              registered={event.registered}
              capacity={event.capacity}
              waitlisted={event.waitlisted}
            />
            <div className="flex flex-wrap gap-2">
              <ButtonLink
                href={`/events/${event.id}`}
                variant="secondary"
                size="sm"
              >
                View public page
              </ButtonLink>
              <ButtonLink
                href={`/dashboard/events/${event.id}/edit`}
                variant="ghost"
                size="sm"
              >
                Edit event
              </ButtonLink>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Registered"
          value={rows.length}
          hint={`${fillRate(event)}% of ${event.capacity} seats`}
          icon={<UserPlus className="size-5" />}
          tone="brand"
        />
        <MetricCard
          label="Checked in"
          value={attended}
          hint={`${percent(attended, rows.length || 1)}% of registered`}
          icon={<CircleCheckBig className="size-5" />}
          tone="leaf"
        />
        <MetricCard
          label="Waitlisted"
          value={waitlisted}
          hint="Promote when seats free up"
          icon={<Hourglass className="size-5" />}
          tone="plum"
        />
        <MetricCard
          label="Pending confirmation"
          value={pending}
          hint={`${spotsLeft(event)} seats still open`}
          icon={<Ticket className="size-5" />}
          tone="sky"
        />
      </div>

      <Card>
        <CardHeader
          title="Registrations"
          description={`${filtered.length} of ${rows.length} records shown`}
          icon={<Users className="size-4" />}
          action={
            <span
              className="cursor-not-allowed rounded-full border border-cream-300 px-3.5 py-1.5 text-xs font-semibold text-ink-400"
              title="CSV export arrives with the backend milestone"
            >
              Export CSV (soon)
            </span>
          }
        />
        <div className="flex flex-col gap-3 border-b border-cream-200 px-5 py-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <label htmlFor="attendee-search" className="sr-only">
              Search attendees
            </label>
            <Mail
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-400"
            />
            <input
              id="attendee-search"
              type="search"
              value={query}
              onChange={(changed) => setQuery(changed.target.value)}
              placeholder="Search by name, email, programme or ticket code"
              className="h-11 w-full rounded-full border border-cream-300 bg-white pl-11 pr-4 text-sm placeholder:text-ink-400 focus:border-brand-400 focus:outline-none"
            />
          </div>
          <div className="lg:w-52">
            <label htmlFor="attendee-status" className="sr-only">
              Filter by registration status
            </label>
            <Select
              id="attendee-status"
              value={status}
              onChange={(changed) => setStatus(changed.target.value as StatusFilter)}
              className="h-11 py-0"
            >
              {REGISTRATION_STATUS_FILTERS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {message ? (
          <div className="border-b border-cream-200">
            <Notice
              tone="info"
              className="rounded-none border-0"
              action={
                <Button size="sm" variant="ghost" onClick={() => setMessage(null)}>
                  Dismiss
                </Button>
              }
            >
              {message}
            </Notice>
          </div>
        ) : null}

        {rows.length === 0 ? (
          <EmptyState
            className="border-0 bg-transparent"
            icon={<UserPlus aria-hidden="true" className="size-6" />}
            title="No registrations yet"
            description="Nobody has registered for this event. Publish it to the campus feed or share the public event page with your club."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <ButtonLink href={`/events/${event.id}`} size="sm">
                  Open public page
                </ButtonLink>
                <ButtonLink href="/dashboard/events" size="sm" variant="secondary">
                  Manage events
                </ButtonLink>
              </div>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            className="border-0 bg-transparent"
            icon={<SearchX aria-hidden="true" className="size-6" />}
            title="No attendees match this search"
            description="Try another name, ticket code or clear the status filter."
            action={
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setQuery("");
                  setStatus("all");
                }}
              >
                Clear filters
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto scrollbar-warm">
            <table className="w-full min-w-[46rem] border-collapse text-left">
              <caption className="sr-only">
                Registrations for {event.title}
              </caption>
              <thead>
                <tr className="text-[0.66rem] uppercase tracking-[0.14em] text-ink-400">
                  <th scope="col" className="px-5 py-3 font-semibold">
                    Student
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Programme
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Ticket
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Status
                  </th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">
                    Check-in
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {filtered.map((registration) => {
                  const isCheckedIn =
                    registration.status === "attended" ||
                    checkedIn.includes(registration.id);
                  return (
                    <tr key={registration.id} className="transition-colors hover:bg-cream-50">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar name={registration.studentName} size="sm" />
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-ink-900">
                              {registration.studentName}
                            </p>
                            <p className="truncate text-xs text-ink-500">
                              {registration.studentEmail}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-sm text-ink-700">{registration.programme}</p>
                        <p className="text-xs text-ink-400">{registration.year}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-mono text-xs font-semibold text-ink-900">
                          {registration.ticketCode}
                        </p>
                        <p className="text-xs text-ink-400">
                          {formatTableStamp(registration.registeredAt)}
                        </p>
                      </td>
                      <td className="px-4 py-3.5">
                        <RegistrationStatusBadge status={registration.status} />
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {isCheckedIn ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-leaf-100 px-3 py-1.5 text-xs font-semibold text-leaf-500">
                            <CircleCheckBig className="size-3.5" />
                            Checked in
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setCheckedIn((current) => [...current, registration.id]);
                              setMessage(
                                `${registration.studentName} marked as checked in for this browser session. Attendance will be written to Amazon RDS through POST /api/events/${event.id}/check-ins.`,
                              );
                            }}
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full border border-cream-300 px-3 py-1.5 text-xs font-semibold text-ink-700 transition-colors",
                              "hover:border-leaf-500 hover:bg-leaf-100 hover:text-leaf-500",
                            )}
                          >
                            <CircleCheckBig className="size-3.5" />
                            Check in
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {rows.length > 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-cream-200 px-5 py-4">
            <div className="flex items-center gap-3 text-xs text-ink-500">
              <span className="font-semibold text-ink-700">
                {attended}/{rows.length} checked in
              </span>
              <ProgressBar value={percent(attended, rows.length)} className="h-1.5 w-32" />
            </div>
            <Link
              href={`/dashboard/events/${event.id}/edit`}
              className="text-xs font-semibold text-brand-700 hover:text-brand-600"
            >
              Edit event details
            </Link>
          </div>
        ) : null}
      </Card>

      <Notice tone="warning" className="text-xs" action={<Download className="size-4 text-brand-700" />}>
        <span className="font-semibold">Preview only.</span> Registrations, statuses and
        check-ins on this screen come from bundled sample data. Real attendee records, CSV
        export and payment verification arrive with the AWS milestone.
      </Notice>
    </div>
  );
}
