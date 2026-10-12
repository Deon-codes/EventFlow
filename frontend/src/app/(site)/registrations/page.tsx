import type { Metadata } from "next";
import { Ticket } from "lucide-react";
import { MyTickets } from "@/components/student/my-tickets";
import { Badge } from "@/components/ui/badge";
import { allEvents, registrationsForStudent } from "@/lib/events";
import { CURRENT_STUDENT } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "My tickets",
  description: "Every campus event you have registered for, with ticket codes.",
};

export default function RegistrationsPage() {
  const registrations = registrationsForStudent(CURRENT_STUDENT.id);

  return (
    <div className="space-y-6">
      <header>
        <Badge tone="brand" icon={<Ticket className="size-3.5" />}>
          {registrations.length} registrations on file
        </Badge>
        <h1 className="mt-3 text-2xl font-bold text-ink-900 sm:text-3xl">My tickets</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-500">
          Ticket codes for every event you have registered for. Show the code at the door — or
          the printed QR tile — and organizers will check you in.
        </p>
      </header>

      <MyTickets registrations={registrations} events={allEvents()} />
    </div>
  );
}
