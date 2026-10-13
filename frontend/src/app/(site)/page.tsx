import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Code2,
  Compass,
  GraduationCap,
  Music,
  PartyPopper,
  Search,
  Sparkles,
  Ticket,
  Trophy,
  Users,
  Wrench,
} from "lucide-react";
import { EventCard } from "@/components/events/event-card";
import { publishedEventsForUi } from "@/lib/event-mapper";
import { allEvents } from "@/lib/events";
import { currentUser } from "@/lib/session";
import { dbService } from "@/lib/db-service";

const CATEGORIES = [
  { name: "Technology", label: "Technical & Coding", icon: Code2, count: "5 Events", color: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100" },
  { name: "Cultural", label: "Cultural & Fests", icon: PartyPopper, count: "4 Events", color: "bg-rose-50 text-rose-600 hover:bg-rose-100" },
  { name: "Workshops", label: "Hands-on Workshops", icon: Wrench, count: "3 Events", color: "bg-amber-50 text-amber-600 hover:bg-amber-100" },
  { name: "Music", label: "Music & Concerts", icon: Music, count: "2 Events", color: "bg-purple-50 text-purple-600 hover:bg-purple-100" },
  { name: "Sports", label: "Sports & Games", icon: Trophy, count: "2 Events", color: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" },
];

export default async function HomePage() {
  let events = await publishedEventsForUi();
  if (!events.length) {
    events = allEvents();
  }

  const user = await currentUser();
  let registeredEventIds: string[] = [];
  if (user && user.role === "STUDENT") {
    const myRegs = await dbService.getStudentRegistrations(user.id);
    registeredEventIds = myRegs.map((r) => r.event?.id || (r as any).eventId);
  }

  const featured = events.slice(0, 3);
  const upcoming = events.slice(3, 9);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-indigo-50/50 via-white to-slate-50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/80 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm">
              <Sparkles className="size-3.5" />
              The Central Campus Ticketing Hub
            </span>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
              Discover Events. <br />
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Create Memories.
              </span>
            </h1>

            <p className="mt-5 text-lg text-slate-600 leading-relaxed sm:text-xl">
              Book verified seats for campus fests, hackathons, guest lectures, and sports tournaments in one tap.
            </p>

            {/* Prominent Search Bar */}
            <div className="mx-auto mt-8 max-w-xl">
              <form
                action="/events"
                method="GET"
                className="relative flex items-center rounded-2xl border border-slate-200 bg-white p-2 shadow-lg shadow-indigo-500/5 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20"
              >
                <Search className="ml-3 size-5 text-slate-400" />
                <input
                  type="text"
                  name="q"
                  placeholder="Search by event title, club or auditorium…"
                  className="w-full bg-transparent px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700"
                >
                  Search
                </button>
              </form>
            </div>

            {/* CTAs & Quick Stats */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/events"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-700 hover:shadow-indigo-600/30"
              >
                Explore All Events
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/login?role=organizer"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50"
              >
                <Users className="size-4 text-slate-500" />
                Host an Event
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="mt-12 grid grid-cols-3 gap-4 border-t border-slate-200/60 pt-8">
              <div>
                <p className="text-2xl font-bold text-slate-900 sm:text-3xl">{events.length}+</p>
                <p className="text-xs font-medium text-slate-500 sm:text-sm">Campus Events</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 sm:text-3xl">100%</p>
                <p className="text-xs font-medium text-slate-500 sm:text-sm">Free Student Entry</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 sm:text-3xl">Instant</p>
                <p className="text-xs font-medium text-slate-500 sm:text-sm">E-Ticket QR Codes</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Discovery */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Browse by Category
            </h2>
            <p className="text-sm text-slate-500">
              Explore activities curated by department, club and interest.
            </p>
          </div>
          <Link
            href="/events"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            View all categories →
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                href={`/events?category=${cat.name}`}
                className={`group flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 p-5 text-center transition-all hover:-translate-y-0.5 hover:shadow-md ${cat.color}`}
              >
                <div className="grid size-12 place-items-center rounded-xl bg-white shadow-sm transition-transform group-hover:scale-110">
                  <Icon className="size-6" />
                </div>
                <h3 className="mt-3 text-sm font-bold text-slate-900">{cat.label}</h3>
                <span className="mt-1 text-xs text-slate-500">{cat.count}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Events */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600">
              <Sparkles className="size-3.5" />
              Editor's Picks
            </span>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Featured Campus Events
            </h2>
          </div>
          <Link
            href="/events?sort=popular"
            className="hidden text-sm font-semibold text-indigo-600 hover:text-indigo-700 sm:block"
          >
            See all featured events →
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              registered={registeredEventIds.includes(event.id)}
            />
          ))}
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600">
              <CalendarDays className="size-3.5" />
              Happening Soon
            </span>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Upcoming Schedule
            </h2>
          </div>
          <Link
            href="/events"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Browse entire calendar →
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {upcoming.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              registered={registeredEventIds.includes(event.id)}
            />
          ))}
        </div>
      </section>

      {/* Organizer Callout Banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-12 text-white shadow-xl sm:px-12 sm:py-16">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300">
              <GraduationCap className="size-4" />
              For Student Clubs & Lab Leads
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Organizing an Event on Campus?
            </h2>
            <p className="mt-3 text-base text-slate-300 leading-relaxed">
              Publish schedules, track real-time attendee reservations, check students in at the entrance, and export attendance reports seamlessly.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                href="/login?role=organizer"
                className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-indigo-500"
              >
                Go to Organizer Studio
              </Link>
              <Link
                href="/dashboard/events/new"
                className="rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
              >
                Create Event Now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
