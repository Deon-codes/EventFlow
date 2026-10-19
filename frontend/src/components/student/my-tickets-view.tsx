"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Compass,
  Copy,
  MapPin,
  QrCode,
  Ticket,
  X,
  XCircle,
} from "lucide-react";
import { formatFullDate, formatTimeRange } from "@/lib/format";

type RegistrationItem = {
  id: string;
  ticketCode: string;
  status: "REGISTERED" | "CHECKED_IN" | "CANCELLED";
  createdAt: string;
  checkedInAt?: string | null;
  event?: {
    id: string;
    title: string;
    category: string;
    location: string;
    startsAt: string;
    endsAt: string;
    posterUrl?: string | null;
  };
};

export function MyTicketsView({
  initialRegistrations,
  studentName,
  studentEmail,
}: {
  initialRegistrations: RegistrationItem[];
  studentName: string;
  studentEmail: string;
}) {
  const [registrations, setRegistrations] = useState<RegistrationItem[]>(initialRegistrations || []);
  const [filter, setFilter] = useState<"all" | "active" | "attended" | "cancelled">("all");
  const [activeTicketModal, setActiveTicketModal] = useState<RegistrationItem | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const activeCount = registrations.filter((r) => r.status === "REGISTERED").length;
  const attendedCount = registrations.filter((r) => r.status === "CHECKED_IN").length;

  const filtered = registrations.filter((item) => {
    if (filter === "active") return item.status === "REGISTERED";
    if (filter === "attended") return item.status === "CHECKED_IN";
    if (filter === "cancelled") return item.status === "CANCELLED";
    return true;
  });

  async function handleCancel(regId: string) {
    if (!confirm("Are you sure you want to cancel this registration? Your reserved seat will be released.")) {
      return;
    }
    setCancellingId(regId);
    try {
      const res = await fetch(`/api/registrations/${regId}`, { method: "DELETE" });
      if (res.ok) {
        setRegistrations((prev) =>
          prev.map((r) => (r.id === regId ? { ...r, status: "CANCELLED" } : r))
        );
        if (activeTicketModal?.id === regId) {
          setActiveTicketModal(null);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCancellingId(null);
    }
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Bookings</p>
          <p className="mt-2 text-3xl font-black text-indigo-600">{activeCount}</p>
          <p className="mt-1 text-xs text-slate-500">Upcoming events ready for entrance</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Events Attended</p>
          <p className="mt-2 text-3xl font-black text-emerald-600">{attendedCount}</p>
          <p className="mt-1 text-xs text-slate-500">Verified campus check-ins</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Registered</p>
          <p className="mt-2 text-3xl font-black text-slate-900">{registrations.length}</p>
          <p className="mt-1 text-xs text-slate-500">Lifetime event bookings</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {(
          [
            { id: "all", label: `All (${registrations.length})` },
            { id: "active", label: `Upcoming & Active (${activeCount})` },
            { id: "attended", label: `Attended (${attendedCount})` },
            { id: "cancelled", label: "Cancelled" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
              filter === tab.id
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Ticket Cards Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Ticket className="size-7" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-slate-900">No Tickets in this View</h3>
          <p className="mt-1 text-sm text-slate-500">
            {filter === "all"
              ? "You haven't reserved any campus event tickets yet."
              : `You have no ${filter} tickets.`}
          </p>
          <div className="mt-6">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              <Compass className="size-4" />
              Explore Events to Book
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {filtered.map((item) => {
            const evt = item.event;
            const isRegistered = item.status === "REGISTERED";
            const isCheckedIn = item.status === "CHECKED_IN";
            const isCancelled = item.status === "CANCELLED";

            return (
              <div
                key={item.id}
                className="flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                      {evt?.category || "Campus Event"}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                        isCheckedIn
                          ? "bg-emerald-100 text-emerald-800"
                          : isCancelled
                          ? "bg-slate-100 text-slate-600"
                          : "bg-indigo-100 text-indigo-800"
                      }`}
                    >
                      {isCheckedIn ? (
                        <>
                          <CheckCircle2 className="size-3" />
                          Checked In
                        </>
                      ) : isCancelled ? (
                        <>
                          <XCircle className="size-3" />
                          Cancelled
                        </>
                      ) : (
                        <>
                          <Ticket className="size-3" />
                          Confirmed
                        </>
                      )}
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-slate-900 leading-snug">
                    <Link
                      href={evt ? `/events/${evt.id}` : "#"}
                      className="hover:text-indigo-600 transition-colors"
                    >
                      {evt?.title || "Campus Event"}
                    </Link>
                  </h3>

                  <div className="mt-4 space-y-2 text-xs text-slate-600">
                    {evt?.startsAt && (
                      <p className="flex items-center gap-2">
                        <CalendarDays className="size-4 text-indigo-600" />
                        <span>{formatFullDate(evt.startsAt)}</span>
                      </p>
                    )}
                    {evt?.location && (
                      <p className="flex items-center gap-2">
                        <MapPin className="size-4 text-indigo-600" />
                        <span>{evt.location}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-4">
                  {/* Ticket Code Row */}
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2.5">
                    <div>
                      <p className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-400">
                        Ticket Code
                      </p>
                      <p className="font-mono text-sm font-bold text-slate-900">
                        {item.ticketCode}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyCode(item.ticketCode)}
                      title="Copy ticket code"
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                    >
                      <Copy className="size-4" />
                    </button>
                  </div>

                  {copiedCode === item.ticketCode && (
                    <p className="mt-1 text-right text-[0.68rem] font-semibold text-emerald-600">
                      Copied to clipboard!
                    </p>
                  )}

                  {/* Actions */}
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTicketModal(item)}
                      className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-center text-xs font-bold text-white shadow-sm transition-all hover:bg-indigo-700"
                    >
                      View Digital Pass
                    </button>

                    {isRegistered && (
                      <button
                        type="button"
                        disabled={cancellingId === item.id}
                        onClick={() => handleCancel(item.id)}
                        className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors"
                      >
                        {cancellingId === item.id ? "…" : "Cancel"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Digital Pass Modal */}
      {activeTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setActiveTicketModal(null)}
          />
          <div className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <button
              type="button"
              onClick={() => setActiveTicketModal(null)}
              className="absolute right-4 top-4 grid size-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="size-4" />
            </button>

            <div className="text-center">
              <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-700">
                Kampus E-Ticket
              </span>
              <h3 className="mt-3 text-lg font-bold text-slate-900 leading-snug">
                {activeTicketModal.event?.title || "Campus Event"}
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                {activeTicketModal.event?.location}
              </p>
            </div>

            {/* Simulated Digital QR Entrance Tile */}
            <div className="my-6 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 p-6">
              <div className="grid size-36 place-items-center rounded-xl bg-white p-2 shadow-inner">
                {/* SVG QR Code Simulation */}
                <svg viewBox="0 0 100 100" className="size-32 text-slate-900">
                  <rect x="0" y="0" width="30" height="30" fill="currentColor" />
                  <rect x="5" y="5" width="20" height="20" fill="white" />
                  <rect x="10" y="10" width="10" height="10" fill="currentColor" />

                  <rect x="70" y="0" width="30" height="30" fill="currentColor" />
                  <rect x="75" y="5" width="20" height="20" fill="white" />
                  <rect x="80" y="10" width="10" height="10" fill="currentColor" />

                  <rect x="0" y="70" width="30" height="30" fill="currentColor" />
                  <rect x="5" y="75" width="20" height="20" fill="white" />
                  <rect x="10" y="80" width="10" height="10" fill="currentColor" />

                  <rect x="40" y="10" width="15" height="15" fill="currentColor" />
                  <rect x="45" y="35" width="20" height="10" fill="currentColor" />
                  <rect x="25" y="45" width="15" height="15" fill="currentColor" />
                  <rect x="50" y="55" width="15" height="15" fill="currentColor" />
                  <rect x="75" y="40" width="15" height="20" fill="currentColor" />
                  <rect x="40" y="80" width="20" height="10" fill="currentColor" />
                  <rect x="70" y="75" width="15" height="15" fill="currentColor" />
                </svg>
              </div>
              <p className="mt-3 font-mono text-sm font-bold text-slate-900">
                {activeTicketModal.ticketCode}
              </p>
              <p className="text-[0.65rem] text-slate-500">Scan at entrance scanner</p>
            </div>

            <div className="space-y-1.5 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Attendee:</span>
                <span className="font-semibold">{studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="font-semibold">{studentEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="font-bold text-emerald-600">
                  {activeTicketModal.status}
                </span>
              </div>
            </div>

            <div className="mt-5">
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800"
              >
                Print / Save Pass
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
