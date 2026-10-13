import Link from "next/link";
import { Ticket } from "lucide-react";
import { cn } from "@/lib/utils";

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
      <span className={cn(
        "relative grid size-9 place-items-center rounded-xl shadow-sm transition-all group-hover:scale-105",
        onDark ? "bg-indigo-600 text-white" : "bg-indigo-600 text-white"
      )}>
        <Ticket className="size-5 transition-transform group-hover:-rotate-12" />
      </span>
      <span className="leading-tight">
        <span
          className={cn(
            "block text-lg font-bold tracking-tight",
            onDark ? "text-white" : "text-slate-900",
          )}
        >
          Event<span className="text-indigo-600">Flow</span>
        </span>
        {subtitle ? (
          <span
            className={cn(
              "block text-[0.65rem] font-semibold tracking-wider uppercase",
              onDark ? "text-slate-400" : "text-slate-500",
            )}
          >
            {subtitle}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
