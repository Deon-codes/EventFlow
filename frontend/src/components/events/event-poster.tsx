"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Boxes,
  Briefcase,
  Camera,
  Cpu,
  Film,
  GraduationCap,
  Heart,
  Landmark,
  Music,
  Palette,
  Rocket,
  Sparkles,
  Trophy,
} from "lucide-react";
import { categoryTone } from "@/lib/events";
import { cn } from "@/lib/utils";
import type { CampusEvent, EventCategory, PosterArt } from "@/types";

/** Selectable illustration styles; stands in for S3 poster uploads. */
export const POSTER_ART_OPTIONS: PosterArt[] = [
  "tech",
  "design",
  "culture",
  "sports",
  "career",
  "robotics",
  "music",
  "startup",
  "film",
  "photo",
  "debate",
  "wellness",
];

export const POSTER_ART_LABELS: Record<PosterArt, string> = {
  tech: "Tech & code",
  design: "Design studio",
  culture: "Culture & performance",
  sports: "Sports & fitness",
  career: "Careers & industry",
  robotics: "Robotics & hardware",
  music: "Music & gigs",
  startup: "Startups & pitching",
  film: "Film & screening",
  photo: "Photography",
  debate: "Debate & academic",
  wellness: "Wellness & mindful",
};

const ART_ICONS: Record<PosterArt, typeof Cpu> = {
  tech: Cpu,
  design: Palette,
  culture: Sparkles,
  sports: Trophy,
  career: Briefcase,
  robotics: Boxes,
  music: Music,
  startup: Rocket,
  film: Film,
  photo: Camera,
  debate: Landmark,
  wellness: Heart,
};

const CATEGORY_ICONS: Record<EventCategory, typeof Cpu> = {
  Technology: Cpu,
  Workshops: Palette,
  "Arts & Culture": Sparkles,
  Sports: Trophy,
  Career: Briefcase,
  Music: Music,
  Academic: GraduationCap,
  Social: Rocket,
};

type Decor = "orbit" | "waves" | "grid" | "spotlight";

const DECOR_BY_ART: Record<PosterArt, Decor> = {
  tech: "grid",
  design: "orbit",
  culture: "spotlight",
  sports: "waves",
  career: "grid",
  robotics: "orbit",
  music: "waves",
  startup: "spotlight",
  film: "spotlight",
  photo: "waves",
  debate: "grid",
  wellness: "orbit",
};

/**
 * Event posters are illustrated placeholders in this milestone.
 *
 * When `event.posterUrl` is set, the component requests a temporary signed URL
 * from `/api/events/:id/poster` and renders the real image through next/image.
 * The illustration is shown while loading and as a fallback if the request fails.
 */
export function EventPoster({
  event,
  className,
  rounded = "rounded-3xl",
  showWordmark = true,
}: {
  event: {
    id?: string;
    category: CampusEvent["category"];
    posterArt?: CampusEvent["posterArt"];
    posterUrl?: CampusEvent["posterUrl"] | null;
    title: CampusEvent["title"];
  };
  className?: string;
  rounded?: string;
  showWordmark?: boolean;
}) {
  const tone = categoryTone(event.category).poster;
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!event.id || !event.posterUrl) {
      return;
    }

    fetch(`/api/events/${event.id}/poster`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Poster unavailable");
        return response.json();
      })
      .then((data: { url?: string }) => {
        if (!cancelled) setImageUrl(data.url ?? null);
      })
      .catch(() => {
        if (!cancelled) setImageUrl(null);
      });

    return () => {
      cancelled = true;
    };
  }, [event.id, event.posterUrl]);

  if (event.posterUrl && imageUrl) {
    return (
      <div className={cn("relative overflow-hidden", rounded, className)}>
        <Image
          src={imageUrl}
          alt={`${event.title} poster`}
          fill
          sizes="(max-width: 768px) 100vw, 420px"
          className="object-cover"
          unoptimized
        />
      </div>
    );
  }

  const Icon = (event.posterArt && ART_ICONS[event.posterArt]) ?? CATEGORY_ICONS[event.category];
  const decor = (event.posterArt && DECOR_BY_ART[event.posterArt]) ?? "orbit";

  return (
    <div
      role="img"
      aria-label={`${event.category} event poster illustration`}
      className={cn("relative overflow-hidden", rounded, className)}
      style={{ backgroundColor: tone.bg }}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        {decor === "orbit" ? (
          <>
            <circle cx="320" cy="70" r="120" fill={tone.blob} opacity="0.9" />
            <circle cx="86" cy="250" r="96" fill={tone.blob} opacity="0.7" />
            <circle cx="200" cy="150" r="92" fill="none" stroke={tone.accent} strokeWidth="1.5" opacity="0.7" />
            <circle cx="200" cy="150" r="126" fill="none" stroke={tone.accent} strokeWidth="1.5" opacity="0.45" />
          </>
        ) : null}

        {decor === "waves" ? (
          <>
            <path d="M0 210 Q100 150 200 205 T400 190 V300 H0 Z" fill={tone.blob} opacity="0.9" />
            <path d="M0 250 Q120 200 220 246 T400 236 V300 H0 Z" fill={tone.accent} opacity="0.35" />
            <circle cx="316" cy="76" r="46" fill={tone.accent} opacity="0.55" />
          </>
        ) : null}

        {decor === "grid" ? (
          <>
            <rect x="228" y="24" width="148" height="148" rx="36" fill={tone.blob} opacity="0.85" />
            <g fill={tone.accent} opacity="0.6">
              {Array.from({ length: 4 }).map((_, row) =>
                Array.from({ length: 4 }).map((__, column) => (
                  <circle
                    key={`${row}-${column}`}
                    cx={44 + column * 22}
                    cy={196 + row * 22}
                    r="3.4"
                  />
                )),
              )}
            </g>
          </>
        ) : null}

        {decor === "spotlight" ? (
          <>
            <path d="M0 0 H400 V120 L0 240 Z" fill={tone.blob} opacity="0.85" />
            <path d="M0 300 H400 V190 L0 262 Z" fill={tone.accent} opacity="0.3" />
            <circle cx="82" cy="78" r="34" fill={tone.accent} opacity="0.5" />
          </>
        ) : null}
      </svg>

      <div className="absolute inset-0 grid place-items-center">
        <span
          className="grid size-16 place-items-center rounded-3xl bg-white/70 shadow-soft backdrop-blur-sm transition-transform duration-300 group-hover:scale-105 sm:size-20"
          style={{ color: tone.ink }}
        >
          <Icon aria-hidden="true" className="size-7 sm:size-9" strokeWidth={1.7} />
        </span>
      </div>

      {showWordmark ? (
        <span className="absolute bottom-3 left-4 text-[0.6rem] font-bold uppercase tracking-[0.28em] opacity-45" style={{ color: tone.ink }}>
          Kampus
        </span>
      ) : null}
    </div>
  );
}