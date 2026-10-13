"use client";

import { useEffect, useState } from "react";
import { CircleCheckBig, Clock3, Hourglass, Ticket, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { isRegistrationClosed, isSoldOut, spotsLeft } from "@/lib/events";
import { DEMO_TODAY, formatDateTimeStamp } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CampusEvent, Registration } from "@/types";

type Outcome = "confirmed" | "waitlisted" | "cancelled";

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch(`/api/events/${event.id}/registrations`).then(async (response) => {
      if (!response.ok) return null;
      return response.json();
    }).then((row) => {
      if (!active) return;
      setRegistration(row?.status === "REGISTERED" || row?.status === "CHECKED_IN" ? {
        id: row.id, eventId: row.eventId, studentId: "", studentName: "You", studentEmail: "", programme: "", year: "", status: "confirmed", registeredAt: row.createdAt, ticketCode: row.ticketCode,
      } : null);
    }).catch(() => undefined);
    return () => { active = false; };
  }, [event.id]);

  const soldOut = isSoldOut(event);
  const closed = isRegistrationClosed(event, DEMO_TODAY) || event.status !== "published";
  const outcome: Outcome | null = registration
    ? registration.status === "waitlisted"
      ? "waitlisted"
      : "confirmed"
    : null;

  async function submit() {
    setPending(true);
    setError(null);
    try {
      const response = await fetch(`/api/events/${event.id}/registrations`, { method: "POST" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Registration failed.");
      setRegistration({ id: result.id, eventId: event.id, studentId: "", studentName: "You", studentEmail: "", programme: "", year: "", status: "confirmed", registeredAt: result.createdAt, ticketCode: result.ticketCode });
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Registration failed."); }
    finally { setPending(false); }
  }

  async function cancel() {
    setPending(true);
    setError(null);
    try {
      const response = await fetch(`/api/registrations/${registration?.id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Cancellation failed.");
      setRegistration(null);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Cancellation failed."); }
    finally { setPending(false); }
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
          disabled={soldOut}
          onClick={submit}
          icon={soldOut ? <Hourglass className="size-4" /> : <Ticket className="size-4" />}
        >
          {pending
            ? soldOut
              ? "Joining waitlist…"
              : "Reserving your seat…"
            : soldOut
              ? "Event is full"
              : "Register for this event"}
        </Button>
      )}

      <Notice tone={error ? "danger" : registration ? "success" : "info"} className="text-xs">
        {error ? <span role="alert">{error}</span> : registration ? <span>Your registration is saved to EventFlow.</span> : <span>Sign in before reserving a seat. Full-event waitlists are not enabled.</span>}
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
