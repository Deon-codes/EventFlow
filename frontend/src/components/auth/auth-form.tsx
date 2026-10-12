"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CircleCheckBig,
  Eye,
  EyeOff,
  GraduationCap,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input, Select, Toggle } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { SegmentedControl } from "@/components/ui/segmented";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

type Mode = "signin" | "signup";
type Errors = Record<string, string>;

const ROLE_OPTIONS = [
  { value: "student" as UserRole, label: "Student" },
  { value: "organizer" as UserRole, label: "Organizer" },
];

const PROGRAMS = [
  "B.Tech Computer Science",
  "B.Tech Electronics",
  "B.Sc Information Systems",
  "B.Des Communication Design",
  "BBA Marketing",
  "B.A Media Studies",
  "Other programme",
] as const;

function validate(
  mode: Mode,
  role: UserRole,
  values: Record<string, string>,
): Errors {
  const errors: Errors = {};
  const email = values.email?.trim() ?? "";

  if (!email) {
    errors.email = "Enter your campus email address.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    errors.email = "That does not look like a valid email address.";
  }

  if (!values.password) {
    errors.password = "Enter your password.";
  } else if (values.password.length < 8) {
    errors.password = "Passwords must be at least 8 characters.";
  }

  if (mode === "signup") {
    if (!values.name?.trim()) errors.name = "Tell us your full name.";
    if (role === "student" && !values.programme) {
      errors.programme = "Select the programme you are enrolled in.";
    }
    if (role === "organizer" && !values.club?.trim()) {
      errors.club = "Enter the club, lab or office you organize for.";
    }
    if (!values.confirm) {
      errors.confirm = "Repeat your password to confirm it.";
    } else if (values.confirm !== values.password) {
      errors.confirm = "The two passwords do not match.";
    }
    if (!values.terms) {
      errors.terms = "Accept the campus IT policy to continue.";
    }
  }

  return errors;
}

