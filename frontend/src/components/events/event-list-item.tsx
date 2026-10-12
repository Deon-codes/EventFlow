import Link from "next/link";
import { Bookmark, CalendarDays, CircleCheckBig, Clock, MapPin, Users } from "lucide-react";
import { EventPoster } from "@/components/events/event-poster";
import { CategoryBadge } from "@/components/events/status-badge";
import { Badge } from "@/components/ui/badge";
import { fillRate, isSoldOut, spotsLeft } from "@/lib/events";
import {
  formatShortDate,
  formatTime,
  formatTimeRange,
  formatPrice,
  relativeDayLabel,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CampusEvent } from "@/types";

/** Reference B's headline row: thumbnail left, copy centre, price column right. */
export function EventListItem({
  event,
  registered = false,
  className,
}: {
  event: CampusEvent;
  registered?: boolean;
  className?: string;
}) {
  const soldOut = isSoldOut(event);

  return (
    <article
      className={cn(
        "group flex flex-col gap-4 rounded-card border border-cream-200 bg-white p-4 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-float sm:flex-row sm:items-center sm:p-5",
        className,
      )}
    >
      <Link
        href={`/events/${event.id}`}
        className="shrink-0"
        aria-label={`View details for ${event.title}`}
      >
        <EventPoster
          event={event}
          showWordmark={false}
          className="h-40 w-full sm:h-28 sm:w-36"
        />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-600">
            {formatShortDate(event.startsAt)}
          </span>
          <CategoryBadge category={event.category} />
          {registered ? (
            <Badge tone="leaf" icon={<CircleCheckBig className="size-3.5" />}>
              Registered
            </Badge>
          ) : null}
        </div>

        <h3 className="mt-1.5 text-base font-semibold leading-snug text-ink-900 sm:text-lg">
          <Link href={`/events/${event.id}`} className="transition-colors hover:text-brand-700">
            {event.title}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-ink-500">
          {event.summary}
        </p>

        <ul className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-500">
          <li className="inline-flex items-center gap-1.5">
            <Clock aria-hidden="true" className="size-3.5 text-ink-400" />
            {formatTimeRange(event.startsAt, event.endsAt)}
          </li>
          <li className="inline-flex items-center gap-1.5">
            <MapPin aria-hidden="true" className="size-3.5 text-ink-400" />
            {event.venue}
          </li>
          <li className="inline-flex items-center gap-1.5">
            <Users aria-hidden="true" className="size-3.5 text-ink-400" />
            {event.registered}/{event.capacity} registered
          </li>
        </ul>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-cream-200 pt-3 sm:w-44 sm:flex-col sm:items-end sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
        <div className="sm:text-right">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-ink-400">
            Starts at
          </p>
          <p
            className={cn(
              "text-xl font-semibold",
              event.priceUsd > 0 ? "text-berry-500" : "text-leaf-500",
            )}
          >
            {formatPrice(event.priceUsd)}
          </p>
          <p className="mt-1 text-xs text-ink-400">
            {soldOut
              ? `${fillRate(event)}% full · waitlist`
              : `${spotsLeft(event)} seats left`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="inline-grid size-10 place-items-center rounded-2xl border border-cream-300 text-ink-400 transition-colors group-hover:border-brand-300 group-hover:text-brand-600"
            title="Saved events arrive with the backend milestone"
          >
            <Bookmark aria-hidden="true" className="size-4" />
          </span>
          <Link
            href={`/events/${event.id}`}
            className="inline-flex h-10 items-center gap-1.5 rounded-full bg-brand-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
          >
            {registered ? "Ticket" : soldOut ? "Waitlist" : "Register"}
          </Link>
        </div>
      </div>
    </article>
  );
}

/** Compact row used in the right rail's "popular events" list. */
export function EventRailItem({
  event,
  index,
  registered = false,
}: {
  event: CampusEvent;
  index: number;
  registered?: boolean;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 text-sm font-semibold text-ink-400">{index}.</span>
      <div className="min-w-0 flex-1">
        <Link
          href={`/events/${event.id}`}
          className="line-clamp-2 text-sm font-semibold text-ink-900 transition-colors hover:text-brand-700"
        >
          {event.title}
        </Link>
        <p className="mt-0.5 flex items-center gap-2 text-xs text-ink-400">
          <span>{event.registered} registered</span>
          {registered ? (
            <span className="font-semibold text-leaf-500">· yours</span>
          ) : null}
        </p>
        <p className="mt-1 inline-flex items-center gap-1.5 text-[0.7rem] font-medium text-ink-500">
          <CalendarDays aria-hidden="true" className="size-3.5 text-brand-600" />
          {relativeDayLabel(event.startsAt)} · {formatTime(event.startsAt)}
        </p>
      </div>
    </li>
  );
}
