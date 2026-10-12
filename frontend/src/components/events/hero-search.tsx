"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { EVENT_CATEGORIES } from "@/types";

/** Reference B's discovery search, wired to the real listing filters. */
export function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function go(value: string) {
    const trimmed = value.trim();
    router.push(trimmed ? `/events?q=${encodeURIComponent(trimmed)}` : "/events");
  }

  return (
    <div className="space-y-4">
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          go(query);
        }}
        className="flex flex-col gap-2 rounded-3xl border border-cream-200 bg-white p-2 shadow-soft sm:flex-row sm:items-center"
      >
        <div className="relative flex-1">
          <label htmlFor="hero-search" className="sr-only">
            Search campus events
          </label>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-400"
          />
          <input
            id="hero-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try hackathon, design or career fair"
            className="h-12 w-full rounded-2xl border-0 bg-transparent pl-11 pr-4 text-sm focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="inline-flex h-12 items-center justify-center rounded-2xl bg-brand-500 px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
        >
          Search events
        </button>
      </form>

      <ul className="flex flex-wrap items-center gap-2">
        {EVENT_CATEGORIES.slice(0, 5).map((category) => (
          <li key={category}>
            <button
              type="button"
              onClick={() => router.push(`/events?category=${encodeURIComponent(category)}`)}
              className="rounded-full border border-cream-300 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-700"
            >
              {category}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