export function AuthForm() {
  const [mode, setMode] = useState<Mode>("signin");
  const [role, setRole] = useState<UserRole>("student");
  const [values, setValues] = useState<Record<string, string>>({});
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [showPassword, setShowPassword] = useState(false);

  function update(key: string, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(mode, role, { ...values, terms: terms ? "yes" : "" });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus("loading");
    window.setTimeout(() => setStatus("done"), 900);
  }

  return (
    <div className="rounded-panel border border-cream-200 bg-white p-6 shadow-float sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-ink-900">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </h1>
        <Link
          href="/"
          className="text-sm font-semibold text-brand-700 transition-colors hover:text-brand-600"
        >
          Back to discover
        </Link>
      </div>
      <p className="mt-1 text-sm text-ink-500">
        One campus account for students and organizers — your role decides which workspace
        opens after sign-in.
      </p>

      <div className="mt-6 space-y-5">
        <SegmentedControl
          label="Account action"
          options={[
            { value: "signin" as Mode, label: "Sign in" },
            { value: "signup" as Mode, label: "Create account" },
          ]}
          value={mode}
          onChange={(next) => {
            setMode(next);
            setErrors({});
            setStatus("idle");
          }}
          className="w-full justify-center"
        />

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-500">
            I am signing in as
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {ROLE_OPTIONS.map((option) => {
              const active = role === option.value;
              const Icon = option.value === "student" ? GraduationCap : Users;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setRole(option.value)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors",
                    active
                      ? "border-brand-400 bg-brand-50 text-ink-900"
                      : "border-cream-300 bg-white text-ink-500 hover:border-brand-300",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-8 place-items-center rounded-xl",
                      active ? "bg-brand-500 text-white" : "bg-cream-200 text-ink-500",
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {status === "done" ? (
          <div className="space-y-4 rounded-2xl border border-cream-200 bg-cream-50 p-5">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-leaf-500">
              <CircleCheckBig className="size-4" />
              Form validated — nothing was sent
            </p>
            <p className="text-sm text-ink-700">
              EventFlow has no authentication in this milestone: no credentials were
              transmitted, stored or checked, and no session was created. Sign-in will post to{" "}
              <span className="font-mono text-xs">POST /api/auth/login</span> and issue an
              HttpOnly session cookie once the EC2 + RDS backend exists.
            </p>
            <div className="flex flex-wrap gap-2">
              <ButtonLink href="/" size="sm" variant="secondary">
                Preview student pages
              </ButtonLink>
              <ButtonLink href="/dashboard" size="sm">
                Preview organizer dashboard
              </ButtonLink>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStatus("idle");
              }}
            >
              Edit details
            </Button>
          </div>
        ) : (
          <form noValidate onSubmit={submit} className="space-y-4">
            {Object.keys(errors).length > 0 ? (
              <Notice tone="danger" title="Please fix the highlighted fields">
                <ul className="mt-1 list-disc space-y-1 pl-4">
                  {Object.entries(errors).map(([key, message]) => (
                    <li key={key}>{message}</li>
                  ))}
                </ul>
              </Notice>
            ) : null}

            {mode === "signup" ? (
              <Field id="name" label="Full name" required error={errors.name}>
                <Input
                  id="name"
                  name="name"
                  autoComplete="name"
                  placeholder="Maya Rodrigues"
                  value={values.name ?? ""}
                  invalid={Boolean(errors.name)}
                  onChange={(event) => update("name", event.target.value)}
                />
              </Field>
            ) : null}

            <Field
              id="email"
              label="Campus email"
              required
              error={errors.email}
              hint={mode === "signup" ? "Use your @campus.edu address to verify you are enrolled." : undefined}
            >
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@campus.edu"
                value={values.email ?? ""}
                invalid={Boolean(errors.email)}
                onChange={(event) => update("email", event.target.value)}
              />
            </Field>

            {mode === "signup" && role === "student" ? (
              <Field id="programme" label="Programme" required error={errors.programme}>
                <Select
                  id="programme"
                  value={values.programme ?? ""}
                  invalid={Boolean(errors.programme)}
                  onChange={(event) => update("programme", event.target.value)}
                >
                  <option value="">Select your programme</option>
                  {PROGRAMS.map((programme) => (
                    <option key={programme} value={programme}>
                      {programme}
                    </option>
                  ))}
                </Select>
              </Field>
            ) : null}

            {mode === "signup" && role === "organizer" ? (
              <Field
                id="club"
                label="Club, lab or office"
                required
                error={errors.club}
                hint="Organizer access is granted per club by the Student Activities Office."
              >
                <Input
                  id="club"
                  placeholder="Design Collective"
                  value={values.club ?? ""}
                  invalid={Boolean(errors.club)}
                  onChange={(event) => update("club", event.target.value)}
                />
              </Field>
            ) : null}

            <Field
              id="password"
              label="Password"
              required
              error={errors.password}
              hint={mode === "signup" ? "Minimum 8 characters." : undefined}
              action={
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-ink-500 hover:text-ink-900"
                >
                  {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  {showPassword ? "Hide" : "Show"}
                </button>
              }
            >
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                placeholder="••••••••"
                value={values.password ?? ""}
                invalid={Boolean(errors.password)}
                onChange={(event) => update("password", event.target.value)}
              />
            </Field>

            {mode === "signup" ? (
              <>
                <Field id="confirm" label="Confirm password" required error={errors.confirm}>
                  <Input
                    id="confirm"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={values.confirm ?? ""}
                    invalid={Boolean(errors.confirm)}
                    onChange={(event) => update("confirm", event.target.value)}
                  />
                </Field>

                <div>
                  <Toggle
                    id="terms"
                    label="Accept the campus IT usage policy"
                    description="EventFlow stores only your registration history and never shares it with third parties."
                    checked={terms}
                    onChange={(next) => {
                      setTerms(next);
                      setErrors((current) => {
                        if (!current.terms) return current;
                        const copy = { ...current };
                        delete copy.terms;
                        return copy;
                      });
                    }}
                  />
                  {errors.terms ? (
                    <p role="alert" className="mt-1.5 text-xs font-medium text-berry-500">
                      {errors.terms}
                    </p>
                  ) : null}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between text-sm">
                <span
                  className="cursor-not-allowed text-ink-400"
                  title="Password reset arrives with the backend milestone"
                >
                  Forgot password?
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-leaf-500">
                  <ShieldCheck className="size-3.5" />
                  Campus SSO planned
                </span>
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              loading={status === "loading"}
              icon={<ArrowRight className="size-4" />}
            >
              {status === "loading"
                ? "Validating…"
                : mode === "signin"
                  ? `Sign in as ${role}`
                  : "Create account"}
            </Button>
          </form>
        )}

        <Notice tone="warning" className="text-xs">
          <span className="font-semibold">No fake login.</span> This form only checks the fields
          above in your browser. Role permissions are not enforced here and must never be relied
          on until the server-side auth milestone ships.
        </Notice>
      </div>
    </div>
  );
}
