import type { Metadata } from "next";
import { Users } from "lucide-react";
import { AttendeeView } from "@/components/dashboard/attendee-view";
import { Badge } from "@/components/ui/badge";
import { organizerEvents as mockOrganizerEvents, organizerSummary } from "@/lib/events";
import { MOCK_REGISTRATIONS } from "@/lib/mock-data";
import { BackendNotice, Notice } from "@/components/ui/notice";
import { currentUser } from "@/lib/session";
import { organizerWorkspaceForUi } from "@/lib/event-mapper";

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
  const user = await currentUser();
  const isOrganizer = !!user && (user.role === "ORGANIZER" || user.role === "ADMIN");
  const workspace = isOrganizer ? await organizerWorkspaceForUi(user.id) : null;
  const useLiveData = !!workspace && workspace.events.length > 0;
  const events = useLiveData ? workspace!.events : mockOrganizerEvents();
  const registrations = useLiveData ? workspace!.registrations : MOCK_REGISTRATIONS;
  const summary = organizerSummary(events, registrations);

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

      {useLiveData ? (
        <Notice tone="info" className="text-xs">
          <span className="font-semibold">Live attendee data.</span> Rows are read from your event
          registrations. Door check-in on this screen is a local preview — it is not written back
          to the database yet.
        </Notice>
      ) : (
        <BackendNotice endpoint="GET /api/events/[id]/registrations">
          This dashboard displays sample attendee rows. Sign in as an organizer to load live
          registrations from the database.
        </BackendNotice>
      )}

      <AttendeeView events={events} registrations={registrations} initialEventId={rawEvent} />
    </div>
  );
}
