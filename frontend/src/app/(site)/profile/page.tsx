import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { User, ShieldCheck } from "lucide-react";
import { ProfileView } from "@/components/student/profile-view";
import { currentUser } from "@/lib/session";
import { dbService } from "@/lib/db-service";

export const metadata: Metadata = {
  title: "Profile",
  description: "Your Kampus account, student details and preferences.",
};

export default async function ProfilePage() {
  const user = await currentUser();
  if (!user) {
    redirect("/login?redirect=/profile");
  }

  const isOrganizer = user.role === "ORGANIZER" || user.role === "ADMIN";
  let activeCount = 0;
  let attendedCount = 0;

  if (!isOrganizer) {
    try {
      const registrations = await dbService.getStudentRegistrations(user.id);
      activeCount = registrations.filter((r) => r.status === "REGISTERED").length;
      attendedCount = registrations.filter((r) => r.status === "CHECKED_IN").length;
    } catch {
      activeCount = 0;
      attendedCount = 0;
    }
  }

  const studentObj = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: isOrganizer ? ("organizer" as const) : ("student" as const),
    programme: isOrganizer ? "Event Organizer" : "Computer Science & Engineering",
    year: isOrganizer ? "Organizer" : "3rd Year",
    studentId: isOrganizer ? undefined : "",
    phone: "",
    avatarTone: "berry" as const,
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <header className="border-b border-slate-200 pb-4">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
          {isOrganizer ? <ShieldCheck className="size-3.5" /> : <User className="size-3.5" />}
          Campus {isOrganizer ? "Organizer Account" : "Student Account"}
        </div>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Account Profile</h1>
        <p className="mt-1 text-sm text-slate-500">
          {isOrganizer
            ? "Manage your organizer details, account contact, and event preferences."
            : "Manage your personal details, student identification, and event notifications."}
        </p>
      </header>

      <ProfileView
        student={studentObj}
        stats={{
          tickets: activeCount,
          attended: attendedCount,
          registeredAt: "2026-08-18T09:00:00",
        }}
      />
    </div>
  );
}
