import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { ProfileView } from "@/components/student/profile-view";
import { User } from "lucide-react";
import { registrationsForStudent } from "@/lib/events";
import { CURRENT_STUDENT } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Profile",
  description: "Your EventFlow account, contact details and notification preferences.",
};

export default function ProfilePage() {
  const registrations = registrationsForStudent(CURRENT_STUDENT.id);

  return (
    <div className="space-y-6">
      <header>
        <Badge tone="brand" icon={<User className="size-3.5" />}>
          Student account
        </Badge>
        <h1 className="mt-3 text-2xl font-bold text-ink-900 sm:text-3xl">Your profile</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-500">
          Contact details, programme information and notification preferences. Editing is
          enabled here, but nothing is persisted until the RDS-backed account service exists.
        </p>
      </header>

      <ProfileView
        student={CURRENT_STUDENT}
        stats={{
          tickets: registrations.filter((entry) => entry.status !== "cancelled").length,
          attended: registrations.filter((entry) => entry.status === "attended").length,
          registeredAt: "2026-08-18T09:00:00",
        }}
      />
    </div>
  );
}
