import Link from "next/link";
import { UserPlus } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { RegistrationStatusBadge } from "@/components/events/status-badge";
import { getEventById } from "@/lib/events";
import { formatDateTimeStamp } from "@/lib/format";
import type { CampusEvent, Registration } from "@/types";

export function RecentRegistrations({
  registrations,
  events,
  limit = 6,
  title = "Recent registrations",
  compact = false,
  live = false,
}: {
  registrations: Registration[];
  events?: CampusEvent[];
  limit?: number;
  title?: string;
  compact?: boolean;
  live?: boolean;
}) {
  const latest = [...registrations]
    .sort((a, b) => b.registeredAt.localeCompare(a.registeredAt))
    .slice(0, limit);

  return (
    <Card>
      <CardHeader
        title={title}
        description={`Newest ${latest.length} of ${registrations.length} registrations`}
        icon={<UserPlus className="size-4" />}
        action={
          <Link
            href="/dashboard/attendees"
            className="rounded-full bg-brand-500 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-600"
          >
            View all
          </Link>
        }
      />
      <ul className="divide-y divide-cream-200">
        {latest.map((registration) => {
          const event =
            events?.find((candidate) => candidate.id === registration.eventId) ??
            getEventById(registration.eventId);
          return (
            <li
              key={registration.id}
              className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-cream-50"
            >
              <Avatar name={registration.studentName} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink-900">
                  {registration.studentName}
                </p>
                <p className="truncate text-xs text-ink-500">
                  {compact ? registration.ticketCode : `${event?.title ?? "Event"} · ${registration.programme}`}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <RegistrationStatusBadge status={registration.status} />
                {!compact ? (
                  <span className="text-[0.68rem] text-ink-400">
                    {formatDateTimeStamp(registration.registeredAt)}
                  </span>
                ) : null}
              </div>
            </li>
          );
        })}
        {latest.length === 0 ? (
          <li className="px-5 py-6 text-sm text-ink-500">
            No registrations yet. Share the event page with your club to start filling seats.
          </li>
        ) : null}
      </ul>
      <div className="border-t border-cream-200 px-5 py-3">
        <Badge tone="outline">
          {live ? "Live data" : "Sample data · resets on reload"}
        </Badge>
      </div>
    </Card>
  );
}
