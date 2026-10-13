"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, LogIn, Ticket, X } from "lucide-react";
import { isRegistrationClosed, isSoldOut, spotsLeft } from "@/lib/events";
import { DEMO_TODAY, formatDateTimeStamp } from "@/lib/format";
import type { CampusEvent, Registration } from "@/types";

export function RegisterButton({
  event,
  initialRegistration = null,
  className = "",
}: {
  event: CampusEvent;
  initialRegistration?: Registration | null;
  className?: string;
}) {
  const [pending, setPending] = useState(false);
  const [registration, setRegistration] = useState<Registration | null>(initialRegistration);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; role: string; name: string } | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (active && data?.user) {
          setUser(data.user);
          // Check if already registered
          fetch(`/api/events/${event.id}/registrations`)
            .then((res) => (res.ok ? res.json() : null))
            .then((row) => {
              if (active && row && (row.status === "REGISTERED" || row.status === "CHECKED_IN")) {
                setRegistration({
                  id: row.id,
                  eventId: event.id,
                  studentId: data.user.id,
                  studentName: data.user.name,
                  studentEmail: data.user.email,
                  programme: "Student",
                  year: "",
                  status: "confirmed",
                  registeredAt: row.createdAt || new Date().toISOString(),
                  ticketCode: row.ticketCode,
                });
              }
            })
            .catch(() => {});
        }
      })
      .finally(() => {
        if (active) setCheckingAuth(false);
      });
    return () => {
      active = false;
    };
  }, [event.id]);

  const soldOut = isSoldOut(event);
  const closed = isRegistrationClosed(event, DEMO_TODAY) || event.status === "completed" || event.status === "cancelled";

  async function handleBook() {
    if (!user) return;
    setPending(true);
    setError(null);
    try {
      const response = await fetch(`/api/events/${event.id}/registrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error ?? "Registration failed.");
      }
      setRegistration({
        id: result.id,
        eventId: event.id,
        studentId: user.id,
        studentName: user.name,
        studentEmail: "",
        programme: "Student",
        year: "",
        status: "confirmed",
        registeredAt: result.createdAt,
        ticketCode: result.ticketCode,
      });
    } catch (caught: any) {
      setError(caught.message || "Failed to book seat.");
    } finally {
      setPending(false);
    }
  }

  async function handleCancel() {
    if (!registration) return;
    setPending(true);
    setError(null);
    try {
      const response = await fetch(`/api/registrations/${registration.id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Cancellation failed.");
      setRegistration(null);
    } catch (caught: any) {
      setError(caught.message || "Failed to cancel registration.");
    } finally {
      setPending(false);
    }
  }

  if (closed) {
    return (
      <div className={`space-y-2 ${className}`}>
        <button
          disabled
          className="w-full rounded-xl bg-slate-100 py-3 text-sm font-semibold text-slate-400 cursor-not-allowed"
        >
          Registration Closed
        </button>
        <p className="text-center text-xs text-slate-500">
          This event has already concluded or reached its deadline.
        </p>
      </div>
    );
  }

  if (registration) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="size-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-bold text-emerald-900">Seat Confirmed!</p>
              <p className="mt-0.5 text-xs text-emerald-700">
                Ticket Code: <span className="font-mono font-bold">{registration.ticketCode}</span>
              </p>
              <p className="text-[0.7rem] text-emerald-600 mt-0.5">
                Issued {formatDateTimeStamp(registration.registeredAt || DEMO_TODAY)}
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/registrations"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-700 shadow-sm"
        >
          <Ticket className="size-4" />
          View in My Tickets
        </Link>

        <button
          type="button"
          onClick={handleCancel}
          disabled={pending}
          className="w-full text-center text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors"
        >
          {pending ? "Cancelling…" : "Cancel this booking"}
        </button>
      </div>
    );
  }

  if (!user && !checkingAuth) {
    return (
      <div className={`space-y-3 ${className}`}>
        <Link
          href={`/login?redirect=/events/${event.id}`}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-indigo-700"
        >
          <LogIn className="size-4" />
          Sign in to Book Ticket
        </Link>
        <p className="text-center text-xs text-slate-500">
          Campus student account required to claim your seat.
        </p>
      </div>
    );
  }

  if (user && user.role !== "STUDENT") {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          You are signed in as an <strong>Organizer</strong>. Only student accounts can reserve tickets.
        </div>
        <Link
          href="/dashboard/events"
          className="block text-center text-xs font-semibold text-indigo-600 hover:underline"
        >
          Go to Organizer Dashboard →
        </Link>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
          {error}
        </div>
      )}

      <button
        type="button"
        disabled={pending || soldOut}
        onClick={handleBook}
        className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold shadow-md transition-all ${
          soldOut
            ? "bg-slate-200 text-slate-500 cursor-not-allowed"
            : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-600/25"
        }`}
      >
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Reserving Seat…
          </>
        ) : soldOut ? (
          "Event Capacity Full"
        ) : (
          <>
            <Ticket className="size-4" />
            Book Free Ticket
          </>
        )}
      </button>

      {!soldOut && (
        <p className="text-center text-xs text-slate-500">
          Instant confirmation · {spotsLeft(event)} seats left
        </p>
      )}
    </div>
  );
}
