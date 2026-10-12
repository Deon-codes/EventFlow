import type { ReactNode } from "react";
import { CircleAlert, CircleCheckBig, Info, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

type NoticeTone = "info" | "success" | "warning" | "danger";

const TONES: Record<NoticeTone, { wrap: string; icon: ReactNode }> = {
  info: {
    wrap: "border-sky-500/20 bg-sky-100/70 text-ink-800",
    icon: <Info className="size-4 text-sky-500" />,
  },
  success: {
    wrap: "border-leaf-500/20 bg-leaf-100 text-ink-800",
    icon: <CircleCheckBig className="size-4 text-leaf-500" />,
  },
  warning: {
    wrap: "border-brand-300 bg-brand-50 text-ink-800",
    icon: <TriangleAlert className="size-4 text-brand-700" />,
  },
  danger: {
    wrap: "border-berry-500/25 bg-berry-500/10 text-berry-600",
    icon: <CircleAlert className="size-4 text-berry-500" />,
  },
};

export function Notice({
  tone = "info",
  title,
  children,
  className,
  action,
}: {
  tone?: NoticeTone;
  title?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  const { wrap, icon } = TONES[tone];
  return (
    <div
      className={cn(
        "flex flex-wrap items-start gap-3 rounded-2xl border px-4 py-3 text-sm",
        wrap,
        className,
      )}
    >
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-[12rem] flex-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        <div className={cn(title && "mt-0.5", "text-ink-700")}>{children}</div>
      </div>
      {action}
    </div>
  );
}

/** Standard "this screen is a frontend preview" disclaimer. */
export function BackendNotice({
  endpoint,
  className,
  children,
}: {
  endpoint: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <Notice tone="warning" title="Frontend preview — not connected to a backend yet" className={className}>
      {children ?? (
        <>
          This screen renders sample data only. When the AWS milestone lands it will read
          and write through <span className="font-mono text-xs">{endpoint}</span> on the
          campus EC2 instance, backed by Amazon RDS and Amazon S3.
        </>
      )}
    </Notice>
  );
}
