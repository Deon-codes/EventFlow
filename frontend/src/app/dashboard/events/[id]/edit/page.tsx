import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil, Users } from "lucide-react";
import { EventForm } from "@/components/dashboard/event-form";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { BackendNotice } from "@/components/ui/notice";
import { fillRate, getEventById, registrationsForEvent } from "@/lib/events";
import { formatDateRange } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const event = getEventById(id);
  return {
    title: event ? `Edit · ${event.title}` : "Edit event",
  };
}

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = getEventById(id);
  if (!event) notFound();

  const registrations = registrationsForEvent(event.id);

  return (
    <div className="space-y-5">
      <Link
        href="/dashboard/events"
        className="inline-flex items-center gap-2 text-sm font-semibold text-ink-500 transition-colors hover:text-ink-900"
      >
        <ArrowLeft className="size-4" />
        Back to manage events
      </Link>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="brand" icon={<Pencil className="size-3.5" />}>
              Editing
            </Badge>
            <Badge tone="outline">
              {event.registered}/{event.capacity} seats · {fillRate(event)}% full
            </Badge>
          </div>
          <h1 className="mt-3 text-2xl font-bold text-ink-900 sm:text-3xl">{event.title}</h1>
          <p className="mt-1 text-sm text-ink-500">{formatDateRange(event.startsAt, event.endsAt)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ButtonLink
            href={`/dashboard/attendees?event=${event.id}`}
            variant="secondary"
            icon={<Users className="size-4" />}
          >
            {registrations.length} registrations
          </ButtonLink>
          <ButtonLink href={`/events/${event.id}`} variant="ghost">
            View public page
          </ButtonLink>
        </div>
      </header>

      <BackendNotice endpoint={`PATCH /api/events/${event.id}`}>
        Changes made here update the form state and the live preview only. Saving will patch the
        record in Amazon RDS once the events API is connected.
      </BackendNotice>

      <EventForm mode="edit" event={event} />
    </div>
  );
}
