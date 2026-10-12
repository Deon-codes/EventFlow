import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { EventRailItem } from "@/components/events/event-list-item";
import { OfferArt } from "@/components/illustrations/illustrations";
import { FollowButton } from "@/components/layout/follow-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { RegistrationStatusBadge } from "@/components/events/status-badge";
import { Notice } from "@/components/ui/notice";
import { getEventById, registrationsForStudent, upcomingEvents } from "@/lib/events";
import { CURRENT_STUDENT, ORGANIZER_PROFILES } from "@/lib/mock-data";
import { formatShortDate } from "@/lib/format";

/** Reference B's right column, adapted to campus events. */
export function StudentRail() {
  const popular = [...upcomingEvents()]
    .sort((a, b) => b.registered - a.registered)
    .slice(0, 4);

  const myRegistrations = registrationsForStudent(CURRENT_STUDENT.id);
  const nextTicket = myRegistrations[0];
  const nextTicketEvent = nextTicket ? getEventById(nextTicket.eventId) : undefined;

  return (
    <aside className="hidden w-80 shrink-0 space-y-5 xl:block">
      {nextTicket ? (
        <Card className="overflow-hidden">
          <CardHeader
            title="Your next ticket"
            description={
              nextTicketEvent
                ? `${formatShortDate(nextTicketEvent.startsAt)} · ${nextTicketEvent.venue}`
                : "Sample registration"
            }
            action={
              <Badge tone="brand" icon={<Sparkles className="size-3.5" />}>
                Ticket
              </Badge>
            }
          />
          <div className="space-y-3 px-5 py-4">
            <div className="rounded-2xl border border-dashed border-cream-400 bg-cream-50 px-4 py-3">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-ink-400">
                Ticket code
              </p>
              <p className="mt-1 font-mono text-sm font-semibold text-ink-900">
                {nextTicket.ticketCode}
              </p>
              <div className="mt-2">
                <RegistrationStatusBadge status={nextTicket.status} />
              </div>
            </div>
            <Link
              href="/registrations"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-600"
            >
              View all tickets
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </Card>
      ) : null}

      <Card>
        <CardHeader
          title="Popular this month"
          description="Ranked by registrations"
          action={
            <Link
              href="/events?sort=popular"
              className="text-xs font-semibold text-brand-700 hover:text-brand-600"
            >
              See all
            </Link>
          }
        />
        <ol className="space-y-4 px-5 py-5">
          {popular.map((event, index) => (
            <EventRailItem
              key={event.id}
              event={event}
              index={index + 1}
              registered={myRegistrations.some((entry) => entry.eventId === event.id)}
            />
          ))}
        </ol>
      </Card>

      <Card>
        <CardHeader
          title="Organizers to follow"
          description="Campus clubs and labs"
          action={
            <Link
              href="/events"
              className="text-xs font-semibold text-brand-700 hover:text-brand-600"
            >
              See all
            </Link>
          }
        />
        <ul className="space-y-4 px-5 py-5">
          {ORGANIZER_PROFILES.map((organizer) => (
            <li key={organizer.id} className="flex items-center gap-3">
              <Avatar name={organizer.name} tone={organizer.tone} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink-900">
                  {organizer.name}
                </p>
                <p className="truncate text-xs text-ink-500">
                  {organizer.focus} · {organizer.eventsHosted} events
                </p>
              </div>
              <FollowButton name={organizer.name} />
            </li>
          ))}
        </ul>
      </Card>

      <div className="overflow-hidden rounded-card bg-brand-500 px-5 py-5 text-white shadow-soft">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/70">
              Student clubs
            </p>
            <h2 className="mt-1 text-lg font-semibold leading-snug">
              Create your own campus event
            </h2>
          </div>
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white/15">
            <Sparkles className="size-5" />
          </span>
        </div>
        <div className="my-4 h-24">
          <OfferArt />
        </div>
        <p className="text-sm text-white/85">
          Organizer tools are open to every registered student club — draft an event, then
          publish it to the campus feed.
        </p>
        <Link
          href="/dashboard/events/new"
          className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-white text-sm font-semibold text-brand-700 transition-colors hover:bg-cream-100"
        >
          Start a draft
          <ArrowUpRight className="size-4" />
        </Link>
      </div>

      <Notice tone="info" className="text-xs">
        <span className="font-semibold">Milestone note.</span> Every list on this page is sample
        data rendered on the server. Search, filters and follow toggles work in the browser;
        persistence arrives with Amazon RDS and Amazon S3.
      </Notice>
    </aside>
  );
}
