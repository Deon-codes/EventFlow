"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  CalendarPlus,
  CircleCheckBig,
  Copy,
  Eye,
  ImagePlus,
  Save,
  Send,
  Upload,
} from "lucide-react";
import { EventCard } from "@/components/events/event-card";
import {
  EventPoster,
  POSTER_ART_LABELS,
  POSTER_ART_OPTIONS,
} from "@/components/events/event-poster";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Field, Input, Select, Textarea, Toggle } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { DEMO_TODAY, addDays, dateInputValue, timeInputValue } from "@/lib/format";
import { cn } from "@/lib/utils";
import { EVENT_CATEGORIES, type CampusEvent, type EventCategory, type PosterArt } from "@/types";

type Mode = "create" | "edit";

interface FormValues {
  title: string;
  summary: string;
  description: string;
  category: EventCategory;
  date: string;
  startTime: string;
  endTime: string;
  closesDate: string;
  venue: string;
  building: string;
  isOnline: boolean;
  capacity: string;
  price: string;
  tags: string;
  posterArt: PosterArt;
}

function initialValues(event?: CampusEvent): FormValues {
  if (event) {
    return {
      title: event.title,
      summary: event.summary,
      description: event.description.join("\n\n"),
      category: event.category,
      date: dateInputValue(event.startsAt),
      startTime: timeInputValue(event.startsAt),
      endTime: timeInputValue(event.endsAt),
      closesDate: dateInputValue(event.registrationClosesAt),
      venue: event.venue,
      building: event.building ?? "",
      isOnline: event.isOnline,
      capacity: String(event.capacity),
      price: String(event.priceUsd),
      tags: event.tags.join(", "),
      posterArt: event.posterArt,
    };
  }

  return {
    title: "",
    summary: "",
    description: "",
    category: "Technology",
    date: dateInputValue(addDays(DEMO_TODAY, 14)),
    startTime: "10:00",
    endTime: "13:00",
    closesDate: dateInputValue(addDays(DEMO_TODAY, 12)),
    venue: "",
    building: "",
    isOnline: false,
    capacity: "60",
    price: "0",
    tags: "",
    posterArt: "tech",
  };
}

function validate(values: FormValues): Record<string, string> {
  const errors: Record<string, string> = {};

  if (values.title.trim().length < 5) {
    errors.title = "Give the event a descriptive title (at least 5 characters).";
  }
  if (values.summary.trim().length < 20) {
    errors.summary = "Write a one-line teaser of at least 20 characters.";
  }
  if (values.description.trim().length < 40) {
    errors.description = "Describe the event in at least 40 characters.";
  }
  if (!values.date) {
    errors.date = "Pick the event date.";
  } else if (values.date < dateInputValue(DEMO_TODAY)) {
    errors.date = "Choose today or a future date.";
  }
  if (!values.startTime || !values.endTime) {
    errors.endTime = "Set both the start and end time.";
  } else if (values.endTime <= values.startTime) {
    errors.endTime = "The end time must be after the start time.";
  }
  if (values.closesDate && values.closesDate > values.date) {
    errors.closesDate = "Registration should close on or before the event date.";
  }
  if (!values.venue.trim()) {
    errors.venue = "Where is it happening?";
  }

  const capacity = Number(values.capacity);
  if (!Number.isInteger(capacity) || capacity < 1) {
    errors.capacity = "Capacity must be a whole number of at least 1.";
  } else if (capacity > 5000) {
    errors.capacity = "Split events above 5,000 seats into sessions.";
  }

  const price = Number(values.price);
  if (Number.isNaN(price) || price < 0) {
    errors.price = "Enter a price of 0 or more (0 means free).";
  }

  return errors;
}

