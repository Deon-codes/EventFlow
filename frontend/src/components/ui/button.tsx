import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "dark"
  | "outline"
  | "danger";

export type ButtonSize = "sm" | "md" | "lg" | "icon";

const BASE =
  "relative inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-tight transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-55";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-500 text-white shadow-soft hover:bg-brand-600 hover:shadow-float active:bg-brand-700",
  secondary:
    "bg-white text-ink-900 border border-cream-300 hover:border-brand-300 hover:bg-brand-50",
  ghost: "text-ink-700 hover:bg-cream-200 hover:text-ink-900",
  dark: "bg-bark-800 text-white hover:bg-bark-700",
  outline:
    "border border-ink-900/15 bg-transparent text-ink-900 hover:border-ink-900/30 hover:bg-cream-200/70",
  danger: "bg-berry-500 text-white hover:bg-berry-600",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-[0.8rem]",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-base",
  icon: "h-10 w-10",
};

interface CommonButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
}

export interface ButtonProps
  extends CommonButtonProps,
    Omit<ComponentProps<"button">, "children"> {
  children?: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  className,
  children,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(BASE, VARIANTS[variant], SIZES[size], className)}
      {...props}
    >
      {loading ? (
        <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
      ) : (
        icon
      )}
      {children}
    </button>
  );
}

export interface ButtonLinkProps
  extends CommonButtonProps,
    Omit<ComponentProps<typeof Link>, "children"> {
  children?: ReactNode;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  icon,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={cn(BASE, VARIANTS[variant], SIZES[size], className)} {...props}>
      {icon}
      {children}
    </Link>
  );
}
