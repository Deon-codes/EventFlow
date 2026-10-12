/**
 * Deterministic date helpers.
 *
 * Campus timestamps are stored as naive ISO strings ("2026-10-24T10:00:00")
 * that always mean campus local time. To keep server-rendered markup and
 * client hydration byte-identical we never read the host timezone: strings are
 * parsed into UTC-anchored Date objects and formatted from UTC parts.
 */

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/** Reference "today" for the mock-data milestone. A later milestone swaps this
 *  for the server clock once events come from Amazon RDS. */
export const DEMO_TODAY = "2026-10-12T09:00:00";

export function parseCampusDate(iso: string): Date {
  const [datePart, timePart = "00:00"] = iso.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  return new Date(Date.UTC(year, month - 1, day, hour, minute));
}

function parts(iso: string) {
  const date = parseCampusDate(iso);
  return {
    date,
    year: date.getUTCFullYear(),
    month: date.getUTCMonth(),
    day: date.getUTCDate(),
    hour: date.getUTCHours(),
    minute: date.getUTCMinutes(),
    weekday: date.getUTCDay(),
  };
}

export function formatMonthDay(iso: string): string {
  const p = parts(iso);
  return `${MONTHS[p.month].slice(0, 3)} ${p.day}`;
}

export function formatFullDate(iso: string): string {
  const p = parts(iso);
  return `${WEEKDAYS[p.weekday].slice(0, 3)}, ${MONTHS[p.month].slice(0, 3)} ${p.day}, ${p.year}`;
}

export function formatShortDate(iso: string): string {
  const p = parts(iso);
  return `${MONTHS[p.month].slice(0, 3)} ${p.day}, ${p.year}`;
}

export function formatTime(iso: string): string {
  const p = parts(iso);
  const suffix = p.hour >= 12 ? "PM" : "AM";
  const hour12 = p.hour % 12 === 0 ? 12 : p.hour % 12;
  return `${hour12}:${String(p.minute).padStart(2, "0")} ${suffix}`;
}

export function formatTimeRange(startIso: string, endIso: string): string {
  const start = parts(startIso);
  const end = parts(endIso);
  const sameDay =
    start.year === end.year &&
    start.month === end.month &&
    start.day === end.day;

  if (!sameDay) {
    return `${formatTime(startIso)} → ${formatFullDate(endIso)} ${formatTime(endIso)}`;
  }
  return `${formatTime(startIso)} – ${formatTime(endIso)}`;
}

export function formatDateRange(startIso: string, endIso: string): string {
  return `${formatFullDate(startIso)} · ${formatTimeRange(startIso, endIso)}`;
}

export function formatDateTimeStamp(iso: string): string {
  return `${formatShortDate(iso)} · ${formatTime(iso)}`;
}

/** "Sep 30" style stamp used by activity feeds and tables. */
export function formatTableStamp(iso: string): string {
  const p = parts(iso);
  return `${MONTHS[p.month].slice(0, 3)} ${p.day}, ${p.year}`;
}

export function monthLabel(iso: string): string {
  const p = parts(iso);
  return `${MONTHS[p.month]} ${p.year}`;
}

export function addDays(iso: string, days: number): string {
  const date = parseCampusDate(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 19);
}

/** Whole-day difference between two campus timestamps (b - a). */
export function daysBetween(aIso: string, bIso: string): number {
  const a = parseCampusDate(aIso);
  const b = parseCampusDate(bIso);
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

export function relativeDayLabel(iso: string, fromIso: string = DEMO_TODAY): string {
  const diff = daysBetween(fromIso, iso);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  if (diff > 1 && diff < 7) return `In ${diff} days`;
  if (diff < -1 && diff > -7) return `${Math.abs(diff)} days ago`;
  return formatShortDate(iso);
}

export function isPast(iso: string, fromIso: string = DEMO_TODAY): boolean {
  return daysBetween(fromIso, iso) < 0;
}

/** Calendar grid (6 weeks, Sunday-first) for a month containing `iso`. */
export function monthGrid(iso: string): Array<{ iso: string; day: number; inMonth: boolean }> {
  const p = parts(iso);
  const first = new Date(Date.UTC(p.year, p.month, 1));
  const start = new Date(first);
  start.setUTCDate(first.getUTCDate() - first.getUTCDay());

  return Array.from({ length: 42 }, (_, index) => {
    const cell = new Date(start);
    cell.setUTCDate(start.getUTCDate() + index);
    return {
      iso: cell.toISOString().slice(0, 10),
      day: cell.getUTCDate(),
      inMonth: cell.getUTCMonth() === p.month,
    };
  });
}

export function dateKey(iso: string): string {
  return iso.slice(0, 10);
}

export function timeLabelToIso(dateInput: string, timeInput: string): string {
  return `${dateInput}T${timeInput.length === 5 ? `${timeInput}:00` : timeInput}`;
}

export function dateInputValue(iso: string): string {
  return iso.slice(0, 10);
}

export function timeInputValue(iso: string): string {
  return iso.slice(11, 16);
}

export function percent(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return Math.round((part / whole) * 100);
}

export function formatPrice(priceUsd: number): string {
  if (priceUsd <= 0) return "Free";
  return `$${priceUsd.toFixed(priceUsd % 1 === 0 ? 0 : 2)}`;
}

export function plural(count: number, singular: string, pluralForm?: string): string {
  return `${count} ${count === 1 ? singular : (pluralForm ?? `${singular}s`)}`;
}
