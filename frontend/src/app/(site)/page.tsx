import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarCheck,
  CalendarDays,
  Compass,
  PartyPopper,
  Ticket,
  TrendingUp,
  Users,
} from "lucide-react";
import { EventCard } from "@/components/events/event-card";
import { EventListItem } from "@/components/events/event-list-item";
import { HeroSearch } from "@/components/events/hero-search";
import { HeroArt } from "@/components/illustrations/illustrations";
import { StudentRail } from "@/components/layout/student-rail";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, SectionHeading } from "@/components/ui/card";
import {
  categoryTone,
  featuredEvents,
  registrationsForStudent,
  upcomingEvents,
} from "@/lib/events";
import { CURRENT_STUDENT, ORGANIZER_PROFILES } from "@/lib/mock-data";
import { formatMonthDay } from "@/lib/format";
import { EVENT_CATEGORIES } from "@/types";

const STEPS = [
  {
    title: "Discover",
    description:
      "Filter the campus feed by category, date and availability to find events that fit your week.",
    icon: Compass,
  },
  {
    title: "Reserve",
    description:
      "Claim a seat in one tap. Full events offer a waitlist so you never lose your place in line.",
    icon: Ticket,
  },
  {
    title: "Show up",
    description:
      "Your ticket code lives in My tickets. Organizers scan it at the door and track attendance.",
    icon: CalendarCheck,
  },
] as const;

export default function DiscoverPage() {
  const upcoming = upcomingEvents();
  const featured = featuredEvents();
  const soon = upcoming.slice(0, 4);
  const myRegistrations = registrationsForStudent(CURRENT_STUDENT.id);
  const registeredIds = new Set(myRegistrations.map((entry) => entry.eventId));
  const totalRegistrations = upcoming.reduce((total, event) => total + event.registered, 0);

  const categoryCounts = EVENT_CATEGORIES.map((category) => ({
    category,
    count: upcoming.filter((event) => event.category === category).length,
  })).filter((entry) => entry.count > 0);

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-panel border border-cream-200 bg-gradient-to-br from-brand-100 via-cream-50 to-white p-6 shadow-soft sm:p-8 lg:p-10">
        <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <Badge tone="brand" icon={<PartyPopper className="size-3.5" />}>
              Fall 2026 semester is live
            </Badge>
            <h1 className="mt-4 text-balance text-3xl font-bold leading-tight text-ink-900 sm:text-4xl lg:text-[2.7rem]">
              Every campus event, <span className="text-brand-600">one ticket</span> away.
            </h1>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-ink-700">
              EventFlow is the cloud ticketing desk for our campus. Students discover and
              reserve seats in seconds; clubs and labs publish, manage and fill their events
              from a single organizer dashboard.
            </p>

            <div className="mt-6">
              <HeroSearch />
            </div>

            <dl className="mt-6 grid grid-cols-3 gap-3 sm:max-w-lg">
              {[
                { label: "Upcoming events", value: upcoming.length, icon: CalendarDays },
                { label: "Seats reserved", value: totalRegistrations, icon: Users },
                { label: "Active clubs", value: ORGANIZER_PROFILES.length, icon: TrendingUp },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-cream-200 bg-white/80 px-4 py-3"
                >
                  <stat.icon aria-hidden="true" className="size-4 text-brand-600" />
                  <dd className="mt-1.5 text-xl font-semibold text-ink-900">{stat.value}</dd>
                  <dt className="text-[0.7rem] font-medium text-ink-500">{stat.label}</dt>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <div className="rounded-[2.25rem] bg-white/70 p-4 shadow-soft ring-1 ring-white">
              <div className="h-64 sm:h-80">
                <HeroArt />
              </div>
            </div>
            <div className="absolute -bottom-3 left-4 hidden rounded-2xl border border-cream-200 bg-white px-4 py-3 shadow-float sm:block">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-ink-400">
                Next up
              </p>
              <p className="text-sm font-semibold text-ink-900">
                {upcoming[0]?.title ?? "No events scheduled"}
              </p>
              <p className="text-xs text-ink-500">
                {upcoming[0]
                  ? `${formatMonthDay(upcoming[0].startsAt)} · ${upcoming[0].venue}`
                  : "Check back soon"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-6 xl:flex-row">
        <div className="min-w-0 flex-1 space-y-8">
          <section className="space-y-4">
            <SectionHeading
              eyebrow="Editor's picks"
              title="Featured this month"
              description="Flagship events organizers are pushing to the whole campus."
              action={
                <ButtonLink
                  href="/events?sort=popular"
                  variant="secondary"
                  size="sm"
                  icon={<ArrowRight className="size-4" />}
                >
                  View all events
                </ButtonLink>
              }
            />
            <ul className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
              {featured.map((event) => (
                <li key={event.id} className="h-full">
                  <EventCard event={event} registered={registeredIds.has(event.id)} />
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-4">
            <SectionHeading
              eyebrow="Browse by interest"
              title="Find your crowd"
              description="Jump straight into the categories with the most registrations this month."
            />
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {categoryCounts.map(({ category, count }) => {
                const tone = categoryTone(category);
                return (
                  <li key={category}>
                    <Link
                      href={`/events?category=${encodeURIComponent(category)}`}
                      className="flex h-full flex-col justify-between rounded-2xl border border-cream-200 bg-white p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-float"
                    >
                      <span
                        className="grid size-9 place-items-center rounded-xl"
                        style={{ backgroundColor: tone.poster.bg, color: tone.poster.ink }}
                      >
                        <Compass className="size-4" />
                      </span>
                      <span className="mt-3 text-sm font-semibold text-ink-900">
                        {category}
                      </span>
                      <span className="text-xs text-ink-500">{count} upcoming</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="space-y-4">
            <SectionHeading
              eyebrow="Happening soon"
              title="Next on campus"
              description="The next four events on the calendar, closest first."
              action={
                <Link
                  href="/events"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-600"
                >
                  See the full calendar
                  <ArrowUpRight className="size-4" />
                </Link>
              }
            />
            <ul className="space-y-4">
              {soon.map((event) => (
                <li key={event.id}>
                  <EventListItem event={event} registered={registeredIds.has(event.id)} />
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-4">
            <SectionHeading
              eyebrow="How it works"
              title="From discovery to the door"
              description="The same flow works on a phone queue and on the projector at check-in."
            />
            <ul className="grid gap-4 sm:grid-cols-3">
              {STEPS.map((step, index) => (
                <li key={step.title}>
                  <Card className="h-full p-5">
                    <span className="grid size-11 place-items-center rounded-2xl bg-brand-100 text-brand-700">
                      <step.icon aria-hidden="true" className="size-5" />
                    </span>
                    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-ink-400">
                      Step {index + 1}
                    </p>
                    <h3 className="mt-1 text-base font-semibold text-ink-900">{step.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-500">
                      {step.description}
                    </p>
                  </Card>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <StudentRail />
      </div>
    </div>
  );
}
