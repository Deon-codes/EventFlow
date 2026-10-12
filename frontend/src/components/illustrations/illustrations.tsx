import { cn } from "@/lib/utils";

/**
 * Flat vector illustrations in the reference's visual language: warm cream
 * canvases, amber accents, plum/mint supporting tones and soft rounded shapes.
 */

export function HeroArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 360"
      role="img"
      aria-label="Illustration of students browsing campus event tickets"
      className={cn("h-full w-full", className)}
    >
      <circle cx="392" cy="86" r="86" fill="#fbdb9e" opacity="0.55" />
      <circle cx="88" cy="300" r="72" fill="#f4e6d1" />
      <path
        d="M300 318c34-58 92-92 168-96"
        stroke="#f8b64f"
        strokeWidth="2"
        fill="none"
        strokeDasharray="6 8"
      />

      {/* Floating event card behind */}
      <g transform="rotate(-8 148 210)">
        <rect x="66" y="150" width="164" height="120" rx="22" fill="#ffffff" />
        <rect x="80" y="164" width="58" height="46" rx="14" fill="#efe1f8" />
        <circle cx="109" cy="187" r="11" fill="#8a4bb8" opacity="0.75" />
        <rect x="148" y="168" width="66" height="9" rx="4.5" fill="#e8d6bb" />
        <rect x="148" y="184" width="48" height="9" rx="4.5" fill="#f4e6d1" />
        <rect x="80" y="224" width="76" height="9" rx="4.5" fill="#e8d6bb" />
        <rect x="80" y="240" width="52" height="9" rx="4.5" fill="#f4e6d1" />
        <rect x="170" y="224" width="46" height="26" rx="13" fill="#f7a73c" />
      </g>

      {/* Ticket stub with a dashed perforation */}
      <g transform="rotate(6 316 168)">
        <rect x="228" y="74" width="176" height="120" rx="24" fill="#ffffff" />
        <rect x="240" y="86" width="152" height="42" rx="16" fill="#fdeacb" />
        <path d="M258 108h116" stroke="#eb9220" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
        <path
          d="M316 96v76"
          stroke="#f4e6d1"
          strokeWidth="3"
          strokeDasharray="6 7"
          strokeLinecap="round"
        />
        <rect x="262" y="142" width="42" height="8" rx="4" fill="#e8d6bb" />
        <rect x="262" y="158" width="28" height="8" rx="4" fill="#f4e6d1" />
        <rect x="334" y="142" width="46" height="30" rx="15" fill="#f7a73c" />
        <path d="m350 157 4 4 8-8" stroke="#ffffff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Student with a lanyard */}
      <g>
        <rect x="150" y="292" width="150" height="14" rx="7" fill="#e8d6bb" opacity="0.7" />
        <path d="M232 300v-52" stroke="#2b2318" strokeWidth="12" strokeLinecap="round" />
        <path d="M254 300v-52" stroke="#2b2318" strokeWidth="12" strokeLinecap="round" />
        <rect x="204" y="188" width="82" height="66" rx="26" fill="#f7a73c" />
        <rect x="222" y="164" width="46" height="30" rx="14" fill="#8a4bb8" />
        <circle cx="245" cy="140" r="26" fill="#e8b48e" />
        <path d="M219 136c6-20 46-22 52 0 1 5-3 8-6 5-8-8-32-8-40 0-3 3-7 0-6-5z" fill="#2b2318" />
        <path d="M286 214c22 4 34 16 34 30" stroke="#e8b48e" strokeWidth="13" strokeLinecap="round" fill="none" />
        <rect x="308" y="240" width="34" height="24" rx="10" fill="#ffffff" stroke="#f4e6d1" strokeWidth="2" />
      </g>

      {/* Plant */}
      <g>
        <path d="M52 292h44l-6 44H58z" fill="#c2603a" />
        <path d="M74 292c-4-26 6-46 22-54-10 22-14 38-12 54z" fill="#2f9e6b" />
        <path d="M74 292c-16-16-32-20-46-16 18 12 30 20 38 26z" fill="#2f9e6b" opacity="0.8" />
      </g>

      <circle cx="404" cy="256" r="9" fill="#f7a73c" />
      <circle cx="432" cy="220" r="5" fill="#8a4bb8" opacity="0.6" />
      <circle cx="62" cy="126" r="7" fill="#2ec4a6" opacity="0.7" />
    </svg>
  );
}

