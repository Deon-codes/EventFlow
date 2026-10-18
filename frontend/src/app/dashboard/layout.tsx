import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/session";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardTopbar } from "@/components/layout/dashboard-topbar";

export const metadata: Metadata = {
  title: {
    default: "Organizer dashboard",
    template: "%s · Organizer dashboard",
  },
  description:
    "Create campus events, watch capacity fill and manage attendee registrations.",
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) {
    redirect("/login?redirect=/dashboard");
  }

  if (user.role === "STUDENT") {
    redirect("/registrations");
  }

  return (
    <div className="flex min-h-dvh flex-1 bg-cloud-100">
      <DashboardSidebar organizer={{ name: user.name, email: user.email, role: user.role }} />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar organizer={{ name: user.name, email: user.email, role: user.role }} />
        <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">{children}</main>
        <footer className="border-t border-cream-200 px-4 py-4 text-xs text-ink-400 sm:px-6 lg:px-8">
          Event create/update and poster upload use the API. Signed-in organizers see live events, registrations and attendee lists; public visitors still see sample content.
        </footer>
      </div>
    </div>
  );
}
