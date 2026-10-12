import { AVATAR_TONE_CLASSES, toneForSeed } from "@/lib/events";
import { cn, initials } from "@/lib/utils";
import type { AvatarTone } from "@/types";

const SIZES = {
  sm: "size-8 text-[0.7rem]",
  md: "size-10 text-sm",
  lg: "size-14 text-base",
  xl: "size-20 text-xl",
} as const;

export function Avatar({
  name,
  tone,
  size = "md",
  className,
}: {
  name: string;
  tone?: AvatarTone | "leaf";
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const resolved: AvatarTone =
    tone && tone !== "leaf" ? tone : (toneForSeed(name) as AvatarTone);

  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid shrink-0 place-items-center rounded-full font-semibold uppercase tracking-wide",
        SIZES[size],
        AVATAR_TONE_CLASSES[resolved],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
