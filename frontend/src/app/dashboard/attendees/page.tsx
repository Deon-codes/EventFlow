import type { Metadata } from "next";
import { Users } from "lucide-react";
import { AttendeeView } from "@/components/dashboard/attendee-view";
import { Badge } from "@/components/ui/badge";
import { organizerEvents, organizerSummary } from "@/lib/events";
import { MOCK_REGISTRATIONS } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Attendees",
  description: "Registration lists, capacity and check-ins for every organizer event.",
};

type SearchParams = Record<string, string | string[] | undefined>;

export default async function AttendeesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const rawEvent = Array.isArray(params.event) ? params.event[0] : params.event;
  const events = organizerEvents();
  const summary = organizerSummary(events);

  return (
    <div className="space-y-5">
      <header>
        <Badge tone="brand" icon={<Users className="size-3.5" />}>
          {summary.totalRegistrations} registrations · {summary.waitlisted} waitlisted
        </Badge>
        <h1 className="mt-3 text-2xl font-bold text-ink-900 sm:text-3xl">
          Attendee management
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-500">
          Pick an event to review its registration list, confirm capacity, promote waitlisted
          students and record check-ins at the door.
        </p>
      </header>

      <AttendeeView
        events={events}
        registrations={MOCK_REGISTRATIONS}
        initialEventId={rawEvent}
      />
    </div>
  );
}
