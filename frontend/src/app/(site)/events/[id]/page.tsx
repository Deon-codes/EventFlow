import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  Globe,
  MapPin,
  Share2,
  Sparkles,
  Ticket,
  Users,
} from "lucide-react";
import { EventPoster } from "@/components/events/event-poster";
import { RegisterButton } from "@/components/events/register-button";
import { EventCard } from "@/components/events/event-card";
import { CategoryBadge, EventStatusBadge } from "@/components/events/status-badge";
import { CapacityMeter } from "@/components/ui/progress";
import {
  allEvents,
  fillRate,
  getEventById,
  isSoldOut,
  relatedEvents,
  spotsLeft,
} from "@/lib/events";
import { publishedEventForUi } from "@/lib/event-mapper";
import { currentUser } from "@/lib/session";
import { dbService } from "@/lib/db-service";
import {
  formatFullDate,
  formatTimeRange,
  formatPrice,
  relativeDayLabel,
} from "@/lib/format";

export function generateStaticParams() {
  return allEvents().map((event) => ({ id: event.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  let event = await publishedEventForUi(id);
  if (!event) event = getEventById(id) || null;
  if (!event) return { title: "Event not found" };

  return {
    title: `${event.title} · EventFlow`,
    description: event.summary,
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let event = await publishedEventForUi(id);
  if (!event) {
    event = getEventById(id) || null;
  }
  if (!event) notFound();

  const user = await currentUser();
  let userRegistration = null;
  if (user && user.role === "STUDENT") {
    const registrations = await dbService.getStudentRegistrations(user.id);
    const found = registrations.find((r) => (r.event?.id || (r as any).eventId) === event.id);
    if (found) {
      userRegistration = {
        id: found.id,
        eventId: event.id,
        studentId: user.id,
        studentName: user.name,
        studentEmail: user.email,
        programme: "Student",
        year: "",
        status: (found.status === "REGISTERED" || found.status === "CHECKED_IN" ? "confirmed" : "cancelled") as any,
        registeredAt: typeof found.createdAt === "string" ? found.createdAt : (found.createdAt as Date).toISOString(),
        ticketCode: found.ticketCode,
      };
    }
  }

  const related = relatedEvents(event, 3);
  const soldOut = isSoldOut(event);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      {/* Breadcrumb Back Link */}
      <div>
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-indigo-600"
        >
          <ArrowLeft className="size-4" />
          Back to all events
        </Link>
      </div>

      {/* Main Event Showcase Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Media & Event Description */}
        <div className="space-y-8 lg:col-span-2">
          {/* Large Event Banner */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900">
              <EventPoster event={event} rounded="rounded-none" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <div className="flex flex-wrap items-center gap-2">
                  <CategoryBadge category={event.category} />
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                    {relativeDayLabel(event.startsAt)}
                  </span>
                </div>
                <h1 className="mt-3 text-2xl font-extrabold sm:text-4xl text-white">
                  {event.title}
                </h1>
              </div>
            </div>
          </div>

          {/* Key Event Details Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Event Overview</h2>
            <div className="space-y-4 text-base leading-relaxed text-slate-600">
              {Array.isArray(event.description) ? (
                event.description.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))
              ) : (
                <p>{event.description || event.summary}</p>
              )}
            </div>

            {/* Highlights */}
            <div className="border-t border-slate-100 pt-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                What's Included
              </h3>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  "Official Campus Participation Certificate",
                  "Networking with mentors and club leads",
                  "Verified E-Ticket with Entrance QR Code",
                  "Refreshments & event kit provided",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Schedule & Venue Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Date & Location</h2>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="flex items-start gap-3.5 rounded-2xl bg-slate-50 p-4">
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-indigo-100 text-indigo-700">
                  <CalendarDays className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Date & Time</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">{formatFullDate(event.startsAt)}</p>
                  <p className="text-xs text-slate-500">{formatTimeRange(event.startsAt, event.endsAt)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 rounded-2xl bg-slate-50 p-4">
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-indigo-100 text-indigo-700">
                  <MapPin className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Venue</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">{event.venue}</p>
                  <p className="text-xs text-slate-500">Campus Central Campus Premises</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Ticket Booking Card */}
        <div className="space-y-6">
          <div className="sticky top-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Admission</p>
                <p className="text-2xl font-black text-emerald-600">
                  {event.priceUsd > 0 ? formatPrice(event.priceUsd) : "Free Ticket"}
                </p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                Verified Seat
              </span>
            </div>

            {/* Capacity Meter */}
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-600">Available Capacity</span>
                <span className="text-slate-900">{spotsLeft(event)} seats remaining</span>
              </div>
              <CapacityMeter rate={fillRate(event)} />
              <p className="text-[0.7rem] text-slate-400">
                {event.registered} / {event.capacity} seats reserved so far
              </p>
            </div>

            {/* Booking action button */}
            <div className="mt-6">
              <RegisterButton
                event={event}
                initialRegistration={userRegistration}
              />
            </div>

            {/* Extra perks / note */}
            <div className="mt-6 space-y-3 rounded-2xl bg-slate-50 p-4 text-xs text-slate-500">
              <p className="flex items-center gap-2">
                <Ticket className="size-4 text-indigo-600" />
                Instant confirmation saved to My Tickets
              </p>
              <p className="flex items-center gap-2">
                <Users className="size-4 text-indigo-600" />
                Valid for one registered student seat
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Events Carousel */}
      {related.length > 0 && (
        <section className="border-t border-slate-200 pt-12">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Similar Campus Events You Might Like
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((rel) => (
              <EventCard key={rel.id} event={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
