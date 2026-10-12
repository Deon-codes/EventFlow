import { cn } from "@/lib/utils";
import { percent } from "@/lib/format";

export function ProgressBar({
  value,
  className,
  barClassName,
}: {
  value: number;
  className?: string;
  barClassName?: string;
}) {
  const width = Math.min(Math.max(value, 0), 100);
  return (
    <div
      role="progressbar"
      aria-valuenow={width}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-cream-300", className)}
    >
      <div
        className={cn("h-full rounded-full bg-brand-500 transition-all", barClassName)}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

export function CapacityMeter({
  registered,
  capacity,
  waitlisted = 0,
  compact = false,
  className,
}: {
  registered: number;
  capacity: number;
  waitlisted?: number;
  compact?: boolean;
  className?: string;
}) {
  const filled = percent(registered, capacity);
  const soldOut = registered >= capacity;

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between gap-3 text-xs text-ink-500">
        <span className="font-semibold text-ink-700">
          {registered} / {capacity} seats
        </span>
        <span className={cn("font-semibold", soldOut ? "text-berry-500" : "text-ink-500")}>
          {soldOut ? "Full" : `${filled}% full`}
        </span>
      </div>
      <ProgressBar
        value={filled}
        barClassName={soldOut ? "bg-berry-500" : filled > 80 ? "bg-brand-600" : "bg-brand-500"}
      />
      {!compact && waitlisted > 0 ? (
        <p className="text-xs text-plum-500">{waitlisted} on the waitlist</p>
      ) : null}
    </div>
  );
}
