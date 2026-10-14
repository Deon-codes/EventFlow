"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  Sparkles,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Mode = "signin" | "signup";
type Role = "student" | "organizer";

export function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");

  const queryMode = searchParams.get("mode") === "signup" ? "signup" : "signin";
  const queryRole = searchParams.get("role") === "organizer" ? "organizer" : "student";

  const [userMode, setUserMode] = useState<Mode | null>(null);
  const [userRole, setUserRole] = useState<Role | null>(null);

  const mode = userMode ?? queryMode;
  const role = userRole ?? queryRole;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [terms, setTerms] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function fillDemo(demoRole: "student" | "organizer") {
    setUserMode("signin");
    setUserRole(demoRole);
    if (demoRole === "student") {
      setEmail("maya.rodrigues@campus.edu");
      setPassword("Student@123");
    } else {
      setEmail("organizer@campus.edu");
      setPassword("Organizer@123");
    }
    setErrors({});
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    if (!email.trim()) {
      nextErrors.email = "Please enter your campus email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      nextErrors.password = "Please enter your password.";
    } else if (password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    if (mode === "signup") {
      if (!name.trim()) {
        nextErrors.name = "Please enter your full name.";
      }
      if (password !== confirmPassword) {
        nextErrors.confirmPassword = "Passwords do not match.";
      }
      if (!terms) {
        nextErrors.terms = "You must agree to the campus ticketing terms.";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const endpoint = mode === "signup" ? "/api/auth/signup" : "/api/auth/login";
      const payload =
        mode === "signup"
          ? { name: name.trim(), email: email.trim(), password, role }
          : { email: email.trim(), password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrors({ form: data.error || "Authentication failed. Please try again." });
        setLoading(false);
        return;
      }

      // Success: Route to correct dashboard or redirect URL based on role
      const userRole = data.user?.role;
      let target: string;
      if (userRole === "ORGANIZER" || userRole === "ADMIN") {
        target = redirectUrl && redirectUrl.startsWith("/dashboard") ? redirectUrl : "/dashboard";
      } else {
        target = redirectUrl && !redirectUrl.startsWith("/dashboard") ? redirectUrl : "/registrations";
      }

      router.refresh();
      router.replace(target);
    } catch {
      setErrors({ form: "Could not connect to the server. Please check your connection." });
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl shadow-slate-200/50">
      {/* Tab Switcher: Sign In vs Sign Up */}
      <div className="grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => {
            setUserMode("signin");
            setErrors({});
          }}
          className={cn(
            "rounded-xl py-2.5 text-xs font-bold transition-all",
            mode === "signin"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          )}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setUserMode("signup");
            setErrors({});
          }}
          className={cn(
            "rounded-xl py-2.5 text-xs font-bold transition-all",
            mode === "signup"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          )}
        >
          Create Account
        </button>
      </div>

      {/* Role Picker */}
      <div className="mt-6">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
          I am signing in as
        </label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setUserRole("student")}
            className={cn(
              "flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition-all",
              role === "student"
                ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            )}
          >
            <GraduationCap className="size-4" />
            Student
          </button>
          <button
            type="button"
            onClick={() => setUserRole("organizer")}
            className={cn(
              "flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition-all",
              role === "organizer"
                ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            )}
          >
            <Users className="size-4" />
            Organizer
          </button>
        </div>
      </div>

      {/* Demo Credentials Helper Chips */}
      <div className="mt-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 p-3">
        <p className="flex items-center gap-1.5 text-[0.7rem] font-bold text-indigo-800 uppercase tracking-wider">
          <Sparkles className="size-3" /> Quick Demo One-Click Login
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => fillDemo("student")}
            className="rounded-lg bg-white border border-indigo-200 px-2.5 py-1 text-[0.7rem] font-bold text-indigo-700 hover:bg-indigo-100 transition-colors shadow-2xs"
          >
            Student Account
          </button>
          <button
            type="button"
            onClick={() => fillDemo("organizer")}
            className="rounded-lg bg-white border border-indigo-200 px-2.5 py-1 text-[0.7rem] font-bold text-indigo-700 hover:bg-indigo-100 transition-colors shadow-2xs"
          >
            Organizer Account
          </button>
        </div>
      </div>

      {/* Form Error Banner */}
      {errors.form && (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
          {errors.form}
        </div>
      )}

      {/* Main Auth Form */}
      <form noValidate onSubmit={handleSubmit} className="mt-5 space-y-4">
        {mode === "signup" && (
          <div>
            <label className="block text-xs font-bold text-slate-700">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Maya Rodrigues"
              className={cn(
                "mt-1.5 h-11 w-full rounded-xl border bg-slate-50 px-3.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2",
                errors.name
                  ? "border-rose-300 focus:ring-rose-500/20"
                  : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20"
              )}
            />
            {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700">Campus Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@campus.edu"
            className={cn(
              "mt-1.5 h-11 w-full rounded-xl border bg-slate-50 px-3.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2",
              errors.email
                ? "border-rose-300 focus:ring-rose-500/20"
                : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20"
            )}
          />
          {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-700">Password</label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="flex items-center gap-1 text-[0.7rem] font-semibold text-slate-500 hover:text-slate-800"
            >
              {showPassword ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={cn(
              "mt-1.5 h-11 w-full rounded-xl border bg-slate-50 px-3.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2",
              errors.password
                ? "border-rose-300 focus:ring-rose-500/20"
                : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20"
            )}
          />
          {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password}</p>}
        </div>

        {mode === "signup" && (
          <div>
            <label className="block text-xs font-bold text-slate-700">Confirm Password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className={cn(
                "mt-1.5 h-11 w-full rounded-xl border bg-slate-50 px-3.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2",
                errors.confirmPassword
                  ? "border-rose-300 focus:ring-rose-500/20"
                  : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20"
              )}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-rose-600">{errors.confirmPassword}</p>
            )}

            <div className="mt-3 flex items-start gap-2">
              <input
                id="terms-check"
                type="checkbox"
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="terms-check" className="text-xs text-slate-600">
                I agree to the campus event ticketing usage guidelines and code of conduct.
              </label>
            </div>
            {errors.terms && <p className="mt-1 text-xs text-rose-600">{errors.terms}</p>}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-700 hover:shadow-indigo-600/30 disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {mode === "signin" ? "Signing In…" : "Creating Account…"}
            </>
          ) : (
            <>
              {mode === "signin" ? `Sign In as ${role}` : `Register as ${role}`}
              <ArrowRight className="size-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
