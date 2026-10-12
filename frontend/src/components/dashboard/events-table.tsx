import type { ReactNode } from "react";
import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import { EventPoster } from "@/components/events/event-poster";
import { EventStatusBadge } from "@/components/events/status-badge";
import { ProgressBar } from "@/components/ui/progress";
import { fillRate, spotsLeft } from "@/lib/events";
import { formatShortDate, formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CampusEvent } from "@/types";

/**
 * Reference A's data table: thumbnail + title, category, schedule, status,
 * capacity meter and row actions. Shared by the dashboard and the Manage Events
 * screen, so the same markup serves server and client parents.
 */
export function EventsTable({
  events,
  actions,
  caption = "Organizer events",
  showCategory = true,
}: {
  events: CampusEvent[];
  actions?: (event: CampusEvent) => ReactNode;
  caption?: string;
  showCategory?: boolean;
}) {
  return (
    <div className="overflow-x-auto scrollbar-warm">
      <table className="w-full min-w-[46rem] border-collapse text-left">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="text-[0.66rem] uppercase tracking-[0.14em] text-ink-400">
            <th scope="col" className="px-5 py-3 font-semibold">
              Event
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Schedule
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Status
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Capacity
            </th>
            {actions ? (
              <th scope="col" className="px-5 py-3 text-right font-semibold">
                Actions
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-cream-200">
          {events.map((event) => {
            const filled = fillRate(event);
            return (
              <tr key={event.id} className="group transition-colors hover:bg-cream-50">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <EventPoster
                      event={event}
                      showWordmark={false}
                      rounded="rounded-2xl"
                      className="size-12 shrink-0"
                    />
                    <div className="min-w-0">
                      <Link
                        href={`/events/${event.id}`}
                        className="line-clamp-1 font-semibold text-ink-900 transition-colors hover:text-brand-700"
                      >
                        {event.title}
                      </Link>
                      {showCategory ? (
                        <p className="mt-0.5 text-xs text-ink-500">{event.category}</p>
                      ) : null}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 align-middle">
                  <p className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-900">
                    <CalendarDays aria-hidden="true" className="size-3.5 text-brand-600" />
                    {formatShortDate(event.startsAt)}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-500">
                    {formatTime(event.startsAt)} ·{" "}
                    <span className="inline-flex items-center gap-1">
                      <MapPin aria-hidden="true" className="size-3" />
                      {event.venue}
                    </span>
                  </p>
                </td>
                <td className="px-4 py-4">
                  <EventStatusBadge status={event.status} />
                </td>
                <td className="px-4 py-4">
                  <div className="w-40">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-ink-900">
                        {event.registered}/{event.capacity}
                      </span>
                      <span
                        className={cn(
                          "font-medium",
                          filled >= 100 ? "text-berry-500" : "text-ink-500",
                        )}
                      >
                        {filled}%
                      </span>
                    </div>
                    <ProgressBar
                      value={filled}
                      className="mt-1.5 h-1.5"
                      barClassName={filled >= 100 ? "bg-berry-500" : "bg-brand-500"}
                    />
                    <p className="mt-1 text-[0.68rem] text-ink-400">
                      {filled >= 100
                        ? `${event.waitlisted} waitlisted`
                        : `${spotsLeft(event)} seats left`}
                    </p>
                  </div>
                </td>
                {actions ? (
                  <td className="px-5 py-4 text-right align-middle">{actions(event)}</td>
                ) : null}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
