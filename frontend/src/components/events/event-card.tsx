import Link from "next/link";
import { ArrowUpRight, CalendarDays, CircleCheckBig, MapPin } from "lucide-react";
import { CategoryBadge, EventStatusBadge } from "@/components/events/status-badge";
import { EventPoster } from "@/components/events/event-poster";
import { Badge } from "@/components/ui/badge";
import { fillRate, isRegistrationClosed, isSoldOut, spotsLeft } from "@/lib/events";
import { DEMO_TODAY, formatMonthDay, formatTimeRange, formatPrice, relativeDayLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CampusEvent } from "@/types";

export function EventCard({
  event,
  registered = false,
  className,
}: {
  event: CampusEvent;
  registered?: boolean;
  className?: string;
}) {
  const soldOut = isSoldOut(event);
  const closed = isRegistrationClosed(event, DEMO_TODAY) || event.status === "completed";

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-card border border-cream-200 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-float",
        className,
      )}
    >
      <Link
        href={`/events/${event.id}`}
        className="relative block focus-visible:outline-none"
        aria-label={`View details for ${event.title}`}
      >
        <EventPoster
          event={event}
          rounded="rounded-none"
          className="aspect-[4/3] w-full"
        />
        <span className="absolute left-3 top-3 inline-flex flex-col items-center rounded-2xl bg-white/95 px-2.5 py-1.5 text-center shadow-soft">
          <span className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-brand-600">
            {formatMonthDay(event.startsAt).split(" ")[0]}
          </span>
          <span className="text-sm font-semibold leading-none text-ink-900">
            {formatMonthDay(event.startsAt).split(" ")[1]}
          </span>
        </span>
        <span className="absolute right-3 top-3 flex flex-col items-end gap-1.5">
          {event.status !== "published" ? <EventStatusBadge status={event.status} /> : null}
          {registered ? (
            <Badge tone="leaf" icon={<CircleCheckBig className="size-3.5" />}>
              Registered
            </Badge>
          ) : null}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-2">
          <CategoryBadge category={event.category} />
          <span className="text-xs font-medium text-ink-400">
            {relativeDayLabel(event.startsAt)}
          </span>
        </div>

        <h3 className="mt-3 text-lg font-semibold leading-snug text-ink-900">
          <Link href={`/events/${event.id}`} className="transition-colors hover:text-brand-700">
            {event.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-500">
          {event.summary}
        </p>

        <dl className="mt-4 space-y-2 text-sm text-ink-700">
          <div className="flex items-center gap-2">
            <CalendarDays aria-hidden="true" className="size-4 text-brand-600" />
            <dt className="sr-only">Date and time</dt>
            <dd>{formatTimeRange(event.startsAt, event.endsAt)}</dd>
          </div>
          <div className="flex items-center gap-2">
            <MapPin aria-hidden="true" className="size-4 text-brand-600" />
            <dt className="sr-only">Venue</dt>
            <dd className="line-clamp-1">{event.venue}</dd>
          </div>
        </dl>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-cream-200 pt-4">
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-ink-400">
              {event.priceUsd > 0 ? "Entry" : "Free entry"}
            </p>
            <p
              className={cn(
                "text-lg font-semibold",
                event.priceUsd > 0 ? "text-berry-500" : "text-leaf-500",
              )}
            >
              {formatPrice(event.priceUsd)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-ink-700">
              {soldOut ? "Waitlist open" : `${spotsLeft(event)} seats left`}
            </p>
            <p className="text-xs text-ink-400">{fillRate(event)}% booked</p>
          </div>
        </div>

        <Link
          href={`/events/${event.id}`}
          className={cn(
            "mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors",
            closed
              ? "bg-cream-200 text-ink-500 hover:bg-cream-300"
              : "bg-brand-500 text-white hover:bg-brand-600",
          )}
        >
          {closed
            ? "View recap"
            : registered
              ? "View ticket"
              : soldOut
                ? "Join waitlist"
                : "Register now"}
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
    </article>
  );
}
