"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { dateKey, DEMO_TODAY, formatTime, monthGrid, monthLabel, parseCampusDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CampusEvent } from "@/types";

function shiftMonth(iso: string, delta: number): string {
  const date = parseCampusDate(iso);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + delta, 1))
    .toISOString()
    .slice(0, 19);
}

/** Reference A's calendar widget: month grid with event days highlighted. */
export function CalendarCard({ events }: { events: CampusEvent[] }) {
  const [monthIso, setMonthIso] = useState(DEMO_TODAY);
  const [selected, setSelected] = useState(dateKey(DEMO_TODAY));

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CampusEvent[]>();
    for (const event of events) {
      const key = dateKey(event.startsAt);
      map.set(key, [...(map.get(key) ?? []), event]);
    }
    return map;
  }, [events]);

  const cells = useMemo(() => monthGrid(monthIso), [monthIso]);
  const selectedEvents = eventsByDay.get(selected) ?? [];
  const monthEventCount = cells.filter((cell) => eventsByDay.has(cell.iso)).length;

  return (
    <Card>
      <CardHeader
        title={monthLabel(monthIso)}
        description={`${monthEventCount} event ${monthEventCount === 1 ? "day" : "days"} this month`}
        icon={<CalendarDays className="size-4" />}
        action={
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => setMonthIso((current) => shiftMonth(current, -1))}
              className="grid size-8 place-items-center rounded-full border border-cream-200 text-ink-500 transition-colors hover:border-brand-300 hover:text-brand-600"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => setMonthIso((current) => shiftMonth(current, 1))}
              className="grid size-8 place-items-center rounded-full border border-cream-200 text-ink-500 transition-colors hover:border-brand-300 hover:text-brand-600"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        }
      />

      <div className="px-5 py-4">
        <div className="grid grid-cols-7 gap-1 text-center text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-ink-400">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <span key={day}>{day.slice(0, 2)}</span>
          ))}
        </div>

        <div className="mt-2 grid grid-cols-7 gap-1">
          {cells.map((cell) => {
            const dayEvents = eventsByDay.get(cell.iso) ?? [];
            const hasEvents = dayEvents.length > 0;
            const isSelected = cell.iso === selected;
            const isToday = cell.iso === dateKey(DEMO_TODAY);

            return (
              <button
                key={cell.iso}
                type="button"
                onClick={() => setSelected(cell.iso)}
                aria-pressed={isSelected}
                aria-label={`${cell.iso}${hasEvents ? `, ${dayEvents.length} events` : ""}`}
                className={cn(
                  "relative grid aspect-square place-items-center rounded-xl text-xs font-medium transition-colors",
                  cell.inMonth ? "text-ink-700" : "text-ink-300",
                  isSelected
                    ? "bg-brand-500 text-white"
                    : hasEvents
                      ? "bg-cream-200 hover:bg-cream-300"
                      : "hover:bg-cream-100",
                  isToday && !isSelected && "ring-1 ring-brand-400",
                )}
              >
                {cell.day}
                {hasEvents && !isSelected ? (
                  <span className="absolute bottom-1 size-1 rounded-full bg-brand-600" />
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="mt-4 space-y-2 border-t border-cream-200 pt-4">
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-ink-400">
            {selected}
          </p>
          {selectedEvents.length === 0 ? (
            <p className="text-sm text-ink-500">
              No campus events scheduled for this day. Pick a highlighted date.
            </p>
          ) : (
            <ul className="space-y-2">
              {selectedEvents.map((event) => (
                <li key={event.id}>
                  <Link
                    href={`/events/${event.id}`}
                    className="flex items-start justify-between gap-3 rounded-2xl border border-cream-200 px-3 py-2 transition-colors hover:border-brand-300"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-ink-900">
                        {event.title}
                      </span>
                      <span className="block text-xs text-ink-500">
                        {formatTime(event.startsAt)} · {event.venue}
                      </span>
                    </span>
                    <Badge tone={event.status === "published" ? "leaf" : "brand"}>
                      {event.registered}/{event.capacity}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Card>
  );
}
