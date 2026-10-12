import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CalendarPlus,
  Check,
  Clock,
  Globe,
  MapPin,
  Share2,
  Ticket,
  Users,
} from "lucide-react";
import { EventPoster } from "@/components/events/event-poster";
import { RegisterButton } from "@/components/events/register-button";
import { EventCard } from "@/components/events/event-card";
import { CategoryBadge, EventStatusBadge } from "@/components/events/status-badge";
import { StudentRail } from "@/components/layout/student-rail";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, SectionHeading } from "@/components/ui/card";
import { CapacityMeter } from "@/components/ui/progress";
import { Notice } from "@/components/ui/notice";
import {
  allEvents,
  fillRate,
  getEventById,
  isSoldOut,
  registrationFor,
  registrationsForEvent,
  relatedEvents,
  spotsLeft,
} from "@/lib/events";
import { CURRENT_ORGANIZER, CURRENT_STUDENT } from "@/lib/mock-data";
import {
  formatFullDate,
  formatShortDate,
  formatTimeRange,
  formatPrice,
  relativeDayLabel,
} from "@/lib/format";

export function generateStaticParams() {
  return allEvents().map((event) => ({ id: event.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const event = getEventById(id);
  if (!event) return { title: "Event not found" };
  return {
    title: event.title,
    description: event.summary,
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = getEventById(id);
  if (!event) notFound();

  const myRegistration = registrationFor(event.id, CURRENT_STUDENT.id);
  const related = relatedEvents(event);
  const attendees = registrationsForEvent(event.id);
  const soldOut = isSoldOut(event);
  const confirmed = attendees.filter((entry) => entry.status === "confirmed").length;

  return (
    <div className="space-y-6">
      <Link
        href="/events"
        className="inline-flex items-center gap-2 text-sm font-semibold text-ink-500 transition-colors hover:text-ink-900"
      >
        <ArrowLeft className="size-4" />
        Back to all events
      </Link>

      <div className="flex flex-col gap-6 xl:flex-row">
        <div className="min-w-0 flex-1 space-y-6">
          <Card className="overflow-hidden">
            <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
              <EventPoster
                event={event}
                rounded="rounded-none"
                className="h-64 w-full lg:h-full lg:min-h-[22rem]"
              />
              <div className="p-6 sm:p-7">
                <div className="flex flex-wrap items-center gap-2">
                  <CategoryBadge category={event.category} />
                  <EventStatusBadge status={event.status} />
                  {myRegistration ? (
                    <Badge tone="leaf" icon={<Ticket className="size-3.5" />}>
                      You have a ticket
                    </Badge>
                  ) : null}
                </div>

                <h1 className="mt-4 text-2xl font-bold leading-tight text-ink-900 sm:text-3xl">
                  {event.title}
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{event.summary}</p>

                <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                      <CalendarDays aria-hidden="true" className="size-4" />
                    </span>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-400">
                        Date
                      </dt>
                      <dd className="text-sm font-medium text-ink-900">
                        {formatFullDate(event.startsAt)}
                      </dd>
                      <dd className="text-xs text-ink-500">
                        {relativeDayLabel(event.startsAt)}
                        {event.endsAt.slice(0, 10) !== event.startsAt.slice(0, 10)
                          ? " · runs overnight"
                          : ""}
                      </dd>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                      <Clock aria-hidden="true" className="size-4" />
                    </span>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-400">
                        Time
                      </dt>
                      <dd className="text-sm font-medium text-ink-900">
                        {formatTimeRange(event.startsAt, event.endsAt)}
                      </dd>
                      <dd className="text-xs text-ink-500">
                        Ends {formatShortDate(event.endsAt)}
                      </dd>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                      <MapPin aria-hidden="true" className="size-4" />
                    </span>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-400">
                        Venue
                      </dt>
                      <dd className="text-sm font-medium text-ink-900">{event.venue}</dd>
                      <dd className="text-xs text-ink-500">
                        {event.building}
                        {event.isOnline ? " · online stream available" : ""}
                      </dd>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                      <Users aria-hidden="true" className="size-4" />
                    </span>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-400">
                        Organizer
                      </dt>
                      <dd className="flex items-center gap-2 text-sm font-medium text-ink-900">
                        <Avatar
                          name={CURRENT_ORGANIZER.name}
                          tone={CURRENT_ORGANIZER.avatarTone}
                          size="sm"
                        />
                        {CURRENT_ORGANIZER.name}
                      </dd>
                      <dd className="text-xs text-ink-500">{CURRENT_ORGANIZER.programme}</dd>
                    </div>
                  </div>
                </dl>

                <ul className="mt-6 flex flex-wrap gap-2">
                  {event.tags.map((tag) => (
                    <li key={tag}>
                      <Badge tone="outline">{tag}</Badge>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-ink-900">About this event</h2>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink-700">
                {event.description.map((paragraph) => (
                  <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                ))}
              </div>

              <h3 className="mt-6 text-sm font-semibold uppercase tracking-[0.12em] text-ink-400">
                What to expect
              </h3>
              <ul className="mt-3 space-y-2.5">
                {event.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-2.5 text-sm text-ink-700">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-leaf-100 text-leaf-500">
                      <Check className="size-3" />
                    </span>
                    {highlight}
                  </li>
                ))}
              </ul>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader
                  title="Registration"
                  description={
                    event.status === "completed"
                      ? "This event has finished"
                      : `Closes ${formatShortDate(event.registrationClosesAt)}`
                  }
                  icon={<Ticket className="size-4" />}
                />
                <div className="space-y-4 px-5 py-5">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-ink-400">
                        {event.priceUsd > 0 ? "Ticket price" : "Entry"}
                      </p>
                      <p
                        className={
                          event.priceUsd > 0
                            ? "text-2xl font-semibold text-berry-500"
                            : "text-2xl font-semibold text-leaf-500"
                        }
                      >
                        {formatPrice(event.priceUsd)}
                      </p>
                    </div>
                    <Badge tone={soldOut ? "berry" : "leaf"} dot>
                      {soldOut ? "Waitlist only" : `${spotsLeft(event)} seats left`}
                    </Badge>
                  </div>

                  <CapacityMeter
                    registered={event.registered}
                    capacity={event.capacity}
                    waitlisted={event.waitlisted}
                  />

                  <RegisterButton event={event} initialRegistration={myRegistration ?? null} />

                  <div className="flex flex-wrap gap-2">
                    <span
                      className="inline-flex h-10 flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-full border border-cream-300 text-xs font-semibold text-ink-400"
                      title="Calendar sync arrives with the backend milestone"
                    >
                      <CalendarPlus className="size-4" />
                      Add to calendar
                    </span>
                    <span
                      className="inline-flex h-10 flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-full border border-cream-300 text-xs font-semibold text-ink-400"
                      title="Share links arrive with the backend milestone"
                    >
                      <Share2 className="size-4" />
                      Share
                    </span>
                  </div>
                </div>
              </Card>

              <Card>
                <CardHeader
                  title="Who's going"
                  description={`${confirmed} confirmed · ${fillRate(event)}% full`}
                  icon={<Users className="size-4" />}
                />
                <ul className="space-y-3 px-5 py-5">
                  {attendees.slice(0, 4).map((attendee) => (
                    <li key={attendee.id} className="flex items-center gap-3">
                      <Avatar name={attendee.studentName} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink-900">
                          {attendee.studentName}
                        </p>
                        <p className="truncate text-xs text-ink-500">{attendee.programme}</p>
                      </div>
                    </li>
                  ))}
                  {attendees.length === 0 ? (
                    <li className="text-sm text-ink-500">
                      No registrations yet — be the first to reserve a seat.
                    </li>
                  ) : null}
                  {attendees.length > 4 ? (
                    <li className="text-xs text-ink-400">
                      +{attendees.length - 4} more students registered
                    </li>
                  ) : null}
                </ul>
              </Card>

              <Notice tone="info" className="text-xs">
                <span className="font-semibold">Map placeholder.</span> An interactive venue map
                will render here once campus location data is available from the backend.
                {event.isOnline ? (
                  <span className="mt-1 flex items-center gap-1.5 text-ink-500">
                    <Globe aria-hidden="true" className="size-3.5" />
                    Online attendees receive a stream link by email.
                  </span>
                ) : null}
              </Notice>
            </div>
          </div>

          <section className="space-y-4">
            <SectionHeading
              eyebrow="You might also like"
              title="Related events"
              description="Picked by category and shared tags."
            />
            <ul className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
              {related.map((candidate) => (
                <li key={candidate.id} className="h-full">
                  <EventCard event={candidate} />
                </li>
              ))}
            </ul>
          </section>
        </div>

        <StudentRail />
      </div>
    </div>
  );
}
