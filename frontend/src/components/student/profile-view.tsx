"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CircleCheckBig,
  CreditCard,
  GraduationCap,
  LogOut,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Field, Input, Select, Toggle } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { Badge } from "@/components/ui/badge";
import { DEMO_TODAY, formatShortDate } from "@/lib/format";
import type { CampusUser } from "@/types";

const PROGRAMS = [
  "B.Tech Computer Science",
  "B.Tech Electronics",
  "B.Sc Information Systems",
  "B.Des Communication Design",
  "BBA Marketing",
  "B.A Media Studies",
] as const;

const YEARS = ["1st year", "2nd year", "3rd year", "4th year", "5th year"] as const;

export function ProfileView({
  student,
  stats,
}: {
  student: CampusUser;
  stats: { tickets: number; attended: number; registeredAt: string };
}) {
  const router = useRouter();
  const [values, setValues] = useState({
    name: student.name,
    email: student.email,
    phone: student.phone ?? "",
    programme: student.programme,
    year: student.year ?? YEARS[2],
    studentId: student.studentId ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [prefs, setPrefs] = useState({
    reminders: true,
    digest: false,
    waitlist: true,
    organizerDigest: true,
  });

  function update(key: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
    setSaveState("idle");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!values.name.trim()) nextErrors.name = "A display name is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email))
      nextErrors.email = "Enter a valid campus email address.";
    if (values.phone && values.phone.replace(/\D/g, "").length < 7)
      nextErrors.phone = "That phone number looks too short.";
    if (!values.studentId.trim()) nextErrors.studentId = "Your student ID is required.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaveState("saving");
    window.setTimeout(() => setSaveState("saved"), 800);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-6">
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center gap-5 bg-gradient-to-br from-brand-100 via-cream-50 to-white p-6">
            <Avatar name={values.name} tone={student.avatarTone} size="xl" />
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-ink-900">{values.name}</h2>
              <p className="text-sm text-ink-500">
                {values.programme} · {values.year}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge tone="brand" icon={<GraduationCap className="size-3.5" />}>
                  Student account
                </Badge>
                <Badge tone="outline">{values.studentId}</Badge>
              </div>
            </div>
            <div className="ml-auto flex gap-2">
              <Button
                variant={editing ? "ghost" : "secondary"}
                size="sm"
                onClick={() => setEditing((current) => !current)}
              >
                {editing ? "Close editor" : "Edit profile"}
              </Button>
            </div>
          </div>

          <dl className="grid gap-4 border-t border-cream-200 px-6 py-5 sm:grid-cols-3">
            {[
              { label: "Tickets this semester", value: stats.tickets, icon: Sparkles },
              { label: "Events attended", value: stats.attended, icon: CircleCheckBig },
              {
                label: "Member since",
                value: formatShortDate(stats.registeredAt),
                icon: ShieldCheck,
              },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl bg-cream-100 px-4 py-3">
                <item.icon aria-hidden="true" className="size-4 text-brand-600" />
                <dd className="mt-1.5 text-lg font-semibold text-ink-900">{item.value}</dd>
                <dt className="text-xs text-ink-500">{item.label}</dt>
              </div>
            ))}
          </dl>
        </Card>

        {editing ? (
          <Card>
            <CardHeader
              title="Profile details"
              description="Campus records are reconciled nightly with the registrar."
              icon={<User className="size-4" />}
            />
            <form noValidate onSubmit={submit} className="space-y-4 px-5 py-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="profile-name" label="Full name" required error={errors.name}>
                  <Input
                    id="profile-name"
                    value={values.name}
                    invalid={Boolean(errors.name)}
                    onChange={(event) => update("name", event.target.value)}
                  />
                </Field>
                <Field id="profile-email" label="Campus email" required error={errors.email}>
                  <Input
                    id="profile-email"
                    type="email"
                    value={values.email}
                    invalid={Boolean(errors.email)}
                    onChange={(event) => update("email", event.target.value)}
                  />
                </Field>
                <Field id="profile-phone" label="Mobile" error={errors.phone} hint="Used for event reminders.">
                  <Input
                    id="profile-phone"
                    value={values.phone}
                    invalid={Boolean(errors.phone)}
                    onChange={(event) => update("phone", event.target.value)}
                  />
                </Field>
                <Field id="profile-student-id" label="Student ID" required error={errors.studentId}>
                  <Input
                    id="profile-student-id"
                    value={values.studentId}
                    invalid={Boolean(errors.studentId)}
                    onChange={(event) => update("studentId", event.target.value)}
                  />
                </Field>
                <Field id="profile-programme" label="Programme">
                  <Select
                    id="profile-programme"
                    value={values.programme}
                    onChange={(event) => update("programme", event.target.value)}
                  >
                    {[...new Set([values.programme, ...PROGRAMS])].map((programme) => (
                      <option key={programme} value={programme}>
                        {programme}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field id="profile-year" label="Year">
                  <Select
                    id="profile-year"
                    value={values.year}
                    onChange={(event) => update("year", event.target.value)}
                  >
                    {YEARS.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              {saveState === "saved" ? (
                <Notice tone="success" title="Saved in this preview only">
                  Profile changes stay in the browser. When the backend milestone lands, this
                  form will patch <span className="font-mono text-xs">PATCH /api/me</span> and
                  the record will live in Amazon RDS.
                </Notice>
              ) : null}

              <div className="flex flex-wrap gap-3">
                <Button
                  type="submit"
                  loading={saveState === "saving"}
                  icon={<CircleCheckBig className="size-4" />}
                >
                  {saveState === "saving" ? "Saving…" : "Save changes"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setValues({
                      name: student.name,
                      email: student.email,
                      phone: student.phone ?? "",
                      programme: student.programme,
                      year: student.year ?? YEARS[2],
                      studentId: student.studentId ?? "",
                    });
                    setErrors({});
                    setSaveState("idle");
                  }}
                >
                  Reset
                </Button>
              </div>
            </form>
          </Card>
        ) : (
          <Card>
            <CardHeader
              title="Account details"
              description={`Snapshot taken ${formatShortDate(DEMO_TODAY)}`}
              icon={<Mail className="size-4" />}
              action={
                <Badge tone="neutral" dot>
                  Verified
                </Badge>
              }
            />
            <dl className="divide-y divide-cream-200 px-5">
              {[
                { label: "Campus email", value: values.email, icon: Mail, span: false },
                { label: "Mobile", value: values.phone || "Not provided", icon: Phone, span: false },
                { label: "Programme", value: values.programme, icon: GraduationCap, span: true },
                { label: "Year of study", value: values.year, icon: GraduationCap, span: false },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-4 py-3.5"
                >
                  <dt className="inline-flex items-center gap-2 text-sm text-ink-500">
                    <row.icon aria-hidden="true" className="size-4 text-ink-400" />
                    {row.label}
                  </dt>
                  <dd className="text-sm font-medium text-ink-900">{row.value}</dd>
                </div>
              ))}
            </dl>
          </Card>
        )}

        <Card>
          <CardHeader
            title="Notification preferences"
            description="Stored locally for now — no email is sent from this milestone."
            icon={<Bell className="size-4" />}
          />
          <div className="space-y-3 px-5 py-5">
            <Toggle
              id="pref-reminders"
              label="Event reminders"
              description="A nudge 24 hours before each event you hold a ticket for."
              checked={prefs.reminders}
              onChange={(next) => setPrefs((current) => ({ ...current, reminders: next }))}
            />
            <Toggle
              id="pref-waitlist"
              label="Waitlist promotions"
              description="Tell me the moment a full event frees up a seat."
              checked={prefs.waitlist}
              onChange={(next) => setPrefs((current) => ({ ...current, waitlist: next }))}
            />
            <Toggle
              id="pref-digest"
              label="Weekly campus digest"
              description="A Monday summary of new events in my categories."
              checked={prefs.digest}
              onChange={(next) => setPrefs((current) => ({ ...current, digest: next }))}
            />
            <Toggle
              id="pref-organizer"
              label="Organizer broadcast"
              description="Only relevant if I hold organizer access for a club."
              checked={prefs.organizerDigest}
              onChange={(next) => setPrefs((current) => ({ ...current, organizerDigest: next }))}
            />
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader
            title="Account actions"
            description="Switch workspace or leave your account"
            icon={<Users className="size-4" />}
          />
          <div className="space-y-3 px-5 py-5">
            <ButtonLink
              href="/dashboard"
              variant="secondary"
              className="w-full"
              icon={<Sparkles className="size-4" />}
            >
              Open organizer dashboard
            </ButtonLink>
            <ButtonLink
              href="/registrations"
              variant="secondary"
              className="w-full"
              icon={<CreditCard className="size-4" />}
            >
              Review my tickets
            </ButtonLink>
            <Button
              variant="ghost"
              className="w-full text-berry-500 hover:bg-berry-500/10"
              icon={<LogOut className="size-4" />}
              onClick={async () => { const response = await fetch("/api/auth/logout", { method: "POST" }); if (response.ok) router.push("/login"); else setErrors({ session: "Sign-out failed. Please try again." }); }}
            >
              Sign out
            </Button>
            {errors.session ? (
              <Notice tone="danger" className="text-xs">
                {errors.session}
              </Notice>
            ) : null}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Privacy & data"
            description="What EventFlow will store about you"
            icon={<ShieldCheck className="size-4" />}
          />
          <ul className="space-y-3 px-5 py-5 text-sm text-ink-500">
            <li>
              Registration history is stored per student so organizers can reconcile attendance.
            </li>
            <li>
              Uploaded posters and event documents will live in Amazon S3 with per-club
              ownership; profile photos are optional and never required for registration.
            </li>
            <li>
              No secrets, AWS credentials or payment details are handled by this frontend
              milestone.
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