export function DashboardHeroArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 360 260"
      role="img"
      aria-label="Illustration of an organizer planning events at a laptop"
      className={cn("h-full w-full", className)}
    >
      <circle cx="286" cy="66" r="66" fill="#ffffff" opacity="0.16" />
      <circle cx="60" cy="212" r="48" fill="#ffffff" opacity="0.12" />

      {/* desk block */}
      <rect x="150" y="196" width="150" height="52" rx="14" fill="#ffffff" opacity="0.92" />
      <rect x="150" y="196" width="150" height="12" rx="6" fill="#cf7913" opacity="0.25" />

      {/* seated organizer */}
      <g>
        <path d="M112 248v-38" stroke="#2b2318" strokeWidth="14" strokeLinecap="round" />
        <path d="M136 248v-38" stroke="#2b2318" strokeWidth="14" strokeLinecap="round" />
        <rect x="96" y="150" width="58" height="62" rx="22" fill="#ffffff" />
        <circle cx="125" cy="120" r="24" fill="#e8b48e" />
        <path d="M101 118c4-20 44-22 50 0 1 5-3 8-6 5-8-8-30-8-38 0-3 3-7 0-6-5z" fill="#2b2318" />
        <path d="M150 180c22 2 34 10 40 22" stroke="#e8b48e" strokeWidth="12" strokeLinecap="round" fill="none" />
        <rect x="88" y="142" width="26" height="20" rx="8" fill="#8a4bb8" />
      </g>

      {/* laptop */}
      <g>
        <rect x="176" y="150" width="70" height="46" rx="8" fill="#2b2318" />
        <rect x="182" y="156" width="58" height="34" rx="5" fill="#fdeacb" />
        <path d="M170 196h84l8 12h-100z" fill="#e8d6bb" />
        <path d="M192 168h38M192 178h26" stroke="#eb9220" strokeWidth="3" strokeLinecap="round" />
      </g>

      {/* plant + chart card */}
      <g>
        <path d="M266 190h34l-5 34h-24z" fill="#ffffff" opacity="0.85" />
        <path d="M283 190c-3-18 4-30 15-35-7 14-9 25-8 35z" fill="#2f9e6b" />
        <path d="M283 190c-11-11-22-13-31-10 12 8 20 13 25 17z" fill="#2f9e6b" opacity="0.85" />
      </g>
      <g transform="translate(52 40) rotate(-6)">
        <rect width="96" height="66" rx="14" fill="#ffffff" />
        <rect x="12" y="14" width="42" height="7" rx="3.5" fill="#e8d6bb" />
        <rect x="12" y="42" width="12" height="14" rx="4" fill="#f7a73c" />
        <rect x="30" y="32" width="12" height="24" rx="4" fill="#2ec4a6" />
        <rect x="48" y="24" width="12" height="32" rx="4" fill="#8a4bb8" />
        <rect x="66" y="38" width="12" height="18" rx="4" fill="#eb9220" />
      </g>
    </svg>
  );
}

export function PromoArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 150"
      role="img"
      aria-label="Illustration of cloud storage and synced devices"
      className={cn("h-full w-full", className)}
    >
      <path
        d="M62 96a30 30 0 0 1 4-60 40 40 0 0 1 76-6 27 27 0 0 1 20 66z"
        fill="#ffffff"
        opacity="0.95"
      />
      <g>
        <rect x="76" y="104" width="70" height="42" rx="8" fill="#2b2318" />
        <rect x="82" y="110" width="58" height="30" rx="5" fill="#fdeacb" />
        <rect x="72" y="146" width="78" height="8" rx="4" fill="#e8d6bb" />
      </g>
      <g>
        <rect x="156" y="60" width="42" height="66" rx="10" fill="#2b2318" />
        <rect x="162" y="68" width="30" height="48" rx="5" fill="#f7a73c" />
        <circle cx="177" cy="122" r="3" fill="#f4e6d1" />
      </g>
      <circle cx="44" cy="124" r="10" fill="#2ec4a6" opacity="0.85" />
      <circle cx="26" cy="42" r="7" fill="#ffffff" opacity="0.6" />
      <path d="M186 34l6 12 12-6-6 12 12 6-12 6 6 12-12-6-6 12-6-12-12 6 6-12-12-6 12-6z" fill="#f7a73c" opacity="0.75" />
    </svg>
  );
}

export function OfferArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 140"
      role="img"
      aria-label="Illustration of a megaphone and event calendar"
      className={cn("h-full w-full", className)}
    >
      <rect x="18" y="26" width="86" height="94" rx="16" fill="#ffffff" />
      <rect x="18" y="26" width="86" height="24" rx="16" fill="#f7a73c" />
      <rect x="30" y="62" width="34" height="7" rx="3.5" fill="#e8d6bb" />
      <rect x="30" y="78" width="48" height="7" rx="3.5" fill="#f4e6d1" />
      <rect x="30" y="94" width="40" height="7" rx="3.5" fill="#f4e6d1" />
      <circle cx="82" cy="102" r="12" fill="#2ec4a6" opacity="0.9" />
      <g transform="rotate(-12 140 84)">
        <path d="M120 74h34l26-20v62l-26-20h-34z" fill="#8a4bb8" />
        <rect x="108" y="70" width="16" height="34" rx="6" fill="#2b2318" />
        <path d="M132 108l6 22" stroke="#2b2318" strokeWidth="8" strokeLinecap="round" />
      </g>
      <path d="M182 28l8 8M186 56l10 2M170 12l2 10" stroke="#f7a73c" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}
