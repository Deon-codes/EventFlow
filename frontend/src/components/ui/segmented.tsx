"use client";

import { cn } from "@/lib/utils";

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

/** Reference B tab row: centred pills with the active tab in brand amber. */
export function PillTabs<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: {
  options: ReadonlyArray<SegmentOption<T>>;
  value: T;
  onChange: (next: T) => void;
  label: string;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn(
        "flex min-w-0 flex-wrap items-center justify-center gap-1 rounded-3xl bg-cream-200/80 p-1",
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
              active
                ? "bg-brand-500 text-white shadow-soft"
                : "text-ink-500 hover:text-ink-900",
            )}
          >
            {option.label}
            {typeof option.count === "number" ? (
              <span className={cn("ml-1.5 text-xs", active ? "text-white/80" : "text-ink-400")}>
                {option.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

/** Reference A style segmented control for dashboard toolbars. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: {
  options: ReadonlyArray<SegmentOption<T>>;
  value: T;
  onChange: (next: T) => void;
  label: string;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "inline-flex flex-wrap items-center gap-1 rounded-2xl border border-cream-200 bg-white p-1 shadow-soft",
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors sm:text-sm",
              active
                ? "bg-bark-800 text-white"
                : "text-ink-500 hover:bg-cream-200 hover:text-ink-900",
            )}
          >
            {option.label}
            {typeof option.count === "number" ? (
              <span className={cn("ml-1.5", active ? "text-white/70" : "text-ink-400")}>
                {option.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
