import Link from "next/link";
import { BrandLogo } from "@/components/layout/brand-logo";

export function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-cream-200 pt-6">
      <div className="flex flex-col gap-4 pb-2 lg:flex-row lg:items-center lg:justify-between">
        <BrandLogo subtitle="Cloud campus ticketing" />
        <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <Link href="/events" className="text-ink-500 transition-colors hover:text-ink-900">
            All events
          </Link>
          <Link href="/registrations" className="text-ink-500 transition-colors hover:text-ink-900">
            My tickets
          </Link>
          <Link href="/dashboard" className="text-ink-500 transition-colors hover:text-ink-900">
            Organizer dashboard
          </Link>
          <Link href="/login" className="text-ink-500 transition-colors hover:text-ink-900">
            Sign in
          </Link>
        </nav>
      </div>
      <p className="text-xs text-ink-400">
        EventFlow · Cloud Computing Lab mini-project. Frontend milestone — data is sample
        content, and AWS EC2, Amazon RDS and Amazon S3 integrations are scheduled for the next
        milestone.
      </p>
    </footer>
  );
}
