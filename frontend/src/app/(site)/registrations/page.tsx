import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Compass, Ticket, User } from "lucide-react";
import { currentUser } from "@/lib/session";
import { dbService } from "@/lib/db-service";
import { MyTicketsView } from "@/components/student/my-tickets-view";

export const metadata: Metadata = {
  title: "My Tickets & Bookings",
  description: "View and manage your campus event ticket wallet and registrations.",
};

export default async function RegistrationsPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/login?redirect=/registrations");
  }

  if (user.role === "ORGANIZER" || user.role === "ADMIN") {
    redirect("/dashboard");
  }

  let rawRegistrations: any[] = [];
  try {
    rawRegistrations = await dbService.getStudentRegistrations(user.id);
  } catch {
    rawRegistrations = [];
  }

  const registrations = (rawRegistrations || []).map((r: any) => ({
    id: r.id,
    ticketCode: r.ticketCode,
    status: r.status,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt || ""),
    checkedInAt:
      r.checkedInAt instanceof Date
        ? r.checkedInAt.toISOString()
        : r.checkedInAt
        ? String(r.checkedInAt)
        : null,
    event: r.event
      ? {
          id: r.event.id,
          title: r.event.title,
          category: r.event.category,
          location: r.event.location,
          startsAt:
            r.event.startsAt instanceof Date
              ? r.event.startsAt.toISOString()
              : String(r.event.startsAt || ""),
          endsAt:
            r.event.endsAt instanceof Date
              ? r.event.endsAt.toISOString()
              : String(r.event.endsAt || ""),
          posterUrl: r.event.posterUrl,
        }
      : undefined,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Student Greeting Band */}
      <div className="rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 via-white to-purple-50/50 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">
              <Ticket className="size-3.5" />
              Student Ticket Wallet
            </span>
            <h1 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
              Welcome back, {user.name}!
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Your verified seat reservations and digital entrance ticket passes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700"
            >
              <Compass className="size-4" />
              Discover More Events
            </Link>
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              <User className="size-4 text-slate-500" />
              Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Ticket List View with Real Dynamic Data */}
      <MyTicketsView
        initialRegistrations={registrations as any}
        studentName={user.name}
        studentEmail={user.email}
      />
    </div>
  );
}
