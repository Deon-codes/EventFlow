import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Reference B's lowercase wordmark: the first syllable in brand amber with a
 * small ticket notch, the rest in warm ink (or white on the dashboard rail).
 */
export function BrandLogo({
  onDark = false,
  href = "/",
  className,
  subtitle,
}: {
  onDark?: boolean;
  href?: string;
  className?: string;
  subtitle?: string;
}) {
  return (
    <Link
      href={href}
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label="EventFlow home"
    >
      <span className="relative grid size-9 place-items-center rounded-2xl bg-brand-500 text-white shadow-soft transition-transform group-hover:-rotate-3">
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5">
          <path
            d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v3a2.5 2.5 0 0 0 0 5v5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-5a2.5 2.5 0 0 0 0-5z"
            fill="currentColor"
            opacity="0.25"
          />
          <path
            d="M8 4v16"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeDasharray="2 2.5"
          />
        </svg>
      </span>
      <span className="leading-none">
        <span
          className={cn(
            "block text-lg font-bold tracking-tight",
            onDark ? "text-white" : "text-ink-900",
          )}
        >
          <span className="text-brand-500">event</span>
          <span className={onDark ? "text-white" : "text-ink-900"}>flow</span>
        </span>
        {subtitle ? (
          <span
            className={cn(
              "mt-0.5 block text-[0.62rem] font-semibold uppercase tracking-[0.2em]",
              onDark ? "text-white/50" : "text-ink-400",
            )}
          >
            {subtitle}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
