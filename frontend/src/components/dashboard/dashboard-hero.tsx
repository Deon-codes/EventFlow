import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { DashboardHeroArt } from "@/components/illustrations/illustrations";

/** Reference A's amber greeting band with the checklist copy and illustration. */
export function DashboardHero({
  upcomingCount,
  draftCount,
  nextEventTitle,
  nextEventWhen,
  openTasks,
  organizerName,
}: {
  upcomingCount: number;
  draftCount: number;
  nextEventTitle?: string;
  nextEventWhen?: string;
  openTasks: Array<{ label: string; done: boolean }>;
  organizerName: string;
}) {
  const greeting = organizerName.split(" ")[0];

  return (
    <section className="overflow-hidden rounded-panel bg-gradient-to-r from-brand-500 to-brand-600 p-6 shadow-soft sm:p-7">
      <div className="grid items-center gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="text-white">
          <h1 className="text-2xl font-bold leading-tight sm:text-[1.75rem]">
            Hello {greeting}!
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/90">
            You have <span className="font-semibold">{upcomingCount} published events</span>{" "}
            coming up on the campus calendar and{" "}
            <span className="font-semibold">{draftCount} drafts</span> waiting on a decision.
            {nextEventTitle ? (
              <>
                {" "}
                Next up: <span className="font-semibold">{nextEventTitle}</span>
                {nextEventWhen ? `, ${nextEventWhen}` : null}.
              </>
            ) : null}
          </p>

          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {openTasks.map((task) => (
              <li key={task.label} className="flex items-center gap-2 text-sm text-white/90">
                <span
                  className={
                    task.done
                      ? "grid size-5 place-items-center rounded-full bg-white/25"
                      : "grid size-5 place-items-center rounded-full border border-white/40"
                  }
                >
                  {task.done ? <Check aria-hidden="true" className="size-3" /> : null}
                </span>
                {task.label}
              </li>
            ))}
          </ul>

          <Link
            href="/dashboard/events"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white underline decoration-white/50 underline-offset-4 transition-colors hover:decoration-white"
          >
            Read more in Manage events
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </div>

        <div className="hidden h-48 lg:block xl:h-52">
          <DashboardHeroArt />
        </div>
      </div>
    </section>
  );
}
