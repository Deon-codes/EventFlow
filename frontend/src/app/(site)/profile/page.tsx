import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { User, ShieldCheck } from "lucide-react";
import { ProfileView } from "@/components/student/profile-view";
import { currentUser } from "@/lib/session";
import { dbService } from "@/lib/db-service";

export const metadata: Metadata = {
  title: "Profile",
  description: "Your EventFlow account, student details and preferences.",
};

export default async function ProfilePage() {
  const user = await currentUser();
  if (!user) {
    redirect("/login?redirect=/profile");
  }

  const registrations = await dbService.getStudentRegistrations(user.id);
  const activeCount = registrations.filter((r) => r.status === "REGISTERED").length;
  const attendedCount = registrations.filter((r) => r.status === "CHECKED_IN").length;

  const studentObj = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role.toLowerCase() as any,
    programme: "Computer Science & Engineering",
    year: "3rd Year",
    studentId: `STU-${user.id.slice(-6).toUpperCase()}`,
    phone: "+91 98765 43210",
    avatarTone: "berry" as any,
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <header className="border-b border-slate-200 pb-4">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
          <User className="size-3.5" />
          Campus {user.role === "STUDENT" ? "Student Account" : "Organizer Account"}
        </div>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Account Profile</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your personal details, student identification, and event notifications.
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
