import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck, ShieldCheck, Ticket, Users } from "lucide-react";
import { AuthForm } from "@/components/auth/auth-form";
import { HeroArt } from "@/components/illustrations/illustrations";
import { BrandLogo } from "@/components/layout/brand-logo";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Kampus as a student or an event organizer.",
};

const HIGHLIGHTS = [
  {
    icon: Ticket,
    title: "One ticket per seat",
    description: "Reserve a seat, keep the code, show it at the door.",
  },
  {
    icon: CalendarCheck,
    title: "Organizer workspace",
    description: "Publish events, watch capacity fill and check attendees in.",
  },
  {
    icon: Users,
    title: "Built for campus clubs",
    description: "Every student club and lab shares the same ticketing desk.",
  },
] as const;

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh flex-col bg-cream-100">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
        <BrandLogo subtitle="Campus ticketing" />
        <Link
          href="/events"
          className="text-sm font-semibold text-ink-500 transition-colors hover:text-ink-900"
        >
          Browse events without signing in
        </Link>
      </header>

      <div className="mx-auto grid w-full max-w-6xl flex-1 items-start gap-8 px-4 pb-12 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <section className="order-2 overflow-hidden rounded-panel border border-cream-200 bg-gradient-to-br from-brand-100 via-cream-50 to-white p-6 shadow-soft lg:order-1 sm:p-8">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-brand-700">
            <ShieldCheck className="size-3.5" />
            Campus IT account
          </p>
          <h2 className="mt-4 text-2xl font-bold leading-tight text-ink-900 sm:text-3xl">
            Ticketing that runs on the campus cloud
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-700">
            Kampus is the Cloud Computing Lab mini-project: one place for students to find
            events and for organizers to fill the room. Login and registration are connected to the server API. Discovery and dashboard views still include sample content.
          </p>

          <div className="mt-6 h-52 sm:h-64">
            <HeroArt />
          </div>

          <ul className="mt-6 space-y-3">
            {HIGHLIGHTS.map((item) => (
              <li key={item.title} className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white text-brand-700 shadow-soft">
                  <item.icon aria-hidden="true" className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink-900">{item.title}</p>
                  <p className="text-xs text-ink-500">{item.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="order-1 lg:order-2">
          <Suspense
            fallback={
              <div className="mx-auto h-[520px] w-full max-w-md animate-pulse rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50" />
            }
          >
            <AuthForm />
          </Suspense>
        </section>
      </div>
    </main>
  );
}
