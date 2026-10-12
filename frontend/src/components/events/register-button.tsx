"use client";

import { useEffect, useRef, useState } from "react";
import { CircleCheckBig, Clock3, Hourglass, Ticket, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { isRegistrationClosed, isSoldOut, spotsLeft } from "@/lib/events";
import { DEMO_TODAY, formatDateTimeStamp } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CampusEvent, Registration } from "@/types";

type Outcome = "confirmed" | "waitlisted" | "cancelled";

function ticketCodeFor(event: CampusEvent): string {
  const prefix = event.id.replace("evt-", "").slice(0, 3).toUpperCase();
  return `EF-${prefix}-${String(event.registered + 1).padStart(3, "0")}`;
}

/**
 * Registration action.
 *
 * IMPORTANT: this does not persist anything. It simulates the request/response
 * cycle so the UI, loading state and confirmations can be reviewed before the
 * AWS milestone wires the same interaction to the RDS-backed API.
 */
export function RegisterButton({
  event,
  initialRegistration = null,
  className,
}: {
  event: CampusEvent;
  initialRegistration?: Registration | null;
  className?: string;
}) {
  const [pending, setPending] = useState(false);
  const [registration, setRegistration] = useState<Registration | null>(
    initialRegistration,
  );
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const soldOut = isSoldOut(event);
  const closed = isRegistrationClosed(event, DEMO_TODAY) || event.status !== "published";
  const outcome: Outcome | null = registration
    ? registration.status === "waitlisted"
      ? "waitlisted"
      : "confirmed"
    : null;

  function submit() {
    setPending(true);
    timer.current = setTimeout(() => {
      setPending(false);
      setRegistration({
        id: `${event.id}-local`,
        eventId: event.id,
        studentId: "stu-1042",
        studentName: "Maya Rodrigues",
        studentEmail: "maya.rodrigues@campus.edu",
        programme: "B.Tech Computer Science",
        year: "3rd year",
        status: soldOut ? "waitlisted" : "confirmed",
        registeredAt: DEMO_TODAY,
        ticketCode: ticketCodeFor(event),
      });
    }, 850);
  }

  function cancel() {
    setPending(true);
    timer.current = setTimeout(() => {
      setPending(false);
      setRegistration(null);
    }, 600);
  }

  if (closed) {
    return (
      <div className={cn("space-y-3", className)}>
        <Button variant="secondary" size="lg" className="w-full" disabled>
          Registration closed
        </Button>
        <p className="text-center text-xs text-ink-500">
          {event.status === "completed"
            ? "This event has already taken place."
            : "The registration deadline has passed."}
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {outcome ? (
        <>
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-leaf-500/20 bg-leaf-100 px-4 py-3">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-leaf-500">
                {outcome === "waitlisted" ? (
                  <Hourglass aria-hidden="true" className="size-4" />
                ) : (
                  <CircleCheckBig aria-hidden="true" className="size-4" />
                )}
                {outcome === "waitlisted" ? "You are on the waitlist" : "You are registered"}
              </p>
              <p className="mt-0.5 text-xs text-ink-700">
                Ticket{" "}
                <span className="font-mono font-semibold">{registration?.ticketCode}</span> ·
                issued {formatDateTimeStamp(registration?.registeredAt ?? DEMO_TODAY)}
              </p>
            </div>
            <Ticket aria-hidden="true" className="size-6 text-leaf-500" />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            loading={pending}
            icon={<X className="size-3.5" />}
            onClick={cancel}
          >
            Cancel registration
          </Button>
        </>
      ) : (
        <Button
          size="lg"
          className="w-full"
          loading={pending}
          onClick={submit}
          icon={soldOut ? <Hourglass className="size-4" /> : <Ticket className="size-4" />}
        >
          {pending
            ? soldOut
              ? "Joining waitlist…"
              : "Reserving your seat…"
            : soldOut
              ? "Join the waitlist"
              : "Register for this event"}
        </Button>
      )}

      <Notice tone="warning" className="text-xs">
        <span className="font-semibold">Preview behaviour.</span> This action runs entirely in
        the browser — nothing is saved. The AWS milestone posts it to{" "}
        <span className="font-mono">POST /api/events/{event.id}/registrations</span> and stores
        the ticket in Amazon RDS.
        {!soldOut ? (
          <span className="mt-1 flex items-center gap-1.5 text-ink-500">
            <Clock3 aria-hidden="true" className="size-3.5" />
            {spotsLeft(event)} of {event.capacity} seats still open
          </span>
        ) : null}
      </Notice>
    </div>
  );
}