export function EventForm({ mode, event }: { mode: Mode; event?: CampusEvent }) {
  const [values, setValues] = useState<FormValues>(() => initialValues(event));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<null | "draft" | "publish">(null);
  const [result, setResult] = useState<null | { status: "draft" | "published"; at: string }>(
    null,
  );
  const pendingAction = useRef<"draft" | "publish">("publish");

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key as string]) return current;
      const next = { ...current };
      delete next[key as string];
      return next;
    });
  }

  const startsAt = `${values.date}T${values.startTime}:00`;
  const endsAt = `${values.date}T${values.endTime}:00`;
  const closesAt = `${values.closesDate || values.date}T20:00:00`;

  const previewEvent: CampusEvent = useMemo(
    () => ({
      id: event?.id ?? "preview",
      title: values.title.trim() || "Untitled campus event",
      summary:
        values.summary.trim() ||
        "Add a short teaser so students know what to expect from this event.",
      description: [values.description.trim() || "Event description goes here."],
      category: values.category,
      status: "published",
      startsAt,
      endsAt,
      registrationClosesAt: closesAt,
      venue: values.venue.trim() || "Venue to be confirmed",
      building: values.building.trim() || undefined,
      isOnline: values.isOnline,
      capacity: Number(values.capacity) > 0 ? Number(values.capacity) : 50,
      registered: event?.registered ?? 0,
      waitlisted: event?.waitlisted ?? 0,
      priceUsd: Number(values.price) > 0 ? Number(values.price) : 0,
      organizerId: event?.organizerId ?? "org-201",
      tags: values.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      featured: false,
      posterUrl: event?.posterUrl,
      posterArt: values.posterArt,
      createdAt: event?.createdAt ?? DEMO_TODAY,
      highlights: [],
    }),
    [closesAt, endsAt, event, startsAt, values],
  );

  function submit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    const action = pendingAction.current;
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setResult(null);
      return;
    }

    setSubmitting(action);
    window.setTimeout(() => {
      setSubmitting(null);
      setResult({
        status: action === "publish" ? "published" : "draft",
        at: DEMO_TODAY,
      });
    }, 900);
  }

  const errorCount = Object.keys(errors).length;

  return (
    <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
      <div className="space-y-6">
        <form noValidate onSubmit={submit} className="space-y-6">
          <Card>
            <CardHeader
              title="Event basics"
              description="What students see first in the discovery feed"
              icon={<CalendarPlus className="size-4" />}
            />
            <div className="space-y-4 px-5 py-5">
              <Field id="event-title" label="Event title" required error={errors.title}>
                <Input
                  id="event-title"
                  value={values.title}
                  invalid={Boolean(errors.title)}
                  placeholder="Campus Hack Night 2026"
                  onChange={(changed) => update("title", changed.target.value)}
                />
              </Field>

              <Field
                id="event-summary"
                label="Short teaser"
                required
                error={errors.summary}
                hint="One sentence shown on event cards."
              >
                <Input
                  id="event-summary"
                  value={values.summary}
                  invalid={Boolean(errors.summary)}
                  placeholder="An overnight build sprint for student teams shipping campus tools."
                  onChange={(changed) => update("summary", changed.target.value)}
                />
              </Field>

              <Field
                id="event-description"
                label="Full description"
                required
                error={errors.description}
                hint="Separate paragraphs with a blank line."
              >
                <Textarea
                  id="event-description"
                  value={values.description}
                  invalid={Boolean(errors.description)}
                  placeholder="What happens, who should come and what they should bring."
                  onChange={(changed) => update("description", changed.target.value)}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="event-category" label="Category" required>
                  <Select
                    id="event-category"
                    value={values.category}
                    onChange={(changed) =>
                      update("category", changed.target.value as EventCategory)
                    }
                  >
                    {EVENT_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field id="event-tags" label="Tags" hint="Comma separated, e.g. Cloud, Beginner friendly">
                  <Input
                    id="event-tags"
                    value={values.tags}
                    onChange={(changed) => update("tags", changed.target.value)}
                  />
                </Field>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Schedule & location"
              description="Times are campus local time"
              icon={<Copy className="size-4" />}
            />
            <div className="space-y-4 px-5 py-5">
              <div className="grid gap-4 sm:grid-cols-3">
                <Field id="event-date" label="Event date" required error={errors.date}>
                  <Input
                    id="event-date"
                    type="date"
                    value={values.date}
                    invalid={Boolean(errors.date)}
                    onChange={(changed) => update("date", changed.target.value)}
                  />
                </Field>
                <Field id="event-start" label="Start time" required>
                  <Input
                    id="event-start"
                    type="time"
                    value={values.startTime}
                    onChange={(changed) => update("startTime", changed.target.value)}
                  />
                </Field>
                <Field
                  id="event-end"
                  label="End time"
                  required
                  error={errors.endTime}
                  hint="Overnight events are supported."
                >
                  <Input
                    id="event-end"
                    type="time"
                    value={values.endTime}
                    invalid={Boolean(errors.endTime)}
                    onChange={(changed) => update("endTime", changed.target.value)}
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="event-venue" label="Venue" required error={errors.venue}>
                  <Input
                    id="event-venue"
                    value={values.venue}
                    invalid={Boolean(errors.venue)}
                    placeholder="Innovation Hub, Level 2"
                    onChange={(changed) => update("venue", changed.target.value)}
                  />
                </Field>
                <Field id="event-building" label="Building or area">
                  <Input
                    id="event-building"
                    value={values.building}
                    placeholder="Engineering Block E"
                    onChange={(changed) => update("building", changed.target.value)}
                  />
                </Field>
              </div>

              <Toggle
                id="event-online"
                label="Offer an online stream"
                description="Remote attendees receive a stream link by email."
                checked={values.isOnline}
                onChange={(next) => update("isOnline", next)}
              />

              <div className="grid gap-4 sm:grid-cols-3">
                <Field
                  id="event-capacity"
                  label="Capacity"
                  required
                  error={errors.capacity}
                  hint="Maximum seats including waitlist promotions."
                >
                  <Input
                    id="event-capacity"
                    type="number"
                    min={1}
                    value={values.capacity}
                    invalid={Boolean(errors.capacity)}
                    onChange={(changed) => update("capacity", changed.target.value)}
                  />
                </Field>
                <Field
                  id="event-price"
                  label="Ticket price (USD)"
                  error={errors.price}
                  hint="0 makes the event free."
                >
                  <Input
                    id="event-price"
                    type="number"
                    min={0}
                    step="0.5"
                    value={values.price}
                    invalid={Boolean(errors.price)}
                    onChange={(changed) => update("price", changed.target.value)}
                  />
                </Field>
                <Field
                  id="event-closes"
                  label="Registration closes"
                  error={errors.closesDate}
                >
                  <Input
                    id="event-closes"
                    type="date"
                    value={values.closesDate}
                    invalid={Boolean(errors.closesDate)}
                    onChange={(changed) => update("closesDate", changed.target.value)}
                  />
                </Field>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Poster"
              description="Pick an illustration now; S3 upload lands with the backend milestone"
              icon={<ImagePlus className="size-4" />}
            />
            <div className="space-y-4 px-5 py-5">
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {POSTER_ART_OPTIONS.map((art) => {
                  const selected = values.posterArt === art;
                  return (
                    <li key={art}>
                      <button
                        type="button"
                        aria-pressed={selected}
                        onClick={() => update("posterArt", art)}
                        className={cn(
                          "w-full rounded-2xl border-2 p-1.5 text-left transition-colors",
                          selected
                            ? "border-brand-500 bg-brand-50"
                            : "border-transparent hover:border-cream-300",
                        )}
                      >
                        <EventPoster
                          event={{ category: values.category, posterArt: art, title: values.title }}
                          showWordmark={false}
                          className="aspect-[4/3] w-full"
                        />
                        <span className="mt-1.5 block px-1 text-xs font-semibold text-ink-700">
                          {POSTER_ART_LABELS[art]}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-cream-400 bg-cream-50 px-4 py-3">
                <span className="grid size-10 place-items-center rounded-2xl bg-white text-ink-400">
                  <Upload aria-hidden="true" className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink-900">Upload a poster</p>
                  <p className="text-xs text-ink-500">
                    Available after the Amazon S3 integration — posters will upload straight from
                    the organizer workspace.
                  </p>
                </div>
                <Button variant="secondary" size="sm" disabled icon={<Upload className="size-3.5" />}>
                  Upload (soon)
                </Button>
              </div>
            </div>
          </Card>

          {errorCount > 0 ? (
            <Notice tone="danger" title={`${errorCount} field${errorCount === 1 ? "" : "s"} need attention`}>
              <ul className="mt-1 list-disc space-y-1 pl-4">
                {Object.entries(errors).map(([key, message]) => (
                  <li key={key}>{message}</li>
                ))}
              </ul>
            </Notice>
          ) : null}

          {result ? (
            <Notice
              tone="success"
              title={
                result.status === "published"
                  ? "Publish request prepared (nothing was sent)"
                  : "Draft staged in this browser only"
              }
            >
              <p>
                EventFlow has no API yet, so this form did not save anything. In the AWS
                milestone it will POST the payload below to{" "}
                <span className="font-mono text-xs">/api/events</span>, store the record in
                Amazon RDS and upload the poster to Amazon S3.
              </p>
              <dl className="mt-3 grid gap-1.5 text-xs sm:grid-cols-2">
                {[
                  ["Title", values.title],
                  ["Category", values.category],
                  ["Starts", startsAt.replace("T", " · ")],
                  ["Ends", endsAt.replace("T", " · ")],
                  ["Venue", `${values.venue}${values.building ? `, ${values.building}` : ""}`],
                  ["Capacity", `${values.capacity} seats`],
                  ["Price", Number(values.price) > 0 ? `$${values.price}` : "Free"],
                  ["Status", result.status],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-3 rounded-xl bg-white/70 px-3 py-1.5">
                    <dt className="font-semibold text-ink-500">{label}</dt>
                    <dd className="truncate text-ink-900">{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-3 flex flex-wrap gap-2">
                <ButtonLink href="/dashboard/events" size="sm" variant="secondary">
                  Back to manage events
                </ButtonLink>
                {mode === "create" ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setValues(initialValues());
                      setResult(null);
                    }}
                  >
                    Start another event
                  </Button>
                ) : (
                  <ButtonLink href={`/events/${event?.id}`} size="sm" variant="ghost">
                    View public page
                  </ButtonLink>
                )}
              </div>
            </Notice>
          ) : null}

          <div className="flex flex-wrap items-center gap-3 rounded-card border border-cream-200 bg-white p-4 shadow-soft">
            <Button
              type="submit"
              size="lg"
              loading={submitting === "publish"}
              icon={<Send className="size-4" />}
              onClick={() => {
                pendingAction.current = "publish";
              }}
            >
              Publish event
            </Button>
            <Button
              type="submit"
              size="lg"
              variant="secondary"
              loading={submitting === "draft"}
              icon={<Save className="size-4" />}
              onClick={() => {
                pendingAction.current = "draft";
              }}
            >
              Save as draft
            </Button>
            <p className="text-xs text-ink-500">
              Both actions validate the form; publishing additionally requires a future date and
              a venue.
            </p>
          </div>
        </form>
      </div>

      <div className="space-y-4 xl:sticky xl:top-24 xl:self-start">
        <Card>
          <CardHeader
            title="Live card preview"
            description="Exactly how this event renders in the discovery feed"
            icon={<Eye className="size-4" />}
            action={
              <Badge tone="brand" icon={<CircleCheckBig className="size-3.5" />}>
                Preview
              </Badge>
            }
          />
          <div className="px-5 py-5">
            <EventCard event={previewEvent} />
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Publishing checklist"
            description="Validated in the browser before anything is sent"
            icon={<Save className="size-4" />}
          />
          <ul className="space-y-2.5 px-5 py-5 text-sm">
            {[
              { label: "Title and teaser", done: !errors.title && !errors.summary },
              { label: "Description", done: !errors.description },
              { label: "Date and times", done: !errors.date && !errors.endTime },
              { label: "Venue", done: !errors.venue },
              { label: "Capacity and price", done: !errors.capacity && !errors.price },
              { label: "Poster illustration", done: Boolean(values.posterArt) },
            ].map((item) => (
              <li key={item.label} className="flex items-center gap-2.5">
                <span
                  className={cn(
                    "grid size-5 place-items-center rounded-full text-white",
                    item.done ? "bg-leaf-500" : "bg-cream-300",
                  )}
                >
                  {item.done ? <CircleCheckBig className="size-3" /> : null}
                </span>
                <span className={item.done ? "text-ink-700" : "text-ink-400"}>{item.label}</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-cream-200 px-5 py-4">
            <Link
              href="/dashboard/attendees"
              className="text-xs font-semibold text-brand-700 hover:text-brand-600"
            >
              Looking for attendee management?
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
