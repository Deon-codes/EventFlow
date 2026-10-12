"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

/** Local-only follow toggle; the real follow list lands with the backend milestone. */
export function FollowButton({ name }: { name: string }) {
  const [following, setFollowing] = useState(false);

  return (
    <button
      type="button"
      aria-pressed={following}
      onClick={() => setFollowing((current) => !current)}
      title={`Follow ${name} — saved locally in this preview`}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-colors",
        following
          ? "bg-leaf-100 text-leaf-500"
          : "bg-brand-500 text-white hover:bg-brand-600",
      )}
    >
      {following ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
      {following ? "Following" : "Follow"}
    </button>
  );
}
