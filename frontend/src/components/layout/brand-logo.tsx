import Link from "next/link";
import Image from "next/image";
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
      aria-label="Kampus home"
    >
      <span className="relative grid size-9 place-items-center rounded-xl transition-all group-hover:scale-105 overflow-hidden">
        <Image
          src="/logo.png"
          alt="Kampus logo"
          width={36}
          height={36}
          className="size-9 object-contain"
          priority
        />
      </span>
      <span className="leading-tight">
        <span
          className={cn(
            "block text-lg font-bold tracking-tight",
            onDark ? "text-white" : "text-slate-900",
          )}
        >
          Kam<span className="text-indigo-600">pus</span>
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
