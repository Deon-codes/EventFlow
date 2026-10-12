import { Compass } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
      <span className="grid size-16 place-items-center rounded-3xl bg-brand-100 text-brand-700 shadow-soft">
        <Compass aria-hidden="true" className="size-7" />
      </span>
      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
        404 · Event not found
      </p>
      <h1 className="mt-3 text-3xl font-bold text-ink-900">
        That event has left the campus
      </h1>
      <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink-500">
        The page you were looking for is not on the schedule. It may have been unpublished by
        its organizer, or the link might be out of date.
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <ButtonLink href="/events">Browse all events</ButtonLink>
        <ButtonLink href="/" variant="secondary">
          Back to discover
        </ButtonLink>
      </div>
    </main>
  );
}
