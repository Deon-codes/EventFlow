"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  CalendarDays,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Sparkles,
  Ticket,
  User,
  X,
} from "lucide-react";
import { BrandLogo } from "@/components/layout/brand-logo";
import { cn } from "@/lib/utils";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "ORGANIZER" | "ADMIN";
};

export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (mounted && data?.user) {
          setUser(data.user);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [pathname]);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setUserDropdownOpen(false);
      router.refresh();
      router.push("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }

  function submitSearch(value: string) {
    const trimmed = value.trim();
    router.push(trimmed ? `/events?q=${encodeURIComponent(trimmed)}` : "/events");
    setDrawerOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Left: Brand & Main Navigation */}
        <div className="flex items-center gap-8">
          <BrandLogo subtitle="Campus Tickets" />

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
            <Link
              href="/"
              className={cn(
                "rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors",
                pathname === "/"
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              Home
            </Link>
            <Link
              href="/events"
              className={cn(
                "rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors",
                pathname.startsWith("/events")
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              Explore Events
            </Link>
            {user && (user.role === "ORGANIZER" || user.role === "ADMIN") ? (
              <Link
                href="/dashboard"
                className={cn(
                  "rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors",
                  pathname.startsWith("/dashboard")
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href={user ? "/registrations" : "/login?redirect=/registrations"}
                className={cn(
                  "rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors",
                  pathname === "/registrations"
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                My Tickets
              </Link>
            )}
          </nav>
        </div>

        {/* Center: Search Bar */}
        <div className="hidden max-w-md flex-1 lg:block">
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              submitSearch(query);
            }}
            className="relative"
          >
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search events, workshops, fests…"
              className="h-10 w-full rounded-full border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </form>
        </div>

        {/* Right: Actions / Auth Menu */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-slate-50 py-1.5 pl-2 pr-3 text-sm font-semibold text-slate-800 transition-all hover:border-slate-300 hover:bg-slate-100"
              >
                <span className="grid size-7 place-items-center rounded-full bg-indigo-600 text-xs font-bold text-white uppercase">
                  {user.name.charAt(0)}
                </span>
                <span className="hidden max-w-[120px] truncate sm:inline-block">
                  {user.name.split(" ")[0]}
                </span>
                <ChevronDown className="size-3.5 text-slate-500" />
              </button>

              {userDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserDropdownOpen(false)}
                  />
                  <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in slide-in-from-top-2">
                    <div className="border-b border-slate-100 px-3 py-2.5">
                      <p className="truncate text-sm font-bold text-slate-900">{user.name}</p>
                      <p className="truncate text-xs text-slate-500">{user.email}</p>
                      <span className="mt-1.5 inline-block rounded-full bg-indigo-50 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-indigo-700">
                        {user.role}
                      </span>
                    </div>

                    <div className="py-1">
                      {user.role === "STUDENT" && (
                        <Link
                          href="/registrations"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                        >
                          <Ticket className="size-4 text-indigo-600" />
                          My Tickets
                        </Link>
                      )}
                      <Link
                        href="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                      >
                        <User className="size-4 text-slate-500" />
                        Account Profile
                      </Link>

                      {(user.role === "ORGANIZER" || user.role === "ADMIN") && (
                        <Link
                          href="/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50"
                        >
                          <LayoutDashboard className="size-4 text-indigo-600" />
                          Organizer Dashboard
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
                      >
                        <LogOut className="size-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : !loading ? (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                Log In
              </Link>
              <Link
                href="/login?mode=signup"
                className="rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700"
              >
                Sign Up
              </Link>
              <Link
                href="/login?role=organizer"
                className="hidden rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900 sm:inline-flex"
              >
                Organizer Portal
              </Link>
            </div>
          ) : null}

          {/* Mobile menu trigger */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="grid size-10 place-items-center rounded-lg border border-slate-200 text-slate-700 md:hidden"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-white p-6 shadow-2xl animate-in slide-in-from-right">
            <div className="flex items-center justify-between">
              <BrandLogo />
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="grid size-8 place-items-center rounded-full text-slate-500 hover:bg-slate-100"
              >
                <X className="size-5" />
              </button>
            </div>

            <form
              role="search"
              onSubmit={(e) => {
                e.preventDefault();
                submitSearch(query);
              }}
              className="mt-6"
            >
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search events…"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none"
                />
              </div>
            </form>

            <div className="mt-6 space-y-1 border-t border-slate-100 pt-4">
              <Link
                href="/"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                <Sparkles className="size-4 text-indigo-600" />
                Home
              </Link>
              <Link
                href="/events"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                <CalendarDays className="size-4 text-indigo-600" />
                Explore Events
              </Link>
              {user && (user.role === "ORGANIZER" || user.role === "ADMIN") ? (
                <Link
                  href="/dashboard"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  <LayoutDashboard className="size-4 text-indigo-600" />
                  Organizer Dashboard
                </Link>
              ) : (
                <Link
                  href={user ? "/registrations" : "/login?redirect=/registrations"}
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  <Ticket className="size-4 text-indigo-600" />
                  My Tickets
                </Link>
              )}
              {user && (
                <Link
                  href="/profile"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  <User className="size-4 text-indigo-600" />
                  Profile
                </Link>
              )}
            </div>

            <div className="mt-8 border-t border-slate-100 pt-6">
              {user ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="size-4" />
                  Sign Out
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/login"
                    onClick={() => setDrawerOpen(false)}
                    className="flex h-11 items-center justify-center rounded-xl bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/login?mode=signup"
                    onClick={() => setDrawerOpen(false)}
                    className="flex h-11 items-center justify-center rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
