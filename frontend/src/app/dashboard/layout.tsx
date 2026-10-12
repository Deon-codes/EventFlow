import type { Metadata } from "next";
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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-1 bg-cloud-100">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar />
        <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">{children}</main>
        <footer className="border-t border-cream-200 px-4 py-4 text-xs text-ink-400 sm:px-6 lg:px-8">
          Organizer workspace · sample data only. Event storage, poster uploads and attendee
          records connect to AWS EC2, Amazon RDS and Amazon S3 in the next milestone.
        </footer>
      </div>
    </div>
  );
}
