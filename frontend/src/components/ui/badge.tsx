import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type BadgeTone =
  | "brand"
  | "leaf"
  | "sky"
  | "plum"
  | "clay"
  | "berry"
  | "neutral"
  | "outline";

const TONES: Record<BadgeTone, string> = {
  brand: "bg-brand-100 text-brand-700",
  leaf: "bg-leaf-100 text-leaf-500",
  sky: "bg-sky-100 text-sky-500",
  plum: "bg-plum-100 text-plum-500",
  clay: "bg-clay-100 text-clay-500",
  berry: "bg-berry-500/10 text-berry-500",
  neutral: "bg-cream-200 text-ink-700",
  outline: "border border-cream-300 text-ink-700",
};

export function Badge({
  tone = "neutral",
  className,
  children,
  icon,
  dot,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
  icon?: ReactNode;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        TONES[tone],
        className,
      )}
    >
      {dot ? (
        <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      ) : null}
      {icon}
      {children}
    </span>
  );
}
