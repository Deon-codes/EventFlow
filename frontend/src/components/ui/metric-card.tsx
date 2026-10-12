import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const TONES = {
  brand: "bg-brand-100 text-brand-700",
  leaf: "bg-leaf-100 text-leaf-500",
  mint: "bg-mint-100 text-mint-500",
  sky: "bg-sky-100 text-sky-500",
  plum: "bg-plum-100 text-plum-500",
  clay: "bg-clay-100 text-clay-500",
} as const;

export function MetricCard({
  label,
  value,
  hint,
  icon,
  tone = "brand",
  trend,
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon: ReactNode;
  tone?: keyof typeof TONES;
  trend?: { value: string; positive?: boolean };
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-card border border-cream-200 bg-white p-5 shadow-soft transition-transform hover:-translate-y-0.5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className={cn("grid size-11 place-items-center rounded-2xl", TONES[tone])}>
          {icon}
        </span>
        {trend ? (
          <span
            className={cn(
              "rounded-full px-2 py-1 text-xs font-semibold",
              trend.positive === false
                ? "bg-berry-500/10 text-berry-500"
                : "bg-leaf-100 text-leaf-500",
            )}
          >
            {trend.value}
          </span>
        ) : null}
      </div>
      <p className="mt-4 text-sm font-medium text-ink-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight text-ink-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-ink-400">{hint}</p> : null}
    </div>
  );
}
