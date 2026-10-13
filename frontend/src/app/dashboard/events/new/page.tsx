import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CalendarPlus } from "lucide-react";
import { EventForm } from "@/components/dashboard/event-form";
import { Badge } from "@/components/ui/badge";
import { Notice } from "@/components/ui/notice";

export const metadata: Metadata = {
  title: "Create event",
  description: "Draft and publish a new campus event.",
};

export default function CreateEventPage() {
  return (
    <div className="space-y-5">
      <Link
        href="/dashboard/events"
        className="inline-flex items-center gap-2 text-sm font-semibold text-ink-500 transition-colors hover:text-ink-900"
      >
        <ArrowLeft className="size-4" />
        Back to manage events
      </Link>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge tone="brand" icon={<CalendarPlus className="size-3.5" />}>
            New event
          </Badge>
          <h1 className="mt-3 text-2xl font-bold text-ink-900 sm:text-3xl">
            Create a campus event
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-ink-500">
            Fill in the details students need, pick a poster illustration and preview the card
            exactly as it will appear in the discovery feed.
          </p>
        </div>
      </header>

      <Notice tone="info" title="Live event editor">
        Saving or publishing writes to PostgreSQL and requires a signed-in organizer. Poster
        uploads use short-lived private S3 URLs after the event is saved.
      </Notice>

      <EventForm mode="create" />
    </div>
  );
}
